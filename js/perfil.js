import {auth} from "./firebase-config.js";

import{
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const cargandoPerfil=document.querySelector("#cargandoPerfil");
const contenidoperfil = document.querySelector("#contenidoPerfil");
const nombreUsuario = document.querySelector("#nombreUsuario");
const correoUsuario = document.querySelector("#correoUsuario");
const botonCerrarSesion = document.querySelector("#btnCerrarSesion");

onAuthStateChanged(auth, (usuario) => {
    if (!usuario) {

}
nombreUsuario.textContent = usuario.displayName || "Usuario de EDUY";
correoUsuario.textContent = usuario.email;
cargandoPerfil.classList.add("d-none");
contenidoperfil.classList.remove("d-none");
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