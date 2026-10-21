import { auth, db } from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const formulario = document.querySelector("#formLogin");
const campoCorreo = document.querySelector("#correo");
const campoContrasena = document.querySelector("#contrasena");
const campoRecordarme = document.querySelector("#recordarme");
const mensajeLogin = document.querySelector("#mensajeLogin");
const botonRecuperar = document.querySelector(
  "#btnRecuperarContrasena"
);
const botonGoogle = document.querySelector("#btnGoogle");

const botonIngresar = formulario.querySelector(
  'button[type="submit"]'
);

function mostrarMensaje(texto, tipo) {
  mensajeLogin.textContent = texto;
  mensajeLogin.className = `alert alert-${tipo}`;
}

function obtenerMensajeError(
  codigo,
  mensajePredeterminado = "No fue posible iniciar sesión."
) {
  const mensajes = {
    "auth/invalid-email":
      "El correo electrónico no es válido.",
    "auth/invalid-credential":
      "El correo o la contraseña son incorrectos.",
    "auth/user-disabled":
      "Esta cuenta está deshabilitada.",
    "auth/too-many-requests":
      "Demasiados intentos. Intenta más tarde.",
    "auth/popup-closed-by-user":
      "Se cerró la ventana de Google antes de completar el ingreso.",
    "auth/popup-blocked":
      "El navegador bloqueó la ventana de Google.",
    "auth/cancelled-popup-request":
      "El ingreso con Google fue cancelado.",
    "auth/account-exists-with-different-credential":
      "Ya existe una cuenta con ese correo. Ingresá con el método utilizado al registrarte.",
    "auth/unauthorized-domain":
      "Este dominio no está autorizado para ingresar con Google en Firebase.",
    "auth/operation-not-allowed":
      "El ingreso con Google no está habilitado en Firebase.",
    "auth/network-request-failed":
      "No fue posible conectar con Google. Revisá tu conexión.",
    "permission-denied":
      "Firestore no permitió guardar el perfil."
  };

  return (
    mensajes[codigo] ||
    mensajePredeterminado
  );
}

async function configurarPersistencia() {
  const persistencia = campoRecordarme.checked
    ? browserLocalPersistence
    : browserSessionPersistence;

  await setPersistence(auth, persistencia);
}

async function asegurarPerfilEstudiante(usuario) {
  const referenciaUsuario = doc(db, "usuarios", usuario.uid);
  const documentoUsuario = await getDoc(referenciaUsuario);

  if (documentoUsuario.exists()) {
    return;
  }

  await setDoc(referenciaUsuario, {
    nombre: usuario.displayName || "Estudiante",
    correo: usuario.email || "",
    rol: "estudiante",
    fechaCreacion: serverTimestamp()
  });
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const correo = campoCorreo.value.trim();
  const contrasena = campoContrasena.value;

  botonIngresar.disabled = true;
  botonIngresar.textContent = "Ingresando...";

  try {
    await configurarPersistencia();

    await signInWithEmailAndPassword(
      auth,
      correo,
      contrasena
    );

    mostrarMensaje(
      "Inicio de sesión correcto.",
      "success"
    );

    window.location.href = "./perfil.html";
  } catch (error) {
    mostrarMensaje(
      obtenerMensajeError(
        error.code),
      "danger"
    );
  } finally {
    botonIngresar.disabled = false;
    botonIngresar.textContent = "Ingresar";
  }
});

botonGoogle.addEventListener("click", async () => {
  botonGoogle.disabled = true;
  botonGoogle.textContent = "Conectando con Google...";

  try {
    await configurarPersistencia();

    const proveedorGoogle = new GoogleAuthProvider();
    proveedorGoogle.setCustomParameters({
      prompt: "select_account"
    });
    const resultado = await signInWithPopup(auth, proveedorGoogle);

    await asegurarPerfilEstudiante(resultado.user);

    mostrarMensaje(
      "Inicio de sesión con Google correcto.",
      "success"
    );

    window.location.href = "./perfil.html";
  } catch (error) {
    console.error("Error al ingresar con Google:", error);
    mostrarMensaje(
      obtenerMensajeError(
        error.code,
        "No fue posible iniciar sesión con Google."
      ),
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
        class="me-2"
      />
      Continuar con Google
    `;
  }
});

botonRecuperar.addEventListener("click", async () => {
  const correo = campoCorreo.value.trim();

  if (correo === "") {
    mostrarMensaje(
      "Escribe tu correo electrónico para recuperar la contraseña.",
      "warning"
    );
    campoCorreo.focus();
    return;
  }

  botonRecuperar.disabled = true;
  botonRecuperar.textContent = "Enviando...";

  try {
    await sendPasswordResetEmail(auth, correo);

    mostrarMensaje(
      "Revisa tu correo. Te enviamos un enlace para cambiar la contraseña.",
      "success"
    );
  } catch (error) {
    mostrarMensaje(
      obtenerMensajeError(error.code, "No fue posible enviar el correo de recuperación."),
      "danger"
    );
  } finally {
    botonRecuperar.disabled = false;
    botonRecuperar.textContent = "¿Olvidaste tu contraseña?";
  }
});
