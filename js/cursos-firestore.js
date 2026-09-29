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

function crearTarjetaCurso(curso) {
    const nivel = curso.nivel || "basico";
    const nombreNivel = obtenerNombreNivel(nivel);

    const columna = document.createElement("div");
    columna.className = "col-md-6 col-xl-4";
    columna.dataset.cursoFirestore = "true";

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

        <p class="small text-body-secondary">
          Docente:
          ${escaparHTML(
        curso.docenteNombre || "EDUY"
    )}
        </p>

        <span class="btn btn-oro mt-auto disabled">
          Curso habilitado
        </span>
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
            const curso = documento.data();

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