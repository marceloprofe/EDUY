import {
    resolverImagen,
    prepararImagenes
} from "./curso-utils.js";

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

function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        texto ?? "";

    return elemento.innerHTML
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
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

        const imagen =
            formulario.imagen
                .value
                .trim();

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

        botonGuardar.disabled = true;

        botonGuardar.textContent =
            "Guardando...";

        try {
            await addDoc(
                collection(
                    db,
                    "cursos"
                ),
                {
                    titulo,
                    descripcion,
                    nivel,
                    imagen,

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

            mostrarMensaje(
                "Curso guardado como borrador.",
                "success"
            );

            await cargarCursos();
        } catch (error) {
            console.error(error);

            mostrarMensaje(
                "No fue posible guardar el curso.",
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