import {
    auth,
    db
} from "./firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/*
|--------------------------------------------------------------------------
| ELEMENTOS DE LA PÁGINA
|--------------------------------------------------------------------------
*/

const mensajeCurso =
    document.querySelector("#mensajeCurso");

const informacionCurso =
    document.querySelector("#informacionCurso");

const tituloCurso =
    document.querySelector("#tituloCurso");

const docenteCurso =
    document.querySelector("#docenteCurso");

const listaContenidos =
    document.querySelector("#listaContenidos");

const mensajeSinContenidos =
    document.querySelector("#mensajeSinContenidos");

const cantidadContenidos =
    document.querySelector("#cantidadContenidos");

const textoProgreso =
    document.querySelector("#textoProgreso");

const barraProgreso =
    document.querySelector("#barraProgreso");

const resumenProgreso =
    document.querySelector("#resumenProgreso");

const contenedorBarra =
    barraProgreso.parentElement;

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
let contenidosCurso = [];
let contenidosCompletados = new Set();
let progresoCreado = false;
let guardandoProgreso = false;

/*
|--------------------------------------------------------------------------
| MENSAJES
|--------------------------------------------------------------------------
*/

function mostrarMensaje(
    texto,
    tipo = "info"
) {
    mensajeCurso.textContent = texto;
    mensajeCurso.className =
        `alert alert-${tipo}`;
}

function ocultarMensaje() {
    mensajeCurso.classList.add("d-none");
}

/*
|--------------------------------------------------------------------------
| PORCENTAJE DE AVANCE
|--------------------------------------------------------------------------
*/

function calcularPorcentaje() {
    if (contenidosCurso.length === 0) {
        return 0;
    }

    const cantidadCompletada =
        contenidosCurso.filter(
            (contenido) =>
                contenidosCompletados.has(contenido.id)
        ).length;

    return Math.round(
        (
            cantidadCompletada /
            contenidosCurso.length
        ) * 100
    );
}

function actualizarProgreso() {
    const cantidadCompletada =
        contenidosCurso.filter(
            (contenido) =>
                contenidosCompletados.has(contenido.id)
        ).length;

    const total = contenidosCurso.length;
    const porcentaje = calcularPorcentaje();

    textoProgreso.textContent =
        `${porcentaje}%`;

    barraProgreso.style.width =
        `${porcentaje}%`;

    barraProgreso.textContent =
        `${porcentaje}%`;

    contenedorBarra.setAttribute(
        "aria-valuenow",
        String(porcentaje)
    );

    if (porcentaje === 100 && total > 0) {
        textoProgreso.className =
            "badge text-bg-success fs-6";

        barraProgreso.className =
            "progress-bar progress-bar-striped bg-success";

        resumenProgreso.textContent =
            "¡Felicitaciones! Completaste todos los contenidos del curso.";

        return;
    }

    textoProgreso.className =
        "badge text-bg-primary fs-6";

    barraProgreso.className =
        "progress-bar progress-bar-striped";

    if (total === 0) {
        resumenProgreso.textContent =
            "Este curso todavía no tiene contenidos.";

        return;
    }

    if (cantidadCompletada === 0) {
        resumenProgreso.textContent =
            `Tenés ${total} ${total === 1
                ? "contenido pendiente"
                : "contenidos pendientes"
            }.`;

        return;
    }

    resumenProgreso.textContent =
        `Completaste ${cantidadCompletada} de ${total} ${total === 1
            ? "contenido"
            : "contenidos"
        }.`;
}

/*
|--------------------------------------------------------------------------
| MOSTRAR INFORMACIÓN DEL CURSO
|--------------------------------------------------------------------------
*/

function mostrarInformacionCurso(curso) {
    tituloCurso.textContent =
        curso.titulo || "Curso sin título";

        docenteCurso.textContent =
        curso.docenteNombre ||
        "Docente no disponible";

    document.title =
        `${tituloCurso.textContent} | EDUY`;
}

/*
|--------------------------------------------------------------------------
| CREAR TARJETAS DE CONTENIDO
|--------------------------------------------------------------------------
*/

function crearTarjetaContenido(contenido) {
    const columna =
        document.createElement("div");

    columna.className =
        "col-12 col-lg-6";

    const tarjeta =
        document.createElement("article");

    tarjeta.className =
        "card h-100 shadow-sm";

    const cuerpo =
        document.createElement("div");

    cuerpo.className =
        "card-body d-flex flex-column p-4";

    const encabezado =
        document.createElement("div");

    encabezado.className =
        "d-flex justify-content-between " +
        "align-items-start gap-3 mb-3";

    const contenedorTitulo =
        document.createElement("div");

    const titulo =
        document.createElement("h3");

    titulo.className =
        "h5 fw-bold mb-2";

    titulo.textContent =
        contenido.titulo ||
        "Contenido sin título";

    const tipo =
        document.createElement("span");

    tipo.className =
        contenido.tipo === "pdf"
            ? "badge text-bg-primary"
            : "badge text-bg-danger";

    tipo.textContent =
        contenido.tipo === "pdf"
            ? "PDF"
            : "Video";

    const orden =
        document.createElement("span");

    orden.className =
        "badge text-bg-secondary";

    orden.textContent =
        `Orden: ${contenido.orden || 0}`;

    contenedorTitulo.append(
        titulo,
        tipo
    );

    encabezado.append(
        contenedorTitulo,
        orden
    );

    const descripcion =
        document.createElement("p");

    descripcion.className =
        "text-body-secondary";

    descripcion.textContent =
        contenido.descripcion ||
        "Sin descripción.";

    const acciones =
        document.createElement("div");

    acciones.className =
        "mt-auto pt-3";

    const enlace =
        document.createElement("a");

    enlace.className =
        "btn btn-outline-primary w-100 mb-3";

    enlace.href =
        contenido.url;

    enlace.target =
        "_blank";

    enlace.rel =
        "noopener noreferrer";

    enlace.textContent =
        contenido.tipo === "pdf"
            ? "Abrir PDF"
            : "Abrir video";

    const contenedorMarcado =
        document.createElement("div");

    contenedorMarcado.className =
        "form-check border rounded p-3 ps-5";

    const casilla =
        document.createElement("input");

    casilla.className =
        "form-check-input";

    casilla.type =
        "checkbox";

    casilla.id =
        `contenido-${contenido.id}`;

    casilla.checked =
        contenidosCompletados.has(contenido.id);

    casilla.dataset.contenidoId =
        contenido.id;

    const etiqueta =
        document.createElement("label");

    etiqueta.className =
        "form-check-label fw-semibold";

    etiqueta.htmlFor =
        casilla.id;

    etiqueta.textContent =
        casilla.checked
            ? "Contenido completado"
            : "Marcar como completado";

    casilla.addEventListener(
        "change",
        cambiarEstadoContenido
    );

    contenedorMarcado.append(
        casilla,
        etiqueta
    );

    acciones.append(
        enlace,
        contenedorMarcado
    );

    cuerpo.append(
        encabezado,
        descripcion,
        acciones
    );

    tarjeta.appendChild(cuerpo);
    columna.appendChild(tarjeta);

    return columna;
}

/*
|--------------------------------------------------------------------------
| MOSTRAR CONTENIDOS
|--------------------------------------------------------------------------
*/

function mostrarContenidos() {
    listaContenidos.replaceChildren();

    const total =
        contenidosCurso.length;

    cantidadContenidos.textContent =
        `${total} ${total === 1
            ? "contenido"
            : "contenidos"
        }`;

    mensajeSinContenidos.classList.toggle(
        "d-none",
        total !== 0
    );

    if (total === 0) {
        actualizarProgreso();
        return;
    }

    const fragmento =
        document.createDocumentFragment();

    contenidosCurso.forEach(
        (contenido) => {
            fragmento.appendChild(
                crearTarjetaContenido(contenido)
            );
        }
    );

    listaContenidos.appendChild(fragmento);

    actualizarProgreso();
}

/*
|--------------------------------------------------------------------------
| BLOQUEAR CASILLAS MIENTRAS SE GUARDA
|--------------------------------------------------------------------------
*/

function bloquearCasillas(bloquear) {
    document
        .querySelectorAll(
            'input[data-contenido-id]'
        )
        .forEach((casilla) => {
            casilla.disabled = bloquear;
        });
}

/*
|--------------------------------------------------------------------------
| GUARDAR PROGRESO
|--------------------------------------------------------------------------
*/

async function guardarProgreso() {
    const progresoId =
        `${usuarioActual.uid}_${cursoId}`;

    const porcentaje =
        calcularPorcentaje();

    const datos = {
        usuarioId: usuarioActual.uid,
        cursoId,
        contenidosCompletados:
            Array.from(contenidosCompletados),
        porcentaje,
        fechaActualizacion:
            serverTimestamp()
    };

    if (!progresoCreado) {
        datos.fechaCreacion =
            serverTimestamp();
    }

    await setDoc(
        doc(
            db,
            "progresos",
            progresoId
        ),
        datos,
        {
            merge: true
        }
    );

    progresoCreado = true;
}

/*
|--------------------------------------------------------------------------
| MARCAR O DESMARCAR CONTENIDO
|--------------------------------------------------------------------------
*/

async function cambiarEstadoContenido(evento) {
    if (
        guardandoProgreso ||
        !usuarioActual
    ) {
        return;
    }

    const casilla =
        evento.currentTarget;

    const contenidoId =
        casilla.dataset.contenidoId;

    const estabaCompletado =
        contenidosCompletados.has(contenidoId);

    if (casilla.checked) {
        contenidosCompletados.add(
            contenidoId
        );
    } else {
        contenidosCompletados.delete(
            contenidoId
        );
    }

    guardandoProgreso = true;
    bloquearCasillas(true);
    actualizarProgreso();

    const etiqueta =
        document.querySelector(
            `label[for="${casilla.id}"]`
        );

    if (etiqueta) {
        etiqueta.textContent =
            casilla.checked
                ? "Contenido completado"
                : "Marcar como completado";
    }

    try {
        await guardarProgreso();

        mostrarMensaje(
            "Tu avance se guardó correctamente.",
            "success"
        );

        window.setTimeout(
            ocultarMensaje,
            2500
        );
    } catch (error) {
        console.error(
            "No fue posible guardar el progreso:",
            error
        );

        if (estabaCompletado) {
            contenidosCompletados.add(
                contenidoId
            );
        } else {
            contenidosCompletados.delete(
                contenidoId
            );
        }

        casilla.checked =
            estabaCompletado;

        if (etiqueta) {
            etiqueta.textContent =
                estabaCompletado
                    ? "Contenido completado"
                    : "Marcar como completado";
        }

        actualizarProgreso();

        mostrarMensaje(
            "No fue posible guardar tu avance.",
            "danger"
        );
    } finally {
        guardandoProgreso = false;
        bloquearCasillas(false);
    }
}

/*
|--------------------------------------------------------------------------
| CARGAR EL PROGRESO GUARDADO
|--------------------------------------------------------------------------
*/

async function cargarProgreso() {
    const progresoId =
        `${usuarioActual.uid}_${cursoId}`;

    const resultado =
        await getDoc(
            doc(
                db,
                "progresos",
                progresoId
            )
        );

    if (!resultado.exists()) {
        progresoCreado = false;
        contenidosCompletados = new Set();
        return;
    }

    progresoCreado = true;

    const datos =
        resultado.data();

    const identificadoresValidos =
        new Set(
            contenidosCurso.map(
                (contenido) => contenido.id
            )
        );

    const completados =
        Array.isArray(
            datos.contenidosCompletados
        )
            ? datos.contenidosCompletados
            : [];

    contenidosCompletados =
        new Set(
            completados.filter(
                (contenidoId) =>
                    identificadoresValidos.has(
                        contenidoId
                    )
            )
        );
}

/*
|--------------------------------------------------------------------------
| CARGAR CONTENIDOS DEL CURSO
|--------------------------------------------------------------------------
*/

async function cargarContenidos() {
    const resultado =
        await getDocs(
            collection(
                db,
                "cursos",
                cursoId,
                "contenidos"
            )
        );

    contenidosCurso =
        resultado.docs.map(
            (documento) => ({
                id: documento.id,
                ...documento.data()
            })
        );

    contenidosCurso.sort(
        (contenidoA, contenidoB) => {
            const ordenA =
                Number(contenidoA.orden) || 0;

            const ordenB =
                Number(contenidoB.orden) || 0;

            return ordenA - ordenB;
        }
    );
}

/*
|--------------------------------------------------------------------------
| VERIFICAR ADQUISICIÓN
|--------------------------------------------------------------------------
*/

async function verificarAdquisicion() {
    const adquisicionId =
        `${usuarioActual.uid}_${cursoId}`;

    const resultado =
        await getDoc(
            doc(
                db,
                "adquisiciones",
                adquisicionId
            )
        );

    return (
        resultado.exists() &&
        resultado.data().estado === "confirmada"
    );
}

/*
|--------------------------------------------------------------------------
| CARGAR CURSO
|--------------------------------------------------------------------------
*/

async function cargarCurso() {
    const resultado =
        await getDoc(
            doc(
                db,
                "cursos",
                cursoId
            )
        );

    if (!resultado.exists()) {
        throw new Error(
            "El curso no existe."
        );
    }

    return resultado.data();
}

/*
|--------------------------------------------------------------------------
| INICIAR PÁGINA
|--------------------------------------------------------------------------
*/

async function iniciarPagina() {
    if (!cursoId) {
        mostrarMensaje(
            "No se indicó qué curso querés abrir.",
            "warning"
        );

        return;
    }

    mostrarMensaje(
        "Verificando acceso al curso..."
    );

    const tieneAcceso =
        await verificarAdquisicion();

    if (!tieneAcceso) {
        window.location.replace(
            "./acceso-denegado.html"
        );

        return;
    }

    const curso =
        await cargarCurso();

    mostrarInformacionCurso(curso);

    await cargarContenidos();
    await cargarProgreso();

    mostrarContenidos();

    informacionCurso.classList.remove(
        "d-none"
    );

    ocultarMensaje();
}

/*
|--------------------------------------------------------------------------
| CONTROL DE SESIÓN
|--------------------------------------------------------------------------
*/

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
                await getDoc(
                    doc(
                        db,
                        "usuarios",
                        usuario.uid
                    )
                );

            if (
                !perfil.exists() ||
                perfil.data().rol !== "estudiante"
            ) {
                window.location.replace(
                    "./acceso-denegado.html"
                );

                return;
            }

            usuarioActual = usuario;

            await iniciarPagina();
        } catch (error) {
            console.error(
                "No fue posible abrir el curso:",
                error
            );

            informacionCurso.classList.add(
                "d-none"
            );

            mostrarMensaje(
                "No fue posible cargar el curso. Verificá las reglas de Firestore.",
                "danger"
            );
        }
    }
);