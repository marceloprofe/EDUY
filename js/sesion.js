import { auth } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const enlaceIngresar = document.querySelector(
    "[data-auth-login]"
);

const enlaceRegistro = document.querySelector(
    "[data-auth-registro]"
);

if (enlaceIngresar && enlaceRegistro) {
    const rutaLogin = enlaceIngresar.getAttribute("href");
    const rutaPerfil = rutaLogin.replace(
        "login.html",
        "perfil.html"
    );

    onAuthStateChanged(auth, (usuario) => {
        if (!usuario) {
            return;
        }

        enlaceIngresar.href = rutaPerfil;

enlaceIngresar.textContent = usuario.displayName
    ? `Mi perfil: ${usuario.displayName}`
    : "Mi perfil";

enlaceIngresar.classList.add("sesion-activa");

enlaceRegistro.href = "#";
enlaceRegistro.textContent = "Cerrar sesión";
enlaceRegistro.classList.add("boton-cerrar-sesion");

        enlaceRegistro.addEventListener("click", async (evento) => {
            evento.preventDefault();

            await signOut(auth);
            window.location.href = rutaLogin;
        });
    });
}