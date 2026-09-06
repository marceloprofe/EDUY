import { auth } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const formulario = document.querySelector("#formLogin");
const campoCorreo = document.querySelector("#correo");
const campoContrasena = document.querySelector("#contrasena");
const campoRecordarme = document.querySelector("#recordarme");
const mensajeLogin = document.querySelector("#mensajeLogin");

const botonIngresar = formulario.querySelector(
  'button[type="submit"]'
);

function mostrarMensaje(texto, tipo) {
  mensajeLogin.textContent = texto;
  mensajeLogin.className = `alert alert-${tipo}`;
}

function obtenerMensajeError(codigo) {
  const mensajes = {
    "auth/invalid-email":
      "El correo electrónico no es válido.",
    "auth/invalid-credential":
      "El correo o la contraseña son incorrectos.",
    "auth/user-disabled":
      "Esta cuenta está deshabilitada.",
    "auth/too-many-requests":
      "Demasiados intentos. Intenta más tarde."
  };

  return (
    mensajes[codigo] ||
    "No fue posible iniciar sesión."
  );
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const correo = campoCorreo.value.trim();
  const contrasena = campoContrasena.value;

  botonIngresar.disabled = true;
  botonIngresar.textContent = "Ingresando...";

  try {
    const persistencia = campoRecordarme.checked
      ? browserLocalPersistence
      : browserSessionPersistence;

    await setPersistence(auth, persistencia);

    await signInWithEmailAndPassword(
      auth,
      correo,
      contrasena
    );

    mostrarMensaje(
      "Inicio de sesión correcto.",
      "success"
    );

    window.location.href = "../index.html";
  } catch (error) {
    mostrarMensaje(
      obtenerMensajeError(error.code),
      "danger"
    );
  } finally {
    botonIngresar.disabled = false;
    botonIngresar.textContent = "Ingresar";
  }
});