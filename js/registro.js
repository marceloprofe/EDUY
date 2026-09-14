import { auth, db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const formulario = document.querySelector("#formRegistro");
const campoNombre = document.querySelector("#nombre");
const campoCorreo = document.querySelector("#correo");
const campoRol = document.querySelector("#rol");
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
    "auth/email-already-in-use":
      "Ya existe una cuenta con ese correo.",
    "auth/invalid-email":
      "El correo electrónico no es válido.",
    "auth/weak-password":
      "La contraseña es demasiado débil.",
    "auth/operation-not-allowed":
      "El registro no está habilitado en Firebase.",
    "permission-denied":
      "Firestore no permitió guardar el perfil."
  };

  return mensajes[codigo] || "No fue posible crear la cuenta.";
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nombre = campoNombre.value.trim();
  const correo = campoCorreo.value.trim();
  const rol = campoRol.value;
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
  botonRegistrar.textContent = "Creando cuenta...";

  try {
    const credencial = await createUserWithEmailAndPassword(
      auth,
      correo,
      contrasena
    );

    await updateProfile(credencial.user, {
      displayName: nombre
    });

    await setDoc(doc(db, "usuarios", credencial.user.uid), {
      nombre,
      correo,
      rol,
      fechaCreacion: serverTimestamp()
    });

    mostrarMensaje(
      "Cuenta creada correctamente.",
      "success"
    );

    formulario.reset();

    setTimeout(() => {
      window.location.href = "./perfil.html";
    }, 1500);
  } catch (error) {
    console.error("Error al registrar:", error);

    mostrarMensaje(
      obtenerMensajeError(error.code),
      "danger"
    );
  } finally {
    botonRegistrar.disabled = false;
    botonRegistrar.textContent = "Registrarse";
  }
});