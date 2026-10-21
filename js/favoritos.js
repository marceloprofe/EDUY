import { db } from "./firebase-config.js";

import {
    actualizarContadorFavoritos,
    obtenerFavoritos,
    quitarDeFavoritos
} from "./favoritos-store.js";

import {
    prepararImagenes,
    resolverImagen
} from "./curso-utils.js";

import {
    doc,
    getDocFromServer
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const lista = document.querySelector("#listaFavoritos");
const estado = document.querySelector("#estadoFavoritos");
const mensaje = document.querySelector("#mensajeFavoritos");

function mostrarMensaje(texto, tipo = "info") {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo}`;
}

function ocultarMensaje() {
    mensaje.textContent = "";
    mensaje.className = "alert d-none";
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: "UYU",
        maximumFractionDigits: 0
    }).format(valor);
}

function obtenerPrecio(curso) {
    const precioGuardado = Number(curso.precio);

    if (precioGuardado > 0) {
        return precioGuardado;
    }

    const preciosPorNivel = {
        basico: 1200,
        intermedio: 1800,
        avanzado: 2400
    };

    return preciosPorNivel[curso.nivel] || 1200;
}

function crearEnlace(texto, href, clase) {
    const enlace = document.createElement("a");
    enlace.className = clase;
    enlace.href = href;
    enlace.textContent = texto;
    return enlace;
}

function crearTarjeta(curso) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "card";

    const cuerpo = document.createElement("div");
    cuerpo.className =
        "card-body d-flex flex-column flex-md-row justify-content-between gap-3";

    const contenido = document.createElement("div");
    contenido.className = "d-flex flex-column flex-sm-row gap-3 flex-grow-1";

    const imagen = document.createElement("img");
    imagen.className = "imagen-curso-favorito rounded";
    imagen.dataset.imagenCurso = "";
    imagen.src = resolverImagen(curso.imagen);
    imagen.alt = `Imagen del curso ${curso.titulo || "sin título"}`;

    const datos = document.createElement("div");

    const titulo = document.createElement("h2");
    titulo.className = "h5 mb-1";
    titulo.textContent = curso.titulo || "Curso sin título";

    const descripcion = document.createElement("p");
    descripcion.className = "text-body-secondary mb-2";
    descripcion.textContent = curso.descripcion || "Sin descripción.";

    const informacion = document.createElement("p");
    informacion.className = "mb-0 fw-semibold";
    informacion.textContent =
        `${curso.nivel || "Nivel no especificado"} · ${formatearMoneda(obtenerPrecio(curso))}`;

    datos.append(titulo, descripcion, informacion);

    const acciones = document.createElement("div");
    acciones.className = "d-grid gap-2 align-self-md-center";

    const idCodificado = encodeURIComponent(curso.id);
    const enlaceDetalle = crearEnlace(
        "Ver detalle",
        `./detalle.html?cursoId=${idCodificado}`,
        "btn btn-outline-secondary"
    );
    const enlaceAdquisicion = crearEnlace(
        "Adquirir ahora",
        `./adquisicion.html?cursoId=${idCodificado}`,
        "btn btn-oro"
    );

    const botonQuitar = document.createElement("button");
    botonQuitar.type = "button";
    botonQuitar.className = "btn btn-outline-danger";
    botonQuitar.textContent = "Quitar de favoritos";
    botonQuitar.setAttribute(
        "aria-label",
        `Quitar ${curso.titulo || "curso"} de favoritos`
    );
    botonQuitar.addEventListener("click", () => {
        quitarDeFavoritos(curso.id);
    });

    contenido.append(imagen, datos);
    acciones.append(enlaceDetalle, enlaceAdquisicion, botonQuitar);
    cuerpo.append(contenido, acciones);
    tarjeta.append(cuerpo);

    return tarjeta;
}

async function cargarFavoritos() {
    const ids = obtenerFavoritos();

    lista.replaceChildren();
    ocultarMensaje();

    if (ids.length === 0) {
        estado.textContent = "Todavía no agregaste cursos a favoritos.";
        actualizarContadorFavoritos();
        return;
    }

    estado.textContent = "Consultando cursos…";

    try {
        const resultados = await Promise.all(
            ids.map(async (id) => {
                const resultado = await getDocFromServer(doc(db, "cursos", id));

                return resultado.exists()
                    ? { id: resultado.id, ...resultado.data() }
                    : null;
            })
        );

        const cursosDisponibles = resultados.filter(
            (curso) => curso && curso.habilitado === true
        );
        const idsNoDisponibles = ids.filter(
            (id) => !cursosDisponibles.some((curso) => curso.id === id)
        );

        idsNoDisponibles.forEach(quitarDeFavoritos);
        lista.replaceChildren(...cursosDisponibles.map(crearTarjeta));
        prepararImagenes(lista);
        estado.textContent = cursosDisponibles.length
            ? `${cursosDisponibles.length} curso${cursosDisponibles.length === 1 ? "" : "s"} guardado${cursosDisponibles.length === 1 ? "" : "s"}.`
            : "No quedan cursos disponibles en favoritos.";

        actualizarContadorFavoritos();

        if (idsNoDisponibles.length > 0) {
            mostrarMensaje(
                "Quitamos de favoritos los cursos que ya no están disponibles.",
                "warning"
            );
        }
    } catch (error) {
        console.error("No fue posible cargar los favoritos:", error);
        estado.textContent =
            "No pudimos consultar los cursos. Revisá tu conexión e intentá nuevamente.";
    }
}

document.addEventListener("favoritosActualizados", cargarFavoritos);
window.addEventListener("storage", cargarFavoritos);

cargarFavoritos();
