const { initializeApp } = require("firebase-admin/app");
const { randomUUID } = require("node:crypto");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");

initializeApp();

const db = getFirestore();
const rolesPermitidos = new Set(["estudiante", "docente", "admin"]);
const maxInstancias = 5;

function validarTexto(valor, etiqueta, maximo = 80) {
    if (typeof valor !== "string") {
        throw new HttpsError("invalid-argument", `${etiqueta} no es válido.`);
    }
    const limpio = valor.trim();
    if (!limpio || limpio.length > maximo) {
        throw new HttpsError("invalid-argument", `${etiqueta} debe tener entre 1 y ${maximo} caracteres.`);
    }
    return limpio;
}

async function comprobarAdmin(uid) {
    const perfil = await db.collection("usuarios").doc(uid).get();
    if (!perfil.exists || perfil.data().rol !== "admin") {
        throw new HttpsError("permission-denied", "Se requiere un perfil administrador.");
    }
}

async function crearUsuario(data, actorUid) {
    const nombre = validarTexto(data.nombre, "El nombre");
    const email = validarTexto(data.email, "El correo", 254).toLowerCase();
    const password = typeof data.password === "string" ? data.password : "";
    const rol = data.rol;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpsError("invalid-argument", "El correo electrónico no es válido.");
    }
    if (password.length < 6 || password.length > 128) {
        throw new HttpsError("invalid-argument", "La contraseña debe tener entre 6 y 128 caracteres.");
    }
    if (!rolesPermitidos.has(rol)) {
        throw new HttpsError("invalid-argument", "El rol seleccionado no es válido.");
    }

    const uid = randomUUID();
    const perfilRef = db.collection("usuarios").doc(uid);
    try {
        await perfilRef.create({
            nombre,
            correo: email,
            rol,
            fechaCreacion: FieldValue.serverTimestamp(),
            fechaActualizacion: FieldValue.serverTimestamp(),
            actualizadoPor: actorUid
        });
    } catch (error) {
        logger.error("No se pudo crear el perfil inicial del usuario.", error);
        throw new HttpsError("internal", "Firestore no pudo preparar el perfil del usuario.");
    }

    try {
        await getAuth().createUser({ uid, email, password, displayName: nombre });
    } catch (error) {
        try {
            await perfilRef.delete();
        } catch (rollbackError) {
            logger.error("Falló la limpieza del perfil después de una alta incompleta.", {
                uid,
                error: rollbackError
            });
        }
        if (error.code === "auth/email-already-exists") {
            throw new HttpsError("already-exists", "Ya existe una cuenta con ese correo.");
        }
        logger.error("No se pudo crear la cuenta de Authentication.", error);
        throw new HttpsError("internal", "No se pudo crear la cuenta; se intentó retirar el perfil temporal.");
    }

    return { uid };
}

async function actualizarUsuario(data, actorUid) {
    const uid = validarTexto(data.uid, "El identificador", 128);
    if (uid === actorUid) {
        throw new HttpsError("failed-precondition", "No podés modificar tu propio usuario desde este panel.");
    }

    const nombre = validarTexto(data.nombre, "El nombre");
    const rol = data.rol;
    if (!rolesPermitidos.has(rol)) {
        throw new HttpsError("invalid-argument", "El rol seleccionado no es válido.");
    }

    const perfilRef = db.collection("usuarios").doc(uid);
    const perfil = await perfilRef.get();
    if (!perfil.exists) throw new HttpsError("not-found", "No existe el perfil seleccionado.");
    if (perfil.data().rol === "admin") {
        throw new HttpsError("failed-precondition", "Los perfiles administradores no se modifican desde este panel.");
    }

    let cuenta;
    try {
        cuenta = await getAuth().getUser(uid);
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            throw new HttpsError("failed-precondition", "El perfil no tiene una cuenta de Firebase Authentication activa.");
        }
        throw new HttpsError("internal", "No se pudo consultar la cuenta seleccionada.");
    }

    try {
        await getAuth().updateUser(uid, { displayName: nombre });
        await perfilRef.update({
            nombre,
            rol,
            fechaActualizacion: FieldValue.serverTimestamp(),
            actualizadoPor: actorUid
        });
    } catch (error) {
        try {
            await getAuth().updateUser(uid, { displayName: cuenta.displayName || "" });
        } catch (rollbackError) {
            logger.error("No se pudo revertir el nombre en Authentication tras fallar Firestore.", {
                uid,
                error: rollbackError
            });
        }
        logger.error("No se pudo actualizar el perfil del usuario.", { uid, error });
        throw new HttpsError("internal", "No se pudo completar la modificación del usuario.");
    }

    return { uid };
}

async function eliminarUsuario(data, actorUid) {
    const uid = validarTexto(data.uid, "El identificador", 128);
    if (uid === actorUid) {
        throw new HttpsError("failed-precondition", "No podés eliminar tu propia cuenta mientras administrás el panel.");
    }

    const perfilRef = db.collection("usuarios").doc(uid);
    const perfil = await perfilRef.get();
    if (perfil.exists && perfil.data().rol === "admin") {
        throw new HttpsError("failed-precondition", "Las cuentas administradoras no se eliminan desde este panel.");
    }

    const cursos = await db.collection("cursos").where("docenteId", "==", uid).limit(1).get();
    if (!cursos.empty) {
        throw new HttpsError("failed-precondition", "No se puede eliminar este usuario mientras tenga cursos asociados.");
    }

    // Si Firestore falla luego de borrar Authentication no se puede restaurar la contraseña.
    // Por eso se elimina primero el perfil y se lo restaura si Authentication no permite borrar la cuenta.
    if (perfil.exists) await perfilRef.delete();
    try {
        await getAuth().deleteUser(uid);
    } catch (error) {
        if (error.code === "auth/user-not-found") return { uid, deleted: true };

        if (perfil.exists) {
            try {
                await perfilRef.set(perfil.data());
            } catch (rollbackError) {
                logger.error("Falló la restauración del perfil tras fallar el borrado de Authentication.", {
                    uid,
                    error: rollbackError
                });
            }
        }
        logger.error("No se pudo borrar la cuenta de Firebase Authentication.", { uid, error });
        throw new HttpsError("internal", "No se pudo eliminar la cuenta; se intentó restaurar el perfil.");
    }

    return { uid, deleted: true };
}

exports.gestionarUsuario = onCall(
    { region: "southamerica-east1", maxInstances: maxInstancias },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError("unauthenticated", "Iniciá sesión para continuar.");
        }

        await comprobarAdmin(request.auth.uid);
        const data = request.data || {};

        switch (data.action) {
            case "create":
                return crearUsuario(data, request.auth.uid);
            case "update":
                return actualizarUsuario(data, request.auth.uid);
            case "delete":
                return eliminarUsuario(data, request.auth.uid);
            default:
                throw new HttpsError("invalid-argument", "La operación solicitada no es válida.");
        }
    }
);
