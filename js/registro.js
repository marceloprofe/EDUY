import { auth, db } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const formulario = document.querySelector("#formRegistro");
const campoNombre = document.querySelector("#nombre");
const campoCorreo = document.querySelector("#correo");
const campoContrasena = document.querySelector("#contrasena");
const campoConfirmacion = document.querySelector("#confirmarContrasena");
const mensajeRegistro = document.querySelector("#mensajeRegistro");
const botonGoogle = document.querySelector("#btnGoogle");

const botonRegistrar = formulario.querySelector(
    'button[type="submit"]'
);

function mostrarMensaje(texto, tipo) {
    mensajeRegistro.textContent = texto;
    mensajeRegistro.className = `alert alert-${tipo}`;
}

function obtenerMensajeError(codigo) {
    const mensajes = {
        "auth/email-already-in-use":
            "Ya existe una cuenta con ese correo electrónico.",
        "auth/invalid-email":
            "El correo electrónico no es válido.",
        "auth/weak-password":
            "La contraseña debe contener al menos 8 caracteres.",
        "auth/operation-not-allowed":
            "El registro no está habilitado en Firebase.",
        "auth/popup-closed-by-user":
            "Se cerró la ventana de Google antes de completar el registro.",
        "auth/popup-blocked":
            "El navegador bloqueó la ventana de Google.",
        "auth/cancelled-popup-request":
            "El registro con Google fue cancelado.",
        "permission-denied":
            "Firestore no permitió guardar el perfil."
    };

    return mensajes[codigo] || "No fue posible crear la cuenta.";
}

async function guardarPerfilEstudiante(usuario, nombre) {
    const referenciaUsuario = doc(
        db,
        "usuarios",
        usuario.uid
    );

    const documentoUsuario = await getDoc(
        referenciaUsuario
    );

    // Evita sobrescribir el rol de una cuenta existente.
    if (documentoUsuario.exists()) {
        return;
    }

    await setDoc(referenciaUsuario, {
        nombre:
            nombre ||
            usuario.displayName ||
            "Estudiante",
        correo: usuario.email,
        rol: "estudiante",
        fechaCreacion: serverTimestamp()
    });
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = campoNombre.value.trim();
    const correo = campoCorreo.value.trim();
    const contrasena = campoContrasena.value;
    const confirmacion = campoConfirmacion.value;

    if (contrasena !== confirmacion) {
        mostrarMensaje(
            "Las contraseñas no coinciden.",
            "danger"
        );
        return;
    }

    botonRegistrar.disabled = true;
    botonRegistrar.textContent =
        "Creando cuenta...";

    try {
        const credencial =
            await createUserWithEmailAndPassword(
                auth,
                correo,
                contrasena
            );

        await updateProfile(credencial.user, {
            displayName: nombre
        });

        await guardarPerfilEstudiante(
            credencial.user,
            nombre
        );

        mostrarMensaje(
            "Cuenta de estudiante creada correctamente.",
            "success"
        );

        formulario.reset();

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);
    } catch (error) {
        console.error(
            "Error al registrar:",
            error
        );

        mostrarMensaje(
            obtenerMensajeError(error.code),
            "danger"
        );
    } finally {
        botonRegistrar.disabled = false;
        botonRegistrar.textContent =
            "Registrarse";
    }
});

botonGoogle.addEventListener("click", async () => {
    botonGoogle.disabled = true;
    botonGoogle.textContent =
        "Conectando con Google...";

    try {
        const proveedorGoogle =
            new GoogleAuthProvider();

        const resultado = await signInWithPopup(
            auth,
            proveedorGoogle
        );

        await guardarPerfilEstudiante(
            resultado.user,
            resultado.user.displayName
        );

        mostrarMensaje(
            "Cuenta de estudiante creada correctamente con Google.",
            "success"
        );

        setTimeout(() => {
            window.location.href = "../index.html";
        }, 1500);
    } catch (error) {
        console.error(
            "Error con Google:",
            error
        );

        mostrarMensaje(
            obtenerMensajeError(error.code),
            "danger"
        );
    } finally {
        botonGoogle.disabled = false;
        botonGoogle.innerHTML = `
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                width="20"
                height="20"
                alt=""
                class="me-2">
            Continuar con Google
        `;
    }
});