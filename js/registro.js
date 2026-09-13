import { auth } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const formulario = document.querySelector("#formRegistro");
const campoNombre = document.querySelector("#nombre");
const campoCorreo = document.querySelector("#correo");
const campoContrasena = document.querySelector("#contrasena");
const campoConfirmacion = document.querySelector("#confirmarContrasena");
const mensajeRegistro = document.querySelector("#mensajeRegistro");

const botonRegistrar = formulario.querySelector(
  'button[type="submit"]'
);

function mostrarMensaje(texto, tipo) {
    mensajeRegistro.textContent = texto;
    mensajeRegistro.className = `alert alert-${tipo}`;
}
function obtenerMensajeError(codigo) {
    const mensajes = {
        "auth/email-already-in-use": "El correo electrónico ya está en uso.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/weak-password": "La contraseña es demasiado débil.",  
        "auth/missing-password": "La contraseña es obligatoria.",
        };
        return mensajes[codigo] || "La cuenta no se pudo crear correctamente";
}