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
    actualizarContadorCarrito
} from "./carrito-store.js";

const menu = document.querySelector(".navbar-nav");
const claveRolSesion = "eduyRolSesion";

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
        carrito: estaEnPages ? "./carrito.html" : "./pages/carrito.html",
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

function crearOpcionCarrito(rutas) {
    const opcion = crearOpcion("Favoritos", rutas.carrito);
    const enlace = opcion.querySelector("a");
    const contador = document.createElement("span");

    contador.id = "contadorCarrito";
    contador.className = "badge text-bg-warning ms-1 contador-carrito";
    contador.textContent = "0";
    enlace.appendChild(contador);

    return opcion;
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
        await signOut(auth);
        window.location.href = rutas.inicio;
    });

    opcion.appendChild(boton);
    return opcion;
}

function obtenerOpcionesComunes(rutas) {
    const opciones = [];

    if (opcionBusqueda) {
        opciones.push(opcionBusqueda);
    }

    opciones.push(
        crearOpcionCarrito(rutas),
        crearOpcion("Inicio", rutas.inicio),
        crearOpcion("Cursos", rutas.cursos)
    );

    return opciones;
}

function mostrarMenuVisitante(rutas) {
    menu.replaceChildren(
        ...obtenerOpcionesComunes(rutas),
        crearOpcion("Ingresar", rutas.login),
        crearOpcion("Registro", rutas.registro)
    );

    actualizarContadorCarrito();
}

function mostrarMenuAutenticado(rol, rutas) {
    const opciones = obtenerOpcionesComunes(rutas);

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

    actualizarContadorCarrito();
}

const rutasIniciales = obtenerRutas();
const rolRecordado = sessionStorage.getItem(claveRolSesion);

if (menu && rolRecordado) {
    mostrarMenuAutenticado(rolRecordado, rutasIniciales);
    menu.hidden = false;
}

onAuthStateChanged(auth, async (usuario) => {
    if (!menu) {
        return;
    }

    const rutas = obtenerRutas();

    if (!usuario) {
        sessionStorage.removeItem(claveRolSesion);
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

        sessionStorage.setItem(claveRolSesion, rol);
        mostrarMenuAutenticado(rol, rutas);
    } catch (error) {
        console.error("No fue posible consultar el perfil:", error);
        mostrarMenuAutenticado("", rutas);
    } finally {
        menu.hidden = false;
    }
});
