import { auth, authAltaUsuario, db, functions } from "./firebase-config.js";

import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    deleteUser,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocFromServer,
    getDocsFromServer,
    setDoc,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    httpsCallable
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js";

const contenidoAdmin = document.querySelector("#contenidoAdmin");
const listaUsuarios = document.querySelector("#listaUsuarios");
const estadoUsuarios = document.querySelector("#estadoUsuarios");
const buscadorUsuarios = document.querySelector("#buscadorUsuarios");
const mensajeAdmin = document.querySelector("#mensajeAdmin");
const formularioUsuario = document.querySelector("#formUsuario");
const modalUsuario = new bootstrap.Modal(
    document.querySelector("#modalUsuario")
);
const btnNuevoUsuario = document.querySelector("#btnNuevoUsuario");
const btnGuardarUsuario = document.querySelector("#btnGuardarUsuario");
const tituloModalUsuario = document.querySelector("#tituloModalUsuario");
const campoId = document.querySelector("#usuarioId");
const campoNombre = document.querySelector("#usuarioNombre");
const campoEmail = document.querySelector("#usuarioEmail");
const campoContrasena = document.querySelector("#usuarioContrasena");
const campoRol = document.querySelector("#usuarioRol");
const contenedorContrasena = document.querySelector("#contenedorContrasena");

const gestionarUsuario = httpsCallable(functions, "gestionarUsuario");

let usuarios = [];
let administradorActual = null;
let modoFormulario = "crear";

function mostrarMensaje(texto, tipo) {
    mensajeAdmin.textContent = texto;
    mensajeAdmin.className = `alert alert-${tipo}`;
}

function escaparHTML(texto = "") {
    const elemento = document.createElement("div");
    elemento.textContent = String(texto);
    return elemento.innerHTML;
}

async function comprobarAdministrador(usuario) {
    const referenciaUsuario = doc(db, "usuarios", usuario.uid);
    const documentoUsuario = await getDoc(referenciaUsuario);

    if (!documentoUsuario.exists()) return null;

    const datosUsuario = documentoUsuario.data();
    return datosUsuario.rol === "admin" ? datosUsuario : null;
}

async function cargarUsuarios() {
    estadoUsuarios.textContent = "Cargando usuarios...";

    try {
        const resultado = await getDocsFromServer(collection(db, "usuarios"));
        usuarios = resultado.docs.map((documentoUsuario) => ({
            id: documentoUsuario.id,
            ...documentoUsuario.data()
        }));

        usuarios.sort((usuarioA, usuarioB) => {
            const nombreA = usuarioA.nombre || usuarioA.correo || "";
            const nombreB = usuarioB.nombre || usuarioB.correo || "";
            return nombreA.localeCompare(nombreB, "es");
        });

        filtrarUsuarios();
    } catch (error) {
        console.error(error);
        estadoUsuarios.textContent = "No fue posible cargar los usuarios.";
        mostrarMensaje(
            "Firestore no permitió consultar la lista de usuarios.",
            "danger"
        );
    }
}

function mostrarUsuarios(lista) {
    if (lista.length === 0) {
        listaUsuarios.innerHTML = "";
        estadoUsuarios.textContent = "No se encontraron usuarios.";
        return;
    }

    estadoUsuarios.textContent = `${lista.length} usuario(s) encontrado(s).`;
    listaUsuarios.innerHTML = lista.map((usuario) => {
        const nombre = usuario.nombre || "Sin nombre";
        const correo = usuario.correo || usuario.email || "Sin correo";
        const rol = usuario.rol || "estudiante";
        const rolVisible = {
            estudiante: "Estudiante",
            docente: "Docente",
            admin: "Administrador"
        }[rol] || rol;
        const protegido = rol === "admin" || usuario.id === administradorActual;
        const acciones = protegido
            ? '<span class="text-body-secondary">Protegido</span>'
            : `
                <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary btn-editar-usuario" data-id="${escaparHTML(usuario.id)}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-usuario" data-id="${escaparHTML(usuario.id)}">Eliminar</button>
                </div>
            `;

        return `
            <tr>
                <td>${escaparHTML(nombre)}</td>
                <td>${escaparHTML(correo)}</td>
                <td><span class="badge text-bg-secondary">${escaparHTML(rolVisible)}</span></td>
                <td>${acciones}</td>
            </tr>
        `;
    }).join("");

    listaUsuarios.querySelectorAll(".btn-editar-usuario")
        .forEach((boton) => boton.addEventListener("click", abrirEdicion));
    listaUsuarios.querySelectorAll(".btn-eliminar-usuario")
        .forEach((boton) => boton.addEventListener("click", eliminarUsuario));
}

function filtrarUsuarios() {
    const texto = buscadorUsuarios.value.trim().toLocaleLowerCase("es");
    const filtrados = usuarios.filter((usuario) => {
        const nombre = (usuario.nombre || "").toLocaleLowerCase("es");
        const correo = (usuario.correo || usuario.email || "").toLocaleLowerCase("es");
        return nombre.includes(texto) || correo.includes(texto);
    });
    mostrarUsuarios(filtrados);
}

function abrirAlta() {
    modoFormulario = "crear";
    formularioUsuario.reset();
    campoId.value = "";
    campoEmail.disabled = false;
    campoContrasena.required = true;
    contenedorContrasena.classList.remove("d-none");
    campoRol.value = "estudiante";
    tituloModalUsuario.textContent = "Crear usuario";
    btnGuardarUsuario.textContent = "Crear usuario";
    modalUsuario.show();
}

function abrirEdicion(evento) {
    const usuario = usuarios.find((item) => item.id === evento.currentTarget.dataset.id);
    if (!usuario) return;

    modoFormulario = "editar";
    formularioUsuario.reset();
    campoId.value = usuario.id;
    campoNombre.value = usuario.nombre || "";
    campoEmail.value = usuario.correo || usuario.email || "";
    campoEmail.disabled = true;
    campoContrasena.required = false;
    contenedorContrasena.classList.add("d-none");
    // El formulario usa etiquetas visibles y conserva el valor canónico guardado.
    campoRol.value = ["estudiante", "docente", "admin"].includes(usuario.rol)
        ? usuario.rol
        : "estudiante";
    tituloModalUsuario.textContent = "Modificar usuario";
    btnGuardarUsuario.textContent = "Guardar cambios";
    modalUsuario.show();
}

function mensajeError(error) {
    const mensajes = {
        "functions/unauthenticated": "La sesión expiró. Iniciá sesión nuevamente.",
        "functions/permission-denied": "No tenés permisos para administrar usuarios.",
        "permission-denied": "Firestore rechazó el cambio. Verificá que las reglas estén desplegadas y que tu perfil tenga rol administrador.",
        "auth/email-already-in-use": "Ya existe una cuenta con ese correo electrónico.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/operation-not-allowed": "El acceso con correo y contraseña no está habilitado en Firebase Authentication.",
        "functions/invalid-argument": "Revisá los datos ingresados.",
        "functions/already-exists": "Ya existe una cuenta con ese correo.",
        "functions/not-found": "No se encontró la cuenta seleccionada.",
        "functions/failed-precondition": error.message || "No se puede eliminar este usuario en su estado actual.",
        "functions/unavailable": "La baja requiere desplegar gestionarUsuario; Firebase indica que este proyecto debe pasar al plan Blaze para usar Cloud Functions.",
        "functions/internal": error.message || "La función de Firebase no pudo guardar los cambios. Revisá sus registros de ejecución.",
        "local/profile-not-updated": "La operación terminó, pero Firestore no confirma el nombre y rol nuevos. El modal sigue abierto; revisá la función desplegada y volvé a intentar."
    };
    if (error.cleanupFailed) {
        return "No se pudo guardar el perfil y Firebase no pudo retirar la cuenta temporal. Revisá Authentication antes de reintentar.";
    }
    return mensajes[error.code] || "No fue posible completar la operación.";
}

async function crearCuentaUsuario(data) {
    const credencial = await createUserWithEmailAndPassword(
        authAltaUsuario,
        data.email,
        data.password
    );

    try {
        await updateProfile(credencial.user, { displayName: data.nombre });
        await setDoc(doc(db, "usuarios", credencial.user.uid), {
            nombre: data.nombre,
            correo: data.email,
            rol: data.rol,
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp(),
            actualizadoPor: administradorActual
        });
        return { uid: credencial.user.uid };
    } catch (error) {
        try {
            await deleteUser(credencial.user);
        } catch (errorLimpieza) {
            error.cleanupFailed = true;
            console.error("No se pudo eliminar la cuenta temporal de Authentication.", errorLimpieza);
        }
        throw error;
    } finally {
        try {
            await signOut(authAltaUsuario);
        } catch (errorCierre) {
            console.warn("No se pudo cerrar la sesión de la instancia secundaria.", errorCierre);
        }
    }
}

async function guardarUsuario(evento) {
    evento.preventDefault();
    const nombre = campoNombre.value.trim();
    const data = modoFormulario === "crear"
        ? {
            action: "create",
            nombre,
            email: campoEmail.value.trim().toLowerCase(),
            password: campoContrasena.value,
            rol: campoRol.value
        }
        : {
            action: "update",
            uid: campoId.value,
            nombre,
            rol: campoRol.value
        };

    btnGuardarUsuario.disabled = true;
    btnGuardarUsuario.textContent = "Guardando...";

    try {
        if (modoFormulario === "crear") {
            await crearCuentaUsuario(data);
        } else {
            await updateDoc(doc(db, "usuarios", data.uid), {
                nombre,
                rol: data.rol,
                fechaActualizacion: serverTimestamp(),
                actualizadoPor: administradorActual
            });
        }

        if (modoFormulario === "editar") {
            const perfilActual = await getDocFromServer(doc(db, "usuarios", data.uid));
            const datosActuales = perfilActual.exists() ? perfilActual.data() : null;

            if (
                !datosActuales ||
                datosActuales.nombre !== nombre ||
                datosActuales.rol !== data.rol
            ) {
                const errorVerificacion = new Error("Firestore no devolvió los datos solicitados.");
                errorVerificacion.code = "local/profile-not-updated";
                throw errorVerificacion;
            }
        }

        modalUsuario.hide();
        mostrarMensaje(
            modoFormulario === "crear"
                ? "Usuario creado correctamente."
                : "Usuario modificado correctamente.",
            "success"
        );
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(mensajeError(error), "danger");
    } finally {
        btnGuardarUsuario.disabled = false;
        btnGuardarUsuario.textContent = modoFormulario === "crear"
            ? "Crear usuario"
            : "Guardar cambios";
    }
}

async function eliminarUsuario(evento) {
    const boton = evento.currentTarget;
    const usuario = usuarios.find((item) => item.id === boton.dataset.id);
    if (!usuario) return;

    const nombre = usuario.nombre || usuario.correo || "este usuario";
    if (!window.confirm(`¿Eliminar la cuenta de ${nombre}? Esta acción no se puede deshacer.`)) return;

    boton.disabled = true;
    boton.textContent = "Eliminando...";

    try {
        await gestionarUsuario({ action: "delete", uid: usuario.id });
        mostrarMensaje("Usuario eliminado de Authentication y Firestore.", "success");
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(mensajeError(error), "danger");
        boton.disabled = false;
        boton.textContent = "Eliminar";
    }
}

btnNuevoUsuario.addEventListener("click", abrirAlta);
formularioUsuario.addEventListener("submit", guardarUsuario);
buscadorUsuarios.addEventListener("input", filtrarUsuarios);

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        window.location.href = "./login.html";
        return;
    }

    try {
        const perfilAdmin = await comprobarAdministrador(usuario);
        if (!perfilAdmin) {
            alert("Esta sección es exclusiva para administradores.");
            window.location.href = "../index.html";
            return;
        }

        administradorActual = usuario.uid;
        contenidoAdmin.classList.remove("d-none");
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(
            "No fue posible verificar el perfil administrador.",
            "danger"
        );
    }
});
