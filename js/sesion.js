import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    actualizarContadorFavoritos
} from "./favoritos-store.js";

const menu = document.querySelector(".navbar-nav");
const claveRolSesion = "eduyRolSesion";
const claveNombreSesion = "eduyNombreSesion";
const barraSesion = document.createElement("div");
barraSesion.className = "barra-sesion-usuario";
barraSesion.setAttribute("role", "region");
barraSesion.setAttribute("aria-label", "Información de la sesión");
barraSesion.hidden = true;
barraSesion.innerHTML = `
    <div class="container d-flex flex-wrap align-items-center justify-content-end gap-2 py-2">
        <span class="barra-sesion-nombre"></span>
        <span class="barra-sesion-rol"></span>
    </div>`;

const nodoNombreSesion = barraSesion.querySelector(".barra-sesion-nombre");
const nodoRolSesion = barraSesion.querySelector(".barra-sesion-rol");
menu?.closest("nav")?.insertAdjacentElement("afterend", barraSesion);

const opcionBusqueda =
    menu
        ?.querySelector(".boton-busqueda-nav")
        ?.closest(".nav-item") || null;

function obtenerRutas() {
    const estaEnPages =
        window.location.pathname.includes("/pages/");

    return {
        inicio: estaEnPages ? "../index.html" : "./index.html",
        cursos: estaEnPages ? "./cursos.html" : "./pages/cursos.html",
        favoritos: estaEnPages ? "./favoritos.html" : "./pages/favoritos.html",
        login: estaEnPages ? "./login.html" : "./pages/login.html",
        registro: estaEnPages ? "./registro.html" : "./pages/registro.html",
        perfil: estaEnPages ? "./perfil.html" : "./pages/perfil.html",
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

function esRutaActual(enlace) {
    const destino = new URL(enlace, window.location.href);
    return destino.pathname === window.location.pathname;
}

function crearOpcion(texto, enlace) {
    const elementoLista = document.createElement("li");
    elementoLista.className = "nav-item";

    const elementoEnlace = document.createElement("a");
    elementoEnlace.className = "nav-link";
    elementoEnlace.href = enlace;
    elementoEnlace.textContent = texto;

    if (esRutaActual(enlace)) {
        elementoEnlace.classList.add("active");
        elementoEnlace.setAttribute("aria-current", "page");
    }

    elementoLista.appendChild(elementoEnlace);
    return elementoLista;
}

function crearOpcionFavoritos(rutas) {
    const opcion = crearOpcion("Favoritos", rutas.favoritos);
    const enlace = opcion.querySelector("a");
    const contador = document.createElement("span");

    contador.id = "contadorFavoritos";
    contador.className = "badge text-bg-warning ms-1 contador-favoritos";
    contador.textContent = "0";
    enlace.appendChild(contador);

    return opcion;
}

function obtenerEtiquetaRol(rol) {
    const etiquetas = {
        admin: "Administrador",
        docente: "Docente",
        estudiante: "Estudiante"
    };

    return etiquetas[rol] || (rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : "No disponible");
}

function crearOpcionSalir(rutas) {
    const opcion = document.createElement("li");
    opcion.className = "nav-item";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className =
        "btn btn-link nav-link border-0 boton-cerrar-sesion";
    boton.textContent = "Cerrar sesión";
    boton.addEventListener("click", async () => {
        boton.disabled = true;
        sessionStorage.removeItem(claveRolSesion);
        sessionStorage.removeItem(claveNombreSesion);
        await signOut(auth);
        window.location.href = rutas.inicio;
    });

    opcion.appendChild(boton);
    return opcion;
}

function obtenerOpcionesComunes(rutas, incluirFavoritos = false) {
    const opciones = [];

    if (opcionBusqueda) {
        opciones.push(opcionBusqueda);
    }

    if (incluirFavoritos) {
        opciones.push(crearOpcionFavoritos(rutas));
    }

    opciones.push(
        crearOpcion("Inicio", rutas.inicio),
        crearOpcion("Cursos", rutas.cursos)
    );

    return opciones;
}

function mostrarMenuVisitante(rutas) {
    barraSesion.hidden = true;
    menu.replaceChildren(
        ...obtenerOpcionesComunes(rutas),
        crearOpcion("Ingresar", rutas.login),
        crearOpcion("Registro", rutas.registro)
    );

    actualizarContadorFavoritos();
}

function mostrarMenuAutenticado(rol, rutas, nombre = "") {
    barraSesion.hidden = false;
    nodoNombreSesion.textContent = nombre || "Usuario";
    nodoRolSesion.textContent = obtenerEtiquetaRol(rol);

    const opciones = obtenerOpcionesComunes(rutas, true);

    if (rol === "estudiante") {
        opciones.push(
            crearOpcion("Mis cursos", rutas.misAdquisiciones)
        );
    }

    if (rol === "docente") {
        opciones.push(
            crearOpcion("Mis cursos", rutas.misCursos)
        );
    }

    opciones.push(crearOpcion("Mi perfil", rutas.perfil));

    if (rol === "admin") {
        opciones.push(
            crearOpcion("Administración", rutas.panelAdmin)
        );
    }

    opciones.push(crearOpcionSalir(rutas));
    menu.replaceChildren(...opciones);

    actualizarContadorFavoritos();
}

const rutasIniciales = obtenerRutas();
const rolRecordado = sessionStorage.getItem(claveRolSesion);
const nombreRecordado =
    sessionStorage.getItem(claveNombreSesion) || "";

if (menu && rolRecordado) {
    mostrarMenuAutenticado(
        rolRecordado,
        rutasIniciales,
        nombreRecordado
    );
    menu.hidden = false;
}

onAuthStateChanged(auth, async (usuario) => {
    if (!menu) {
        return;
    }

    const rutas = obtenerRutas();

    if (!usuario) {
        sessionStorage.removeItem(claveRolSesion);
        sessionStorage.removeItem(claveNombreSesion);
        mostrarMenuVisitante(rutas);
        menu.hidden = false;
        return;
    }

    try {
        const documentoUsuario = await getDoc(
            doc(db, "usuarios", usuario.uid)
        );

        const datosUsuario = documentoUsuario.exists()
            ? documentoUsuario.data()
            : {};

        const rol = datosUsuario.rol || "estudiante";
        const nombrePerfil =
            typeof datosUsuario.nombre === "string"
                ? datosUsuario.nombre.trim()
                : "";
        const nombre = nombrePerfil ||
            (usuario.displayName || "").trim();

        sessionStorage.setItem(claveRolSesion, rol);
        if (nombre) {
            sessionStorage.setItem(claveNombreSesion, nombre);
        } else {
            sessionStorage.removeItem(claveNombreSesion);
        }

        mostrarMenuAutenticado(rol, rutas, nombre);
    } catch (error) {
        console.error("No fue posible consultar el perfil:", error);
        mostrarMenuAutenticado(
            sessionStorage.getItem(claveRolSesion) || "",
            rutas,
            sessionStorage.getItem(claveNombreSesion) ||
                (usuario.displayName || "").trim()
        );
    } finally {
        menu.hidden = false;
    }
});
