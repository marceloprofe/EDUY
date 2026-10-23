import { auth, db } from "./firebase-config.js";
import { obtenerCursosHabilitados } from "./cursos-datos.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {
    escaparHTML,
    resolverImagen,
    prepararImagenes
} from "./curso-utils.js";
import {
    agregarAFavoritos,
    actualizarContadorFavoritos,
    obtenerFavoritos
} from "./favoritos-store.js";

const listaCursos = document.querySelector("#listaCursos");

function obtenerNombreNivel(nivel) {
    const nombres = {
        basico: "Básico",
        intermedio: "Intermedio",
        avanzado: "Avanzado"
    };

    return nombres[nivel] || nivel;
}

function obtenerPrecioCurso(curso) {
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

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: "UYU",
        maximumFractionDigits: 0
    }).format(precio);
}

function crearTarjetaCurso(curso, rolActual) {
    const nivel = curso.nivel || "basico";
    const nombreNivel = obtenerNombreNivel(nivel);
    const precio = obtenerPrecioCurso(curso);

    const columna = document.createElement("div");
    columna.className = "col-md-6 col-xl-4";
    columna.dataset.cursoFirestore = "true";
    columna.dataset.cursoId = curso.id;

    const enlaceAdquisicion =
        `./adquisicion.html?cursoId=${encodeURIComponent(curso.id)}`;

    const enlaceDetalle =
        `./detalle.html?cursoId=${encodeURIComponent(curso.id)}`;

    const acciones = rolActual === "admin"
        ? `
          <a href="./curso-estudiante.html?cursoId=${encodeURIComponent(curso.id)}&vista=estudiante" class="btn btn-oro">
            Vista previa como estudiante
          </a>

          <a href="./panel-admin.html" class="btn btn-outline-primary">
            Administrar curso
          </a>`
        : `
          <button
            type="button"
            class="btn btn-oro"
            data-agregar-favoritos="${escaparHTML(curso.id)}"
          >
            ${obtenerFavoritos().includes(curso.id)
                ? "Ya está en favoritos"
                : "Agregar a favoritos"}
          </button>

          <a href="${enlaceAdquisicion}" class="btn btn-outline-primary">
            Adquirir ahora
          </a>`;

    columna.innerHTML = `
    <article class="card h-100 curso-card">
      <img
        data-imagen-curso
        class="card-img-top"
        loading="lazy"
        src="${escaparHTML(resolverImagen(curso.imagen))}"
        alt="${escaparHTML(curso.titulo)}"
      />

      <div class="card-body d-flex flex-column">
        <span class="badge nivel-${escaparHTML(nivel)} align-self-start mb-2">
          ${escaparHTML(nombreNivel)}
        </span>

        <h2 class="card-title h5">
          ${escaparHTML(curso.titulo)}
        </h2>

        <p class="card-text">
          ${escaparHTML(curso.descripcion)}
        </p>

        <p class="small text-body-secondary mb-2">
          Docente: ${escaparHTML(curso.docenteNombre || "EDUY")}
        </p>

        <p class="fw-bold mb-3">
          Precio simulado: ${formatearPrecio(precio)}
        </p>

        <div class="d-grid gap-2 mt-auto">
          <a href="${enlaceDetalle}" class="btn btn-outline-secondary">
            Ver detalle
          </a>

          ${acciones}
        </div>
      </div>
    </article>
  `;

    return columna;
}

listaCursos.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-agregar-favoritos]");

    if (!boton) return;

    if (!auth.currentUser) {
        window.location.href = "./login.html";
        return;
    }

    const agregado = agregarAFavoritos(boton.dataset.agregarFavoritos);

    actualizarContadorFavoritos();

    boton.textContent = agregado
        ? "Agregado a favoritos"
        : "Ya está en favoritos";

    boton.disabled = true;

    window.setTimeout(() => {
        boton.textContent = "Ya está en favoritos";
        boton.disabled = false;
    }, 1400);
});

actualizarContadorFavoritos();

async function obtenerRolActual() {
    const usuario = auth.currentUser || await new Promise((resolve) => {
        const dejarDeObservar = onAuthStateChanged(auth, (sesion) => {
            dejarDeObservar();
            resolve(sesion);
        });
    });

    if (!usuario) {
        return null;
    }

    const perfil = await getDoc(doc(db, "usuarios", usuario.uid));

    return perfil.exists()
        ? perfil.data().rol || null
        : null;
}

async function cargarCursosHabilitados() {
    listaCursos.dataset.estado = "cargando";
    listaCursos.textContent = "Cargando cursos…";

    document.dispatchEvent(new CustomEvent("cursosActualizados"));
    listaCursos.setAttribute("aria-busy", "true");

    try {
        const [cursos, rolActual] = await Promise.all([
            obtenerCursosHabilitados(),
            obtenerRolActual()
        ]);

        listaCursos.replaceChildren(
            ...cursos.map((curso) => crearTarjetaCurso(curso, rolActual))
        );

        if (!cursos.length) {
            listaCursos.textContent = "Todavía no hay cursos habilitados.";
        }

        listaCursos.dataset.estado = "listo";
        prepararImagenes(listaCursos);
        document.dispatchEvent(new CustomEvent("cursosActualizados"));
    } catch (error) {
        listaCursos.dataset.estado = "error";
        document.dispatchEvent(new CustomEvent("cursosActualizados"));

        console.error("No fue posible cargar los cursos:", error);

        listaCursos.textContent =
            "No fue posible cargar los cursos. Revisá tu conexión e intentá nuevamente.";

        const reintentar = document.createElement("button");
        reintentar.className = "btn btn-oro";
        reintentar.textContent = "Reintentar";
        reintentar.addEventListener("click", cargarCursosHabilitados);
        listaCursos.append(reintentar);
    } finally {
        listaCursos.setAttribute("aria-busy", "false");
    }
}

cargarCursosHabilitados();
