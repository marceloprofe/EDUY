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
        if (rol === "estudiante") {
    menu.appendChild(
        crearOpcion(
            "Mis adquisiciones",
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

        if (rol === "admin") {
            menu.appendChild(
                crearOpcion(
                    "Panel administrativo",
                    rutas.panelAdmin
                )
            );
        }

        menu.appendChild(
            crearOpcion(
                `${nombre} (${rol})`,
                rutas.perfil,
                "text-warning sesion-activa"
            )
        );

        const opcionSalir =
            document.createElement("li");

        opcionSalir.className = "nav-item";

        const botonSalir =
            document.createElement("button");

        botonSalir.type = "button";
        botonSalir.className =
            "btn btn-link nav-link border-0";

        botonSalir.textContent = "Salir";

        botonSalir.addEventListener(
            "click",
            async () => {
                await signOut(auth);

                window.location.href =
                    rutas.inicio;
            }
        );

        opcionSalir.appendChild(botonSalir);
        menu.appendChild(opcionSalir);
    } catch (error) {
        console.error(
            "No fue posible consultar el perfil:",
            error
        );
    }
});