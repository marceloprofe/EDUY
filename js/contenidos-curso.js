import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocsFromServer,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/*
|--------------------------------------------------------------------------
| ELEMENTOS DE LA PÁGINA
|--------------------------------------------------------------------------
*/

const tituloCurso =
    document.querySelector("#tituloCurso");

const estadoCurso =
    document.querySelector("#estadoCurso");

const mensajeContenido =
    document.querySelector("#mensajeContenido");

const formulario =
    document.querySelector("#formContenido");

const campoContenidoId =
    document.querySelector("#contenidoId");

const campoTitulo =
    document.querySelector("#titulo");

const campoDescripcion =
    document.querySelector("#descripcion");

const campoTipo =
    document.querySelector("#tipo");

const campoUrl =
    document.querySelector("#url");

const campoOrden =
    document.querySelector("#orden");

const botonGuardar =
    document.querySelector("#botonGuardar");

const botonCancelarEdicion =
    document.querySelector("#botonCancelarEdicion");

const tituloFormulario =
    document.querySelector("#tituloFormulario");

const listaContenidos =
    document.querySelector("#listaContenidos");

const mensajeSinContenidos =
    document.querySelector("#mensajeSinContenidos");

const cantidadContenidos =
    document.querySelector("#cantidadContenidos");


/*
|--------------------------------------------------------------------------
| DATOS GENERALES
|--------------------------------------------------------------------------
*/

const parametros =
    new URLSearchParams(window.location.search);

const cursoId =
    parametros.get("cursoId");

let usuarioActual = null;
let cursoActual = null;
let contenidosActuales = [];


/*
|--------------------------------------------------------------------------
| FUNCIONES DE INTERFAZ
|--------------------------------------------------------------------------
*/

function mostrarMensaje(texto, tipo = "info") {
    mensajeContenido.textContent = texto;
    mensajeContenido.className =
        `alert alert-${tipo} mb-4`;
}

function ocultarMensaje() {
    mensajeContenido.textContent = "";
    mensajeContenido.className = "d-none";
}

function mostrarEstado(texto, tipo = "secondary") {
    estadoCurso.innerHTML = "";

    const elemento = document.createElement("span");

    elemento.className = `badge text-bg-${tipo}`;
    elemento.textContent = texto;

    estadoCurso.appendChild(elemento);
}

function habilitarFormulario(habilitado) {
    formulario
        .querySelectorAll("input, textarea, select, button")
        .forEach((elemento) => {
            elemento.disabled = !habilitado;
        });
}

function obtenerSiguienteOrden() {
    if (contenidosActuales.length === 0) {
        return 1;
    }

    const ordenMayor = Math.max(
        ...contenidosActuales.map(
            (contenido) => Number(contenido.orden) || 0
        )
    );

    return ordenMayor + 1;
}

function reiniciarFormulario() {
    formulario.reset();

    campoContenidoId.value = "";
    campoOrden.value = obtenerSiguienteOrden();

    tituloFormulario.textContent =
        "Agregar contenido";

    botonGuardar.textContent =
        "Guardar contenido";

    botonCancelarEdicion.classList.add("d-none");

    ocultarMensaje();
}

function validarUrlHttps(valor) {
    try {
        const url = new URL(valor);

        return url.protocol === "https:";
    } catch {
        return false;
    }
}


/*
|--------------------------------------------------------------------------
| VERIFICACIÓN DEL DOCENTE Y DEL CURSO
|--------------------------------------------------------------------------
*/

async function obtenerPerfilDocente(usuario) {
    const referenciaUsuario =
        doc(db, "usuarios", usuario.uid);

    const documentoUsuario =
        await getDoc(referenciaUsuario);

    if (!documentoUsuario.exists()) {
        return null;
    }

    const datosUsuario =
        documentoUsuario.data();

    if (datosUsuario.rol !== "docente") {
        return null;
    }

    return datosUsuario;
}

async function obtenerCursoDocente(usuario) {
    if (!cursoId) {
        throw new Error("curso-no-indicado");
    }

    const referenciaCurso =
        doc(db, "cursos", cursoId);

    const documentoCurso =
        await getDoc(referenciaCurso);

    if (!documentoCurso.exists()) {
        throw new Error("curso-no-existe");
    }

    const datosCurso =
        documentoCurso.data();

    if (datosCurso.docenteId !== usuario.uid) {
        throw new Error("curso-no-pertenece");
    }

    return {
        id: documentoCurso.id,
        ...datosCurso
    };
}


/*
|--------------------------------------------------------------------------
| CREACIÓN DE LAS TARJETAS
|--------------------------------------------------------------------------
*/

function crearTarjetaContenido(contenido) {
    const articulo =
        document.createElement("article");

    articulo.className =
        "card border contenido-curso-item";

    const cuerpo =
        document.createElement("div");

    cuerpo.className = "card-body";

    const encabezado =
        document.createElement("div");

    encabezado.className =
        "d-flex flex-wrap justify-content-between " +
        "align-items-start gap-3 mb-3";

    const datosPrincipales =
        document.createElement("div");

    const titulo =
        document.createElement("h3");

    titulo.className = "h5 fw-bold mb-2";
    titulo.textContent = contenido.titulo;

    const insignia =
        document.createElement("span");

    insignia.className =
        contenido.tipo === "video"
            ? "badge text-bg-danger"
            : "badge text-bg-primary";

    insignia.textContent =
        contenido.tipo === "video"
            ? "Video"
            : "PDF";

    datosPrincipales.append(
        titulo,
        insignia
    );

    const orden =
        document.createElement("span");

    orden.className =
        "badge text-bg-secondary";

    orden.textContent =
        `Orden: ${contenido.orden}`;

    encabezado.append(
        datosPrincipales,
        orden
    );

    const descripcion =
        document.createElement("p");

    descripcion.className =
        "text-body-secondary";

    descripcion.textContent =
        contenido.descripcion;

    const acciones =
        document.createElement("div");

    acciones.className =
        "d-flex flex-wrap gap-2";

    const enlace =
        document.createElement("a");

    enlace.className =
        "btn btn-sm btn-outline-primary";

    enlace.href = contenido.url;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";

    enlace.textContent =
        contenido.tipo === "video"
            ? "Abrir video"
            : "Abrir PDF";

    const botonEditar =
        document.createElement("button");

    botonEditar.type = "button";
    botonEditar.className =
        "btn btn-sm btn-outline-secondary";

    botonEditar.textContent = "Editar";

    botonEditar.addEventListener(
        "click",
        () => iniciarEdicion(contenido.id)
    );

    const botonEliminar =
        document.createElement("button");

    botonEliminar.type = "button";
    botonEliminar.className =
        "btn btn-sm btn-outline-danger";

    botonEliminar.textContent = "Eliminar";

    botonEliminar.addEventListener(
        "click",
        () => eliminarContenido(contenido.id)
    );

    acciones.append(
        enlace,
        botonEditar,
        botonEliminar
    );

    cuerpo.append(
        encabezado,
        descripcion,
        acciones
    );

    articulo.appendChild(cuerpo);

    return articulo;
}


/*
|--------------------------------------------------------------------------
| MOSTRAR CONTENIDOS
|--------------------------------------------------------------------------
*/

function mostrarContenidos() {
    listaContenidos.replaceChildren();

    cantidadContenidos.textContent =
        contenidosActuales.length === 1
            ? "1 contenido"
            : `${contenidosActuales.length} contenidos`;

    if (contenidosActuales.length === 0) {
        mensajeSinContenidos.classList.remove(
            "d-none"
        );

        return;
    }

    mensajeSinContenidos.classList.add(
        "d-none"
    );

    const fragmento =
        document.createDocumentFragment();

    contenidosActuales.forEach(
        (contenido) => {
            fragmento.appendChild(
                crearTarjetaContenido(contenido)
            );
        }
    );

    listaContenidos.appendChild(fragmento);
}

async function cargarContenidos() {
    listaContenidos.innerHTML = `
    <p class="text-body-secondary">
      Cargando contenidos...
    </p>
  `;

    try {
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

        contenidosActuales =
            resultado.docs.map(
                (documento) => ({
                    id: documento.id,
                    ...documento.data()
                })
            );

        contenidosActuales.sort(
            (contenidoA, contenidoB) => {
                const ordenA =
                    Number(contenidoA.orden) || 0;

                const ordenB =
                    Number(contenidoB.orden) || 0;

                if (ordenA !== ordenB) {
                    return ordenA - ordenB;
                }

                return String(contenidoA.titulo)
                    .localeCompare(
                        String(contenidoB.titulo),
                        "es"
                    );
            }
        );

        mostrarContenidos();

        if (!campoContenidoId.value) {
            campoOrden.value =
                obtenerSiguienteOrden();
        }
    } catch (error) {
        console.error(error);

        listaContenidos.innerHTML = `
      <div class="alert alert-danger">
        No fue posible cargar los contenidos.
        Verificá las reglas de Firestore.
      </div>
    `;
    }
}


/*
|--------------------------------------------------------------------------
| EDITAR CONTENIDO
|--------------------------------------------------------------------------
*/

function iniciarEdicion(contenidoId) {
    const contenido =
        contenidosActuales.find(
            (elemento) =>
                elemento.id === contenidoId
        );

    if (!contenido) {
        mostrarMensaje(
            "No se encontró el contenido seleccionado.",
            "danger"
        );

        return;
    }

    campoContenidoId.value =
        contenido.id;

    campoTitulo.value =
        contenido.titulo || "";

    campoDescripcion.value =
        contenido.descripcion || "";

    campoTipo.value =
        contenido.tipo || "";

    campoUrl.value =
        contenido.url || "";

    campoOrden.value =
        contenido.orden || 1;

    tituloFormulario.textContent =
        "Editar contenido";

    botonGuardar.textContent =
        "Guardar cambios";

    botonCancelarEdicion.classList.remove(
        "d-none"
    );

    ocultarMensaje();

    formulario.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/*
|--------------------------------------------------------------------------
| ELIMINAR CONTENIDO
|--------------------------------------------------------------------------
*/

async function eliminarContenido(contenidoId) {
    const contenido =
        contenidosActuales.find(
            (elemento) =>
                elemento.id === contenidoId
        );

    if (!contenido) {
        return;
    }

    const confirmado = window.confirm(
        `¿Querés eliminar "${contenido.titulo}"?`
    );

    if (!confirmado) {
        return;
    }

    try {
        await deleteDoc(
            doc(
                db,
                "cursos",
                cursoId,
                "contenidos",
                contenidoId
            )
        );

        mostrarMensaje(
            "Contenido eliminado correctamente.",
            "success"
        );

        if (
            campoContenidoId.value ===
            contenidoId
        ) {
            reiniciarFormulario();
        }

        await cargarContenidos();
    } catch (error) {
        console.error(error);

        mostrarMensaje(
            "No fue posible eliminar el contenido.",
            "danger"
        );
    }
}


/*
|--------------------------------------------------------------------------
| GUARDAR O ACTUALIZAR CONTENIDO
|--------------------------------------------------------------------------
*/

formulario.addEventListener(
    "submit",
    async (evento) => {
        evento.preventDefault();

        if (!usuarioActual || !cursoActual) {
            mostrarMensaje(
                "Esperá a que se verifique el curso.",
                "warning"
            );

            return;
        }

        const contenidoId =
            campoContenidoId.value.trim();

        const titulo =
            campoTitulo.value.trim();

        const descripcion =
            campoDescripcion.value.trim();

        const tipo =
            campoTipo.value;

        const url =
            campoUrl.value.trim();

        const orden =
            Number(campoOrden.value);

        if (!titulo || !descripcion) {
            mostrarMensaje(
                "Completá el título y la descripción.",
                "warning"
            );

            return;
        }

        if (!["video", "pdf"].includes(tipo)) {
            mostrarMensaje(
                "Seleccioná un tipo de contenido válido.",
                "warning"
            );

            return;
        }

        if (!validarUrlHttps(url)) {
            mostrarMensaje(
                "El enlace debe comenzar con https://",
                "warning"
            );

            return;
        }

        if (
            !Number.isInteger(orden) ||
            orden < 1 ||
            orden > 100
        ) {
            mostrarMensaje(
                "El orden debe ser un número entre 1 y 100.",
                "warning"
            );

            return;
        }

        botonGuardar.disabled = true;
        botonGuardar.textContent =
            "Guardando...";

        try {
            const datosContenido = {
                titulo,
                descripcion,
                tipo,
                url,
                orden,
                fechaActualizacion:
                    serverTimestamp()
            };

            if (contenidoId) {
                await updateDoc(
                    doc(
                        db,
                        "cursos",
                        cursoId,
                        "contenidos",
                        contenidoId
                    ),
                    datosContenido
                );

                mostrarMensaje(
                    "Contenido actualizado correctamente.",
                    "success"
                );
            } else {
                await addDoc(
                    collection(
                        db,
                        "cursos",
                        cursoId,
                        "contenidos"
                    ),
                    {
                        ...datosContenido,
                        fechaCreacion:
                            serverTimestamp()
                    }
                );

                mostrarMensaje(
                    "Contenido agregado correctamente.",
                    "success"
                );
            }

            reiniciarFormulario();
            await cargarContenidos();
        } catch (error) {
            console.error(error);

            mostrarMensaje(
                "No fue posible guardar el contenido. " +
                "Verificá las reglas de Firestore.",
                "danger"
            );
        } finally {
            botonGuardar.disabled = false;

            botonGuardar.textContent =
                campoContenidoId.value
                    ? "Guardar cambios"
                    : "Guardar contenido";
        }
    }
);


/*
|--------------------------------------------------------------------------
| CANCELAR EDICIÓN
|--------------------------------------------------------------------------
*/

botonCancelarEdicion.addEventListener(
    "click",
    () => {
        reiniciarFormulario();
    }
);


/*
|--------------------------------------------------------------------------
| VERIFICAR SESIÓN
|--------------------------------------------------------------------------
*/

habilitarFormulario(false);

onAuthStateChanged(
    auth,
    async (usuario) => {
        if (!usuario) {
            window.location.replace(
                "./login.html"
            );

            return;
        }

        try {
            const perfil =
                await obtenerPerfilDocente(usuario);

            if (!perfil) {
                window.location.replace(
                    "./acceso-denegado.html"
                );

                return;
            }

            const curso =
                await obtenerCursoDocente(usuario);

            usuarioActual = usuario;
            cursoActual = curso;

            tituloCurso.textContent =
                curso.titulo || "Curso sin título";

            document.title =
                `Contenidos de ${curso.titulo} | EDUY`;

            mostrarEstado(
                curso.habilitado === true
                    ? "Curso publicado"
                    : "Curso en borrador",
                curso.habilitado === true
                    ? "success"
                    : "secondary"
            );

            habilitarFormulario(true);

            await cargarContenidos();
        } catch (error) {
            console.error(error);

            habilitarFormulario(false);

            if (
                error.message ===
                "curso-no-indicado"
            ) {
                tituloCurso.textContent =
                    "Curso no indicado";

                mostrarMensaje(
                    "No se indicó qué curso querés administrar.",
                    "warning"
                );

                return;
            }

            if (
                error.message ===
                "curso-no-existe"
            ) {
                tituloCurso.textContent =
                    "Curso no encontrado";

                mostrarMensaje(
                    "El curso seleccionado no existe.",
                    "danger"
                );

                return;
            }

            if (
                error.message ===
                "curso-no-pertenece"
            ) {
                window.location.replace(
                    "./acceso-denegado.html"
                );

                return;
            }

            tituloCurso.textContent =
                "No fue posible cargar el curso";

            mostrarMensaje(
                "Ocurrió un error al verificar el curso.",
                "danger"
            );
        }
    }
);