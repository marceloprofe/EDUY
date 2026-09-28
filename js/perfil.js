import { auth, db } from "./firebase-config.js";

import{
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const cargandoPerfil=document.querySelector("#cargandoPerfil");
const contenidoperfil = document.querySelector("#contenidoPerfil");
const nombreUsuario = document.querySelector("#nombreUsuario");
const correoUsuario = document.querySelector("#correoUsuario");
const rolUsuario = document.querySelector("#rolUsuario");
const botonCerrarSesion = document.querySelector("#btnCerrarSesion");

onAuthStateChanged(auth, async (usuario) => {
  if (!usuario) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const referencia = doc(db, "usuarios", usuario.uid);
    const documento = await getDoc(referencia);
    const datos = documento.exists() ? documento.data() : {};

    nombreUsuario.textContent =
      datos.nombre || usuario.displayName || "Usuario de EDUY";

    correoUsuario.textContent = usuario.email;
    rolUsuario.textContent = datos.rol || "Sin rol asignado";
  } catch (error) {
    console.error("No se pudo cargar el perfil:", error);
    rolUsuario.textContent = "No disponible";
  } finally {
    cargandoPerfil.classList.add("d-none");
    contenidoperfil.classList.remove("d-none");
  }
});

botonCerrarSesion.addEventListener("click", async () => {
    try {
        botonCerrarSesion.disabled = true;
        botonCerrarSesion.textContent = "Cerrando sesión...";
        await signOut(auth);
        window.location.href = "./login.html";
    } catch (error) {
        console.error("No se pudo cerrar la sesión:", error);
        botonCerrarSesion.disabled = false;
        botonCerrarSesion.textContent = "Cerrar sesión";

    }
});