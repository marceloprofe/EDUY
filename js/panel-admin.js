import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const contenidoAdmin =
    document.querySelector("#contenidoAdmin");

const listaUsuarios =
    document.querySelector("#listaUsuarios");

const estadoUsuarios =
    document.querySelector("#estadoUsuarios");

const buscadorUsuarios =
    document.querySelector("#buscadorUsuarios");

const mensajeAdmin =
    document.querySelector("#mensajeAdmin");

let usuarios = [];
let administradorActual = null;

function mostrarMensaje(texto, tipo) {
    mensajeAdmin.textContent = texto;
    mensajeAdmin.className = `alert alert-${tipo}`;
}

function escaparHTML(texto = "") {
    const elemento = document.createElement("div");
    elemento.textContent = texto;
    return elemento.innerHTML;
}

async function comprobarAdministrador(usuario) {
    const referenciaUsuario = doc(
        db,
        "usuarios",
        usuario.uid
    );

    const documentoUsuario = await getDoc(
        referenciaUsuario
    );

    if (!documentoUsuario.exists()) {
        return null;
    }

    const datosUsuario = documentoUsuario.data();

    if (datosUsuario.rol !== "admin") {
        return null;
    }

    return datosUsuario;
}

async function cargarUsuarios() {
    estadoUsuarios.textContent = "Cargando usuarios...";

    try {
        const resultado = await getDocs(
            collection(db, "usuarios")
        );

        usuarios = resultado.docs.map(
            (documentoUsuario) => ({
                id: documentoUsuario.id,
                ...documentoUsuario.data()
            })
        );

        usuarios.sort((usuarioA, usuarioB) => {
            const nombreA =
                usuarioA.nombre ||
                usuarioA.email ||
                "";

            const nombreB =
                usuarioB.nombre ||
                usuarioB.email ||
                "";

            return nombreA.localeCompare(
                nombreB,
                "es"
            );
        });

        mostrarUsuarios(usuarios);
    } catch (error) {
        console.error(error);

        estadoUsuarios.textContent =
            "No fue posible cargar los usuarios.";

        mostrarMensaje(
            "Firestore no permitió consultar la lista de usuarios.",
            "danger"
        );
    }
}

function mostrarUsuarios(lista) {
    if (lista.length === 0) {
        listaUsuarios.innerHTML = "";

        estadoUsuarios.textContent =
            "No se encontraron usuarios.";

        return;
    }

    estadoUsuarios.textContent =
        `${lista.length} usuario(s) encontrado(s).`;

    listaUsuarios.innerHTML = lista
        .map((usuario) => {
            const nombre =
                usuario.nombre ||
                "Sin nombre";

            const correo =
                usuario.email ||
                usuario.correo ||
                "Sin correo";

            const rol =
                usuario.rol ||
                "estudiante";

            let accion = "";

            if (
                rol === "admin" ||
                usuario.id === administradorActual
            ) {
                accion = `
                    <button
                        type="button"
                        class="btn btn-sm btn-secondary"
                        disabled
                    >
                        Administrador
                    </button>
                `;
            } else if (rol === "docente") {
                accion = `
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger
                               btn-cambiar-rol"
                        data-id="${usuario.id}"
                        data-rol="estudiante"
                    >
                        Quitar rol docente
                    </button>
                `;
            } else {
                accion = `
                    <button
                        type="button"
                        class="btn btn-sm btn-oro
                               btn-cambiar-rol"
                        data-id="${usuario.id}"
                        data-rol="docente"
                    >
                        Habilitar como docente
                    </button>
                `;
            }

            return `
                <tr>
                    <td>${escaparHTML(nombre)}</td>
                    <td>${escaparHTML(correo)}</td>
                    <td>
                        <span class="badge text-bg-secondary">
                            ${escaparHTML(rol)}
                        </span>
                    </td>
                    <td>${accion}</td>
                </tr>
            `;
        })
        .join("");

    document
        .querySelectorAll(".btn-cambiar-rol")
        .forEach((boton) => {
            boton.addEventListener(
                "click",
                cambiarRolUsuario
            );
        });
}

async function cambiarRolUsuario(evento) {
    const boton = evento.currentTarget;
    const usuarioId = boton.dataset.id;
    const nuevoRol = boton.dataset.rol;

    const usuarioSeleccionado = usuarios.find(
        (usuario) => usuario.id === usuarioId
    );

    if (!usuarioSeleccionado) {
        return;
    }

    const nombre =
        usuarioSeleccionado.nombre ||
        usuarioSeleccionado.email ||
        "este usuario";

    const accion =
        nuevoRol === "docente"
            ? "habilitar como docente"
            : "quitar el rol docente";

    const confirmado = window.confirm(
        `¿Deseás ${accion} a ${nombre}?`
    );

    if (!confirmado) {
        return;
    }

    boton.disabled = true;
    boton.textContent = "Guardando...";

    try {
        await updateDoc(
            doc(db, "usuarios", usuarioId),
            {
                rol: nuevoRol,
                fechaActualizacion: serverTimestamp(),
                actualizadoPor: administradorActual
            }
        );

        mostrarMensaje(
            nuevoRol === "docente"
                ? "El usuario fue habilitado como docente."
                : "El usuario volvió al rol estudiante.",
            "success"
        );

        await cargarUsuarios();
    } catch (error) {
        console.error(error);

        mostrarMensaje(
            "No fue posible modificar el rol del usuario.",
            "danger"
        );

        boton.disabled = false;
    }
}

buscadorUsuarios.addEventListener(
    "input",
    () => {
        const texto =
            buscadorUsuarios.value
                .trim()
                .toLowerCase();

        const usuariosFiltrados = usuarios.filter(
            (usuario) => {
                const nombre =
                    usuario.nombre?.toLowerCase() ||
                    "";

                const correo =
                    (
                        usuario.email ||
                        usuario.correo ||
                        ""
                    ).toLowerCase();

                return (
                    nombre.includes(texto) ||
                    correo.includes(texto)
                );
            }
        );

        mostrarUsuarios(usuariosFiltrados);
    }
);

onAuthStateChanged(
    auth,
    async (usuario) => {
        if (!usuario) {
            window.location.href = "./login.html";
            return;
        }

        try {
            const perfilAdmin =
                await comprobarAdministrador(usuario);

            if (!perfilAdmin) {
                alert(
                    "Esta sección es exclusiva para administradores."
                );

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
    }
);