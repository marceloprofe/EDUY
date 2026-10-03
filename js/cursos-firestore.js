import { db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const listaCursos =
    document.querySelector("#listaCursos");

function escaparHTML(texto = "") {
    const elemento = document.createElement("div");
    elemento.textContent = texto;
    return elemento.innerHTML;
}

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
    return new Intl.NumberFormat(
        "es-UY",
        {
            style: "currency",
            currency: "UYU",
            maximumFractionDigits: 0
        }
    ).format(precio);
}

function crearTarjetaCurso(curso) {
    const nivel = curso.nivel || "basico";
    const nombreNivel = obtenerNombreNivel(nivel);
    const precio = obtenerPrecioCurso(curso);

    const columna = document.createElement("div");

    columna.className = "col-md-6 col-xl-4";
    columna.dataset.cursoFirestore = "true";
    columna.dataset.cursoId = curso.id;

    const enlaceAdquisicion =
        `./adquisicion.html?cursoId=${encodeURIComponent(curso.id)
        }`;
        const enlaceDetalle =
        `./detalle.html?cursoId=${encodeURIComponent(curso.id)}`;
    columna.innerHTML = `
        <article class="card h-100 curso-card border-warning">
            <div class="card-body d-flex flex-column">
                <span
                    class="badge nivel-${escaparHTML(nivel)}
                           align-self-start mb-2"
                >
                    ${escaparHTML(nombreNivel)}
                </span>

                <h2 class="card-title h5">
                    ${escaparHTML(curso.titulo)}
                </h2>

                <p class="card-text">
                    ${escaparHTML(curso.descripcion)}
                </p>

                <p class="small text-body-secondary mb-2">
                    Docente:
                    ${escaparHTML(
        curso.docenteNombre || "EDUY"
    )}
                </p>

                <p class="fw-bold mb-3">
                    Precio simulado:
                    ${formatearPrecio(precio)}
                </p>

                <div class="d-grid gap-2 mt-auto">
    <a href="${enlaceDetalle}"
       class="btn btn-outline-secondary">
        Ver detalle
    </a>

    <a href="${enlaceAdquisicion}"
       class="btn btn-oro">
        Adquirir curso
    </a>
</div>
            </div>
        </article>
    `;
    

    return columna;
}

async function cargarCursosHabilitados() {
    try {
        const consulta = query(
            collection(db, "cursos"),
            where("habilitado", "==", true)
        );

        const resultado = await getDocs(consulta);

        resultado.forEach((documento) => {
            const curso = {
                id: documento.id,
                ...documento.data()
            };

            listaCursos.appendChild(
                crearTarjetaCurso(curso)
            );
        });

        document.dispatchEvent(
            new CustomEvent("cursosActualizados")
        );
    } catch (error) {
        console.error(
            "No fue posible cargar los cursos habilitados:",
            error
        );
    }
}

cargarCursosHabilitados();