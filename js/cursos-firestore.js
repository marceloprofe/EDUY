import { obtenerCursosHabilitados } from './cursos-datos.js';
import { escaparHTML, resolverImagen, prepararImagenes } from './curso-utils.js';

const listaCursos =
    document.querySelector("#listaCursos");


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
        <article class="card h-100 curso-card">
            <img data-imagen-curso class="card-img-top" loading="lazy" src="${escaparHTML(resolverImagen(curso.imagen))}" alt="${escaparHTML(curso.titulo)}" />
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
    listaCursos.dataset.estado = 'cargando';
    listaCursos.textContent = 'Cargando cursos…';
    document.dispatchEvent(new CustomEvent('cursosActualizados'));
    listaCursos.setAttribute('aria-busy', 'true');
    try {
        const cursos = await obtenerCursosHabilitados();
        listaCursos.replaceChildren(...cursos.map(crearTarjetaCurso));
        if (!cursos.length) listaCursos.textContent = 'Todavía no hay cursos habilitados.';
        listaCursos.dataset.estado = 'listo';
        prepararImagenes(listaCursos);
        document.dispatchEvent(new CustomEvent('cursosActualizados'));
    } catch (error) {
        listaCursos.dataset.estado = 'error';
        document.dispatchEvent(new CustomEvent('cursosActualizados'));
        console.error('No fue posible cargar los cursos:', error);
        listaCursos.textContent = 'No fue posible cargar los cursos. Revisá tu conexión e intentá nuevamente.';
        const reintentar = document.createElement('button');
        reintentar.className = 'btn btn-oro';
        reintentar.textContent = 'Reintentar';
        reintentar.addEventListener('click', cargarCursosHabilitados);
        listaCursos.append(reintentar);
    } finally {
        listaCursos.setAttribute('aria-busy', 'false');
    }
}
cargarCursosHabilitados();
