import { auth, db } from "./firebase-config.js";

import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  reload,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const cargandoPerfil = document.querySelector("#cargandoPerfil");
const contenidoPerfil = document.querySelector("#contenidoPerfil");
const nombreUsuario = document.querySelector("#nombreUsuario");
const correoUsuario = document.querySelector("#correoUsuario");
const rolUsuario = document.querySelector("#rolUsuario");
const formularioEditarPerfil = document.querySelector("#formularioEditarPerfil");
const campoNombrePerfil = document.querySelector("#nombrePerfil");
const campoCorreoPerfil = document.querySelector("#correoPerfil");
const campoContrasenaActual = document.querySelector("#contrasenaActual");
const contenedorContrasenaActual = document.querySelector("#campoContrasenaActual");
const ayudaReautenticacionGoogle = document.querySelector("#ayudaReautenticacionGoogle");
const campoNuevaContrasena = document.querySelector("#nuevaContrasena");
const campoConfirmarContrasena = document.querySelector("#confirmarContrasena");
const botonEditarPerfil = document.querySelector("#botonEditarPerfil");
const botonGuardarPerfil = document.querySelector("#botonGuardarPerfil");
const botonCancelarEdicion = document.querySelector("#botonCancelarEdicion");
const mensajePerfil = document.querySelector("#mensajePerfil");

let usuarioActual = null;
let nombreGuardado = "";
let correoGuardado = "";

function mostrarMensaje(texto, tipo) {
  mensajePerfil.textContent = texto;
  mensajePerfil.className = `alert alert-${tipo}`;
}

function limpiarContrasenas() {
  campoContrasenaActual.value = "";
  campoNuevaContrasena.value = "";
  campoConfirmarContrasena.value = "";
}

function cerrarFormulario() {
  campoNombrePerfil.value = nombreGuardado;
  campoCorreoPerfil.value = correoGuardado;
  campoNombrePerfil.classList.remove("is-invalid");
  campoCorreoPerfil.classList.remove("is-invalid");
  limpiarContrasenas();
  formularioEditarPerfil.classList.add("d-none");
  botonEditarPerfil.classList.remove("d-none");
}

function mostrarNombre(nombre) {
  nombreGuardado = nombre;
  nombreUsuario.textContent = nombre || "Usuario de EDUY";
  campoNombrePerfil.value = nombre;
}

function configurarCamposDeSeguridad(usuario) {
  const proveedores = usuario.providerData.map((proveedor) => proveedor.providerId);
  const tieneContrasena = proveedores.includes("password");
  const tieneGoogle = proveedores.includes("google.com");

  contenedorContrasenaActual.classList.toggle("d-none", !tieneContrasena);
  ayudaReautenticacionGoogle.classList.toggle("d-none", !tieneGoogle || tieneContrasena);

  if (!tieneContrasena && !tieneGoogle) {
    ayudaReautenticacionGoogle.textContent =
      "Este proveedor de inicio de sesión no permite editar el correo o la contraseña desde esta página.";
    ayudaReautenticacionGoogle.classList.remove("d-none");
    campoCorreoPerfil.disabled = true;
    campoNuevaContrasena.disabled = true;
    campoConfirmarContrasena.disabled = true;
  }
}

async function confirmarIdentidad(usuario) {
  const proveedores = usuario.providerData.map((proveedor) => proveedor.providerId);

  if (proveedores.includes("password")) {
    const contrasenaActual = campoContrasenaActual.value;
    if (!contrasenaActual) {
      campoContrasenaActual.classList.add("is-invalid");
      campoContrasenaActual.focus();
      throw new Error("falta-contrasena-actual");
    }

    const credencial = EmailAuthProvider.credential(usuario.email, contrasenaActual);
    await reauthenticateWithCredential(usuario, credencial);
    return;
  }

  if (proveedores.includes("google.com")) {
    const proveedorGoogle = new GoogleAuthProvider();
    proveedorGoogle.setCustomParameters({ prompt: "select_account" });
    await reauthenticateWithPopup(usuario, proveedorGoogle);
    return;
  }

  throw new Error("proveedor-no-compatible");
}

function obtenerMensajeError(error) {
  const mensajes = {
    "falta-contrasena-actual": "Ingresá tu contraseña actual para confirmar tu identidad.",
    "proveedor-no-compatible": "Este proveedor no permite confirmar la identidad desde esta página.",
    "auth/wrong-password": "La contraseña actual no es correcta.",
    "auth/invalid-credential": "No se pudo confirmar tu identidad. Revisá la contraseña e intentá de nuevo.",
    "auth/requires-recent-login": "Volvé a confirmar tu identidad e intentá guardar nuevamente.",
    "auth/weak-password": "La nueva contraseña debe tener al menos 8 caracteres.",
    "auth/email-already-in-use": "Ese correo ya está asociado a otra cuenta.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/popup-closed-by-user": "Se cerró la ventana de Google antes de confirmar la cuenta.",
    "auth/cancelled-popup-request": "La confirmación con Google fue cancelada.",
    "auth/credential-already-in-use": "No se pudo vincular la contraseña con esta cuenta.",
    "permission-denied": "No tenés permiso para actualizar este perfil. Verificá que las reglas de Firestore estén actualizadas."
  };

  return mensajes[error.message] || mensajes[error.code] ||
    "No fue posible completar todos los cambios. Revisá los datos e intentá nuevamente.";
}

botonEditarPerfil.addEventListener("click", () => {
  mensajePerfil.classList.add("d-none");
  formularioEditarPerfil.classList.remove("d-none");
  botonEditarPerfil.classList.add("d-none");
  campoNombrePerfil.focus();
});

botonCancelarEdicion.addEventListener("click", cerrarFormulario);

campoNombrePerfil.addEventListener("input", () => {
  campoNombrePerfil.classList.remove("is-invalid");
});

campoCorreoPerfil.addEventListener("input", () => {
  campoCorreoPerfil.classList.remove("is-invalid");
});

campoContrasenaActual.addEventListener("input", () => {
  campoContrasenaActual.classList.remove("is-invalid");
});

formularioEditarPerfil.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nombre = campoNombrePerfil.value.trim();
  const correo = campoCorreoPerfil.value.trim();
  const nuevaContrasena = campoNuevaContrasena.value;
  const confirmarContrasena = campoConfirmarContrasena.value;
  const cambioNombre = nombre !== nombreGuardado;
  const cambioCorreo = correo !== correoGuardado;
  const cambioContrasena = nuevaContrasena !== "";
  const cambiosSensibles = cambioCorreo || cambioContrasena;

  if (!nombre || nombre.length > 80) {
    campoNombrePerfil.classList.add("is-invalid");
    campoNombrePerfil.focus();
    return;
  }

  if (!correo || !campoCorreoPerfil.checkValidity()) {
    campoCorreoPerfil.classList.add("is-invalid");
    campoCorreoPerfil.focus();
    return;
  }

  if (cambioContrasena && nuevaContrasena.length < 8) {
    campoNuevaContrasena.focus();
    mostrarMensaje("La nueva contraseña debe tener al menos 8 caracteres.", "warning");
    return;
  }

  if (cambioContrasena && nuevaContrasena !== confirmarContrasena) {
    campoConfirmarContrasena.focus();
    mostrarMensaje("Las nuevas contraseñas no coinciden.", "warning");
    return;
  }

  if (!cambioNombre && !cambioCorreo && !cambioContrasena) {
    mostrarMensaje("No hay cambios para guardar.", "info");
    return;
  }

  if (!usuarioActual) {
    mostrarMensaje("Tu sesión ya no está activa. Iniciá sesión nuevamente.", "danger");
    return;
  }

  botonGuardarPerfil.disabled = true;
  botonCancelarEdicion.disabled = true;
  botonGuardarPerfil.textContent = "Guardando...";

  const cambiosAplicados = [];

  try {
    if (cambiosSensibles) {
      await confirmarIdentidad(usuarioActual);
    }

    if (cambioContrasena) {
      const tieneProveedorContrasena = usuarioActual.providerData.some(
        (proveedor) => proveedor.providerId === "password"
      );

      if (tieneProveedorContrasena) {
        await updatePassword(usuarioActual, nuevaContrasena);
      } else {
        const credencial = EmailAuthProvider.credential(usuarioActual.email, nuevaContrasena);
        await linkWithCredential(usuarioActual, credencial);
      }
      cambiosAplicados.push("contraseña");
    }

    if (cambioCorreo) {
      await verifyBeforeUpdateEmail(usuarioActual, correo);
      cambiosAplicados.push("correo");
    }

    if (cambioNombre) {
      await updateDoc(doc(db, "usuarios", usuarioActual.uid), {
        nombre,
        fechaActualizacion: serverTimestamp()
      });
      cambiosAplicados.push("nombre");
      mostrarNombre(nombre);
      sessionStorage.setItem("eduyNombreSesion", nombre);

      try {
        await updateProfile(usuarioActual, { displayName: nombre });
      } catch (error) {
        console.warn("No se pudo sincronizar el nombre de Firebase Authentication:", error);
      }
    }

    cerrarFormulario();
    const avisos = [];
    if (cambiosAplicados.includes("correo")) {
      avisos.push(`Te enviamos un enlace de verificación a ${correo}; el cambio se aplicará al confirmarlo.`);
    }
    if (cambiosAplicados.includes("contraseña")) {
      avisos.push("La contraseña se actualizó.");
    }
    if (cambiosAplicados.includes("nombre")) {
      avisos.push("El nombre se actualizó.");
    }
    mostrarMensaje(avisos.join(" ") || "Tu perfil se actualizó correctamente.", "success");
  } catch (error) {
    console.error("No se pudo completar la actualización del perfil:", error);
    const detalle = obtenerMensajeError(error);
    const completados = cambiosAplicados.length
      ? `Se actualizaron ${cambiosAplicados.join(" y ")}. `
      : "";
    mostrarMensaje(`${completados}${detalle}`, "danger");
  } finally {
    botonGuardarPerfil.disabled = false;
    botonCancelarEdicion.disabled = false;
    botonGuardarPerfil.textContent = "Guardar cambios";
  }
});

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "./login.html";
    return;
  }

  usuarioActual = usuario;
  configurarCamposDeSeguridad(usuario);

  try {
    await reload(usuario);
    const referencia = doc(db, "usuarios", usuario.uid);
    const documento = await getDoc(referencia);
    const datos = documento.exists() ? documento.data() : {};

    const nombre = datos.nombre || usuario.displayName || "";
    mostrarNombre(nombre);

    correoGuardado = usuario.email || datos.correo || "";
    correoUsuario.textContent = correoGuardado || "Sin correo registrado";
    campoCorreoPerfil.value = correoGuardado;
    rolUsuario.textContent = datos.rol || "Sin rol asignado";
    document.querySelector("#enlaceMisAdquisiciones")
      .classList.toggle("d-none", datos.rol !== "estudiante");

    if (!documento.exists()) {
      botonEditarPerfil.disabled = true;
      mostrarMensaje("No encontramos un perfil asociado a esta cuenta.", "warning");
    } else if (usuario.email && datos.correo !== usuario.email) {
      try {
        await usuario.getIdToken(true);
        await updateDoc(referencia, {
          correo: usuario.email,
          fechaActualizacion: serverTimestamp()
        });
      } catch (error) {
        console.warn("No se pudo sincronizar el correo verificado con el perfil:", error);
      }
    }
  } catch (error) {
    console.error("No se pudo cargar el perfil:", error);
    mostrarMensaje("No fue posible cargar la información de tu perfil.", "danger");
    mostrarNombre(usuario.displayName || "");
    correoGuardado = usuario.email || "";
    correoUsuario.textContent = correoGuardado || "Sin correo registrado";
    campoCorreoPerfil.value = correoGuardado;
    rolUsuario.textContent = "No disponible";
    botonEditarPerfil.disabled = true;
  } finally {
    cargandoPerfil.classList.add("d-none");
    contenidoPerfil.classList.remove("d-none");
  }
});
