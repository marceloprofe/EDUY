import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const menu = document.querySelector(".navbar-nav");

function obtenerRutas() {
    const estaEnPages =
        window.location.pathname.includes("/pages/");

    return {
        inicio: estaEnPages
            ? "../index.html"
            : "./index.html",

        cursos: estaEnPages
            ? "./cursos.html"
            : "./pages/cursos.html",

        perfil: estaEnPages
            ? "./perfil.html"
            : "./pages/perfil.html",

        misAdquisiciones: estaEnPages
            ? "./mis-adquisiciones.html"
            : "./pages/mis-adquisiciones.html",

        misCursos: estaEnPages
            ? "./mis-cursos.html"
            : "./pages/mis-cursos.html",

        panelAdmin: estaEnPages
            ? "./panel-admin.html"
            : "./pages/panel-admin.html"
    };
}

function crearOpcion(texto, enlace, clases = "") {
    const elementoLista =
        document.createElement("li");

    elementoLista.className = "nav-item";

    const elementoEnlace =
        document.createElement("a");

    elementoEnlace.className =
        `nav-link ${clases}`.trim();

    elementoEnlace.href = enlace;
    elementoEnlace.textContent = texto;
    elementoEnlace.dataset.opcionSesion = "true";

    elementoLista.appendChild(elementoEnlace);

    return elementoLista;
}

function quitarOpcionesDeAcceso() {
    const enlaceLogin = document.querySelector(
        'a[href$="login.html"]'
    );

    const enlaceRegistro = document.querySelector(
        'a[href$="registro.html"]'
    );

    enlaceLogin?.closest("li")?.remove();
    enlaceRegistro?.closest("li")?.remove();
}

function crearOpcionSalir(texto, rutas) {
    const opcion = document.createElement("li");
    opcion.className = "nav-item";
    opcion.dataset.opcionSesion = "true";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "btn btn-link nav-link border-0 boton-cerrar-sesion";
    boton.textContent = texto;
    boton.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = rutas.inicio;
    });

    opcion.appendChild(boton);
    return opcion;
}

function mostrarSesionDebajo(nombre, rol, enlacePerfil) {
    let barra = document.querySelector("#sesionActivaDebajoNav");
    if (!barra) {
        barra = document.createElement("div");
        barra.id = "sesionActivaDebajoNav";
        barra.className = "barra-sesion";
        const contenedor = document.createElement("div");
        contenedor.className = "container text-end";
        barra.appendChild(contenedor);
        document.querySelector(".navbar")?.insertAdjacentElement("afterend", barra);
    }

    const contenedor = barra.firstElementChild;
    contenedor.replaceChildren();
    const texto = document.createElement("span");
    texto.className = "sesion-activa";
    texto.textContent = "Sesión iniciada: ";
    contenedor.appendChild(texto);
    const perfil = document.createElement("a");
    perfil.className = "sesion-perfil";
    perfil.href = enlacePerfil;
    perfil.textContent = `${nombre} (${rol})`;
    contenedor.appendChild(perfil);
}

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario || !menu) {
        return;
    }

    try {
        const referenciaUsuario = doc(
            db,
            "usuarios",
            usuario.uid
        );

        const documentoUsuario = await getDoc(
            referenciaUsuario
        );

        if (!documentoUsuario.exists()) {
            console.warn(
                "El usuario no tiene un perfil en Firestore."
            );
            return;
        }

        const datosUsuario =
            documentoUsuario.data();

        const nombre =
            datosUsuario.nombre ||
            usuario.displayName ||
            usuario.email;

        const rol =
            datosUsuario.rol ||
            "estudiante";

        const rutas = obtenerRutas();

        quitarOpcionesDeAcceso();
        menu.querySelectorAll("[data-opcion-sesion]").forEach((elemento) => elemento.remove());

        if (rol === "admin") {
            menu.replaceChildren(
                crearOpcion("Inicio", rutas.inicio),
                crearOpcion("Cursos", rutas.cursos),
                crearOpcion("Administración", rutas.panelAdmin),
                crearOpcionSalir("Cerrar sesión", rutas)
            );
            mostrarSesionDebajo(nombre, "Administrador", rutas.perfil);
            return;
        }

        const rolesVisibles = {
            estudiante: "Estudiante",
            docente: "Docente",
            admin: "Administrador"
        };
        mostrarSesionDebajo(nombre, rolesVisibles[rol] || rol, rutas.perfil);

        if (rol === "estudiante") {
            menu.appendChild(
                crearOpcion(
                    "Mis cursos",
                    rutas.misAdquisiciones
                )
            );
        }

        if (rol === "docente") {
            menu.appendChild(
                crearOpcion(
                    "Mis cursos",
                    rutas.misCursos
                )
            );
        }

        menu.appendChild(crearOpcionSalir("Cerrar sesión", rutas));
    } catch (error) {
        console.error(
            "No fue posible consultar el perfil:",
            error
        );
    }
});
