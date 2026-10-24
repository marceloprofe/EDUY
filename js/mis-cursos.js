import {
    resolverImagen,
    prepararImagenes
} from "./curso-utils.js";

import {
    subirImagenCurso,
    validarArchivoImagen
} from "./imagen-curso-upload.js";

import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocsFromServer,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/*
|--------------------------------------------------------------------------
| ELEMENTOS Y VARIABLES
|--------------------------------------------------------------------------
*/

const formulario =
    document.querySelector("#formCurso");

const listaCursos =
    document.querySelector("#listaCursos");

const mensajeCurso =
    document.querySelector("#mensajeCurso");

const campoImagen = document.querySelector("#imagen");
const campoArchivoImagen = document.querySelector("#archivoImagen");
const estadoImagen = document.querySelector("#estadoImagen");
const vistaPreviaImagen = document.querySelector("#vistaPreviaImagen");

const elementoModalAvance =
    document.querySelector("#modalAvanceCurso");

const modalAvance =
    new bootstrap.Modal(elementoModalAvance);

const tituloAvanceCurso =
    document.querySelector("#tituloAvanceCurso");

const estadoAvanceCurso =
    document.querySelector("#estadoAvanceCurso");

const resumenAvanceCurso =
    document.querySelector("#resumenAvanceCurso");

const listaAvanceCurso =
    document.querySelector("#listaAvanceCurso");

let usuarioActual = null;
let perfilActual = null;


/*
|--------------------------------------------------------------------------
| FUNCIONES GENERALES
|--------------------------------------------------------------------------
*/

function mostrarMensaje(texto, tipo) {
    mensajeCurso.textContent = texto;

    mensajeCurso.className =
        `alert alert-${tipo}`;
}

let urlPreviaLocal = "";

function mostrarVistaPreviaImagen(origen) {
    if (urlPreviaLocal) {
        URL.revokeObjectURL(urlPreviaLocal);
        urlPreviaLocal = "";
    }

    if (!origen) {
        vistaPreviaImagen.removeAttribute("src");
        vistaPreviaImagen.classList.add("d-none");
        return;
    }

    vistaPreviaImagen.src = resolverImagen(origen);
    vistaPreviaImagen.classList.remove("d-none");
}

campoArchivoImagen.addEventListener("change", () => {
    const archivo = campoArchivoImagen.files[0];

    if (!archivo) {
        estadoImagen.textContent = "";
        mostrarVistaPreviaImagen(campoImagen.value.trim());
        return;
    }

    if (!validarArchivoImagen(archivo)) {
        campoArchivoImagen.value = "";
        estadoImagen.textContent = "La imagen debe ser JPG, PNG o WebP y pesar hasta 5 MB.";
        mostrarVistaPreviaImagen(campoImagen.value.trim());
        return;
    }

    urlPreviaLocal = URL.createObjectURL(archivo);
    vistaPreviaImagen.src = urlPreviaLocal;
    vistaPreviaImagen.classList.remove("d-none");
    estadoImagen.textContent = "Imagen lista para subir al guardar el curso.";
});

campoImagen.addEventListener("change", () => {
    if (!campoArchivoImagen.files.length) {
        mostrarVistaPreviaImagen(campoImagen.value.trim());
    }
});

function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        texto ?? "";

    return elemento.innerHTML
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function tarjetaResumen(titulo, valor) {
    return `
        <div class="col-12 col-sm-6 col-lg-3">
            <div class="card h-100 border-0 bg-body-tertiary">
                <div class="card-body">
                    <p class="small text-body-secondary mb-1">
                        ${escaparHTML(titulo)}
                    </p>
                    <p class="h4 fw-bold mb-0">
                        ${escaparHTML(valor)}
                    </p>
                </div>
            </div>
        </div>
    `;
}

async function mostrarAvanceCurso(curso) {
    tituloAvanceCurso.textContent =
        `Avance: ${curso.titulo}`;

    estadoAvanceCurso.className =
        "alert alert-info";
    estadoAvanceCurso.textContent =
        "Cargando inscripciones, progreso y valoraciones...";
    resumenAvanceCurso.innerHTML = "";
    listaAvanceCurso.innerHTML = "";
    modalAvance.show();

    try {
        const [resultadoAdquisiciones, resultadoProgresos, resultadoValoraciones] =
            await Promise.all([
                getDocsFromServer(
                    query(
                        collection(db, "adquisiciones"),
                        where("cursoId", "==", curso.id)
                    )
                ),
                getDocsFromServer(
                    query(
                        collection(db, "progresos"),
                        where("cursoId", "==", curso.id)
                    )
                ),
                getDocsFromServer(
                    query(
                        collection(db, "valoracionesDocentes"),
                        where("cursoId", "==", curso.id)
                    )
                )
            ]);

        const adquisiciones = resultadoAdquisiciones.docs
            .map((documento) => documento.data())
            .filter((adquisicion) => adquisicion.estado === "confirmada");

        const progresos = new Map(
            resultadoProgresos.docs.map((documento) => {
                const progreso = documento.data();
                return [progreso.usuarioId, progreso];
            })
        );

        const valoraciones = resultadoValoraciones.docs
            .map((documento) => documento.data());

        const estudiantes = adquisiciones.map((adquisicion) => {
            const progreso = progresos.get(adquisicion.usuarioId);
            const porcentaje = Math.max(
                0,
                Math.min(100, Number(progreso?.porcentaje) || 0)
            );

            return {
                correo: adquisicion.usuarioCorreo || "Correo no disponible",
                porcentaje,
                completados: Array.isArray(progreso?.contenidosCompletados)
                    ? progreso.contenidosCompletados.length
                    : 0
            };
        });

        const promedioProgreso = estudiantes.length > 0
            ? Math.round(
                estudiantes.reduce(
                    (total, estudiante) => total + estudiante.porcentaje,
                    0
                ) / estudiantes.length
            )
            : 0;

        const promedioValoracion = valoraciones.length > 0
            ? (
                valoraciones.reduce(
                    (total, valoracion) =>
                        total + Number(valoracion.estrellas || 0),
                    0
                ) / valoraciones.length
            ).toFixed(1)
            : "Sin datos";

        resumenAvanceCurso.innerHTML = [
            tarjetaResumen("Estudiantes", estudiantes.length),
            tarjetaResumen("Progreso promedio", `${promedioProgreso}%`),
            tarjetaResumen(
                "Cursos completados",
                estudiantes.filter(
                    (estudiante) => estudiante.porcentaje === 100
                ).length
            ),
            tarjetaResumen(
                "Valoración promedio",
                promedioValoracion === "Sin datos"
                    ? promedioValoracion
                    : `${promedioValoracion} / 5`
            )
        ].join("");

        estadoAvanceCurso.classList.add("d-none");

        if (estudiantes.length === 0) {
            listaAvanceCurso.innerHTML = `
                <div class="alert alert-secondary mb-0">
                    Este curso todavía no tiene estudiantes inscriptos.
                </div>
            `;
            return;
        }

        listaAvanceCurso.innerHTML = `
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr>
                            <th scope="col">Estudiante</th>
                            <th scope="col">Contenidos completados</th>
                            <th scope="col">Progreso</th>
                            <th scope="col">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estudiantes.map((estudiante) => `
                            <tr>
                                <td>${escaparHTML(estudiante.correo)}</td>
                                <td>${estudiante.completados}</td>
                                <td style="min-width: 12rem">
                                    <div
                                        class="progress"
                                        role="progressbar"
                                        aria-label="Progreso de ${escaparHTML(estudiante.correo)}"
                                        aria-valuenow="${estudiante.porcentaje}"
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        <div
                                            class="progress-bar"
                                            style="width: ${estudiante.porcentaje}%"
                                        >
                                            ${estudiante.porcentaje}%
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    ${estudiante.porcentaje === 100
                                        ? '<span class="badge text-bg-success">Completado</span>'
                                        : '<span class="badge text-bg-warning">En curso</span>'}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error(error);
        estadoAvanceCurso.className =
            "alert alert-danger";
        estadoAvanceCurso.textContent =
            "No fue posible consultar el avance. Verificá que las reglas de Firestore estén publicadas.";
    }
}


/*
|--------------------------------------------------------------------------
| VERIFICAR PERFIL DOCENTE
|--------------------------------------------------------------------------
*/

async function comprobarDocente(usuario) {
    const referenciaUsuario =
        doc(
            db,
            "usuarios",
            usuario.uid
        );

    const documentoUsuario =
        await getDoc(
            referenciaUsuario
        );

    if (!documentoUsuario.exists()) {
        return null;
    }

    const datos =
        documentoUsuario.data();

    if (datos.rol !== "docente") {
        return null;
    }

    return datos;
}


/*
|--------------------------------------------------------------------------
| CARGAR CURSOS DEL DOCENTE
|--------------------------------------------------------------------------
*/

async function cargarCursos() {
    listaCursos.setAttribute("aria-busy", "true");

    listaCursos.innerHTML = `
        <p class="text-body-secondary">
            Cargando cursos...
        </p>
    `;

    try {
        const consultaCursos =
            query(
                collection(db, "cursos"),
                where(
                    "docenteId",
                    "==",
                    usuarioActual.uid
                )
            );

        const resultado =
            await getDocsFromServer(
                consultaCursos
            );

        const cursos =
            resultado.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...documento.data()
                })
            );

        cursos.sort(
            (cursoA, cursoB) => {
                const fechaA =
                    cursoA.fechaCreacion
                        ?.seconds || 0;

                const fechaB =
                    cursoB.fechaCreacion
                        ?.seconds || 0;

                return fechaB - fechaA;
            }
        );

        mostrarCursos(cursos);
    } catch (error) {
        console.error(error);

        listaCursos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    No fue posible cargar los cursos.
                </div>
            </div>
        `;
    } finally {
        listaCursos.setAttribute("aria-busy", "false");
    }
}


/*
|--------------------------------------------------------------------------
| MOSTRAR CURSOS
|--------------------------------------------------------------------------
*/

function mostrarCursos(cursos) {
    if (cursos.length === 0) {
        listaCursos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    Todavía no creaste ningún curso.
                </div>
            </div>
        `;

        return;
    }

    listaCursos.innerHTML =
        cursos
            .map((curso) => {
                const estaHabilitado =
                    curso.habilitado === true;

                const claseEstado =
                    estaHabilitado
                        ? "text-bg-success"
                        : "text-bg-secondary";

                const textoEstado =
                    estaHabilitado
                        ? "Habilitado"
                        : "Borrador";

                const textoBoton =
                    estaHabilitado
                        ? "Pasar a borrador"
                        : "Habilitar curso";

                const claseBoton =
                    estaHabilitado
                        ? "btn-outline-secondary"
                        : "btn-outline-success";

                const enlaceContenidos =
                    `./contenidos-curso.html?cursoId=${encodeURIComponent(curso.id)
                    }`;

                const enlaceVistaPrevia =
                    `./curso-estudiante.html?cursoId=${encodeURIComponent(curso.id)
                    }&vista=docente`;

                return `
                    <div class="col-12 col-md-6 col-lg-4">
                        <article class="card h-100 shadow-sm">

                            <img
                                data-imagen-curso
                                class="card-img-top"
                                src="${escaparHTML(
                    resolverImagen(
                        curso.imagen
                    )
                )}"
                                alt="${escaparHTML(
                    curso.titulo
                )}"
                            />

                            <div class="card-body d-flex flex-column">

                                <div
                                    class="d-flex justify-content-between
                                           align-items-start gap-2 mb-3"
                                >
                                    <h3 class="h5 fw-bold mb-0">
                                        ${escaparHTML(
                    curso.titulo
                )}
                                    </h3>

                                    <span
                                        class="badge ${claseEstado}"
                                    >
                                        ${textoEstado}
                                    </span>
                                </div>

                                <p class="text-body-secondary">
                                    ${escaparHTML(
                    curso.descripcion
                )}
                                </p>

                                <p>
                                    <strong>Nivel:</strong>

                                    ${escaparHTML(
                    curso.nivel
                )}
                                </p>

                                <div class="d-grid gap-2 mt-auto">

                                    <a
                                        href="${enlaceContenidos}"
                                        class="btn btn-oro"
                                    >
                                        Gestionar contenidos
                                    </a>

                                    <a
                                        href="${enlaceVistaPrevia}"
                                        class="btn btn-outline-primary"
                                    >
                                        Vista previa como estudiante
                                    </a>

                                    <button
                                        type="button"
                                        class="btn btn-outline-primary btn-ver-avance"
                                        data-id="${escaparHTML(curso.id)}"
                                    >
                                        Ver avance y estadísticas
                                    </button>

                                    <button
                                        type="button"
                                        class="btn ${claseBoton}
                                               btn-cambiar-estado"
                                        data-id="${escaparHTML(
                    curso.id
                )}"
                                        data-habilitado="${estaHabilitado
                    }"
                                    >
                                        ${textoBoton}
                                    </button>

                                </div>

                            </div>
                        </article>
                    </div>
                `;
            })
            .join("");

    prepararImagenes(listaCursos);

    document
        .querySelectorAll(
            ".btn-cambiar-estado"
        )
        .forEach((boton) => {
            boton.addEventListener(
                "click",
                cambiarEstadoCurso
            );
        });

    document
        .querySelectorAll(".btn-ver-avance")
        .forEach((boton) => {
            boton.addEventListener("click", () => {
                const curso = cursos.find(
                    (item) => item.id === boton.dataset.id
                );

                if (curso) {
                    mostrarAvanceCurso(curso);
                }
            });
        });
}


/*
|--------------------------------------------------------------------------
| COMPROBAR CONTENIDOS DEL CURSO
|--------------------------------------------------------------------------
*/

async function cursoTieneContenidos(cursoId) {
    const referenciaContenidos =
        collection(
            db,
            "cursos",
            cursoId,
            "contenidos"
        );

    const resultado =
        await getDocsFromServer(
            referenciaContenidos
        );

    return !resultado.empty;
}


/*
|--------------------------------------------------------------------------
| CAMBIAR ESTADO DEL CURSO
|--------------------------------------------------------------------------
*/

async function cambiarEstadoCurso(evento) {
    const boton =
        evento.currentTarget;

    const cursoId =
        boton.dataset.id;

    const estabaHabilitado =
        boton.dataset.habilitado === "true";

    const nuevoEstado =
        !estabaHabilitado;

    const textoOriginal =
        boton.textContent.trim();

    boton.disabled = true;
    boton.textContent = "Verificando...";

    try {
        /*
        |--------------------------------------------------------------
        | Para publicar, el curso debe tener al menos un contenido.
        |--------------------------------------------------------------
        */

        if (nuevoEstado) {
            const tieneContenidos =
                await cursoTieneContenidos(
                    cursoId
                );

            if (!tieneContenidos) {
                mostrarMensaje(
                    "Antes de habilitar el curso, agregá al menos un contenido.",
                    "warning"
                );

                boton.disabled = false;
                boton.textContent =
                    textoOriginal;

                return;
            }
        }

        boton.textContent = "Guardando...";

        await updateDoc(
            doc(
                db,
                "cursos",
                cursoId
            ),
            {
                habilitado:
                    nuevoEstado,

                estado:
                    nuevoEstado
                        ? "habilitado"
                        : "borrador",

                fechaActualizacion:
                    serverTimestamp()
            }
        );

        mostrarMensaje(
            nuevoEstado
                ? "Curso habilitado correctamente."
                : "El curso volvió a borrador.",
            "success"
        );

        await cargarCursos();
    } catch (error) {
        console.error(error);

        mostrarMensaje(
            "No fue posible cambiar el estado del curso.",
            "danger"
        );

        boton.disabled = false;
        boton.textContent =
            textoOriginal;
    }
}


/*
|--------------------------------------------------------------------------
| CREAR CURSO
|--------------------------------------------------------------------------
*/

formulario.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        const botonGuardar =
            formulario.querySelector(
                'button[type="submit"]'
            );

        const titulo =
            formulario.titulo
                .value
                .trim();

        const descripcion =
            formulario.descripcion
                .value
                .trim();

        const nivel =
            formulario.nivel.value;

        const precio =
            Number(formulario.precio.value);

        if (!Number.isFinite(precio) || precio <= 0) {
            mostrarMensaje(
                "El precio debe ser un número mayor que cero.",
                "warning"
            );
            return;
        }

        if (
            !usuarioActual ||
            !perfilActual
        ) {
            mostrarMensaje(
                "Esperá a que se verifique tu sesión docente.",
                "warning"
            );

            return;
        }

        let imagen =
            formulario.imagen
                .value
                .trim();
        const archivoImagen = campoArchivoImagen.files[0];
        const videoPresentacion =
            formulario.videoPresentacion.value.trim();

        const videoValido =
            !videoPresentacion ||
            /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(
                videoPresentacion
            );

        if (!videoValido) {
            mostrarMensaje(
                "Ingresá un enlace HTTPS válido de YouTube.",
                "warning"
            );
            return;
        }

        const imagenValida =
            !imagen ||
            /^https:\/\//i.test(imagen) ||
            /^img\/[a-zA-Z0-9_./-]+$/.test(
                imagen
            );

        if (!imagenValida) {
            mostrarMensaje(
                "Ingresá una URL HTTPS o una ruta que empiece por img/.",
                "warning"
            );

            return;
        }

        if (archivoImagen && !validarArchivoImagen(archivoImagen)) {
            mostrarMensaje(
                "La imagen debe ser JPG, PNG o WebP y pesar hasta 5 MB.",
                "warning"
            );
            return;
        }

        if (!imagen && !archivoImagen) {
            mostrarMensaje(
                "Ingresá un enlace o seleccioná una imagen para el curso.",
                "warning"
            );
            return;
        }

        botonGuardar.disabled = true;

        botonGuardar.textContent =
            "Guardando...";

        try {
            if (archivoImagen) {
                botonGuardar.textContent = "Subiendo imagen...";
                imagen = await subirImagenCurso(archivoImagen, (porcentaje) => {
                    estadoImagen.textContent = `Subiendo imagen: ${porcentaje} %`;
                });
                campoImagen.value = imagen;
                campoArchivoImagen.value = "";
                mostrarVistaPreviaImagen(imagen);
                estadoImagen.textContent = "Imagen subida correctamente.";
                botonGuardar.textContent = "Guardando...";
            }

            await addDoc(
                collection(
                    db,
                    "cursos"
                ),
                {
                    titulo,
                    descripcion,
                    nivel,
                    precio,
                    imagen,
                    videoPresentacion,

                    docenteId:
                        usuarioActual.uid,

                    docenteNombre:
                        perfilActual.nombre ||
                        usuarioActual.email,

                    habilitado: false,
                    estado: "borrador",

                    fechaCreacion:
                        serverTimestamp(),

                    fechaActualizacion:
                        serverTimestamp()
                }
            );

            formulario.reset();
            estadoImagen.textContent = "";
            mostrarVistaPreviaImagen("");

            mostrarMensaje(
                "Curso guardado como borrador.",
                "success"
            );

            await cargarCursos();
        } catch (error) {
            console.error(error);

            mostrarMensaje(
                error.message === "cloudinary-no-configurado"
                    ? "Cloudinary no está configurado. Usá un enlace HTTPS para la imagen."
                    : error.message === "imagen-no-valida"
                        ? "La imagen debe ser JPG, PNG o WebP y pesar hasta 5 MB."
                        : "No fue posible subir la imagen o guardar el curso.",
                "danger"
            );
        } finally {
            botonGuardar.disabled = false;

            botonGuardar.textContent =
                "Guardar como borrador";
        }
    }
);


/*
|--------------------------------------------------------------------------
| VERIFICAR SESIÓN
|--------------------------------------------------------------------------
*/

onAuthStateChanged(
    auth,
    async (usuario) => {
        if (!usuario) {
            window.location.href =
                "./login.html";

            return;
        }

        try {
            const perfil =
                await comprobarDocente(
                    usuario
                );

            if (!perfil) {
                alert(
                    "Esta sección es exclusiva para docentes."
                );

                window.location.href =
                    "../index.html";

                return;
            }

            usuarioActual = usuario;
            perfilActual = perfil;

            await cargarCursos();
        } catch (error) {
            console.error(error);

            mostrarMensaje(
                "No fue posible verificar el perfil docente.",
                "danger"
            );
        }
    }
);
