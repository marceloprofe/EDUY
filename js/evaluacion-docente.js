import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    PORCENTAJE_MINIMO,
    normalizarPregunta,
    validarPregunta
} from "./evaluacion-utils.js";

const parametros = new URLSearchParams(window.location.search);
const cursoId = parametros.get("cursoId");
const vistaSolicitada = parametros.get("vista");

const panel = document.querySelector("#panelEvaluacionDocente");
const editor = document.querySelector("#editorEvaluacionDocente");
const mensaje = document.querySelector("#mensajeEvaluacionDocente");
const titulo = document.querySelector("#tituloEvaluacion");
const formulario = document.querySelector("#formPreguntaEvaluacion");
const enunciado = document.querySelector("#enunciadoPregunta");
const tipo = document.querySelector("#tipoPregunta");
const grupoVerdaderoFalso = document.querySelector("#grupoRespuestaVerdaderoFalso");
const respuestaVerdaderoFalso = document.querySelector("#respuestaVerdaderoFalso");
const grupoMultiple = document.querySelector("#grupoOpcionesMultiples");
const opciones = document.querySelector("#opcionesPregunta");
const respuestaMultiple = document.querySelector("#respuestaMultiple");
const lista = document.querySelector("#listaPreguntasEvaluacion");
const contador = document.querySelector("#cantidadPreguntasEvaluacion");
const botonGuardar = document.querySelector("#guardarEvaluacion");
const botonEliminar = document.querySelector("#eliminarEvaluacion");

let preguntas = [];
let evaluacionCreada = false;
let soloLectura = false;

function mostrarMensaje(texto, variante = "info") {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${variante} mb-4`;
}

function ocultarMensaje() {
    mensaje.textContent = "";
    mensaje.className = "d-none";
}

function actualizarCamposPregunta() {
    const esMultiple = tipo.value === "multiple";
    grupoMultiple.classList.toggle("d-none", !esMultiple);
    grupoVerdaderoFalso.classList.toggle("d-none", esMultiple);
}

function crearIdPregunta() {
    return globalThis.crypto?.randomUUID?.()
        || `pregunta-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderizarPreguntas() {
    lista.replaceChildren();
    contador.textContent = `${preguntas.length} ${preguntas.length === 1 ? "pregunta" : "preguntas"}`;

    if (preguntas.length === 0) {
        const aviso = document.createElement("p");
        aviso.className = "alert alert-light border mb-0";
        aviso.textContent = "Todavía no agregaste preguntas.";
        lista.appendChild(aviso);
        return;
    }

    preguntas.forEach((pregunta, indice) => {
        const articulo = document.createElement("article");
        articulo.className = "border rounded p-3";

        const encabezado = document.createElement("div");
        encabezado.className = "d-flex justify-content-between align-items-start gap-3";

        const contenido = document.createElement("div");
        const tituloPregunta = document.createElement("h3");
        tituloPregunta.className = "h6 fw-bold mb-2";
        tituloPregunta.textContent = `${indice + 1}. ${pregunta.enunciado}`;

        const detalle = document.createElement("p");
        detalle.className = "text-body-secondary mb-0";
        detalle.textContent = `${pregunta.tipo === "multiple" ? "Opción múltiple" : "Verdadero o falso"} · Respuesta: ${pregunta.opciones[pregunta.correcta]}`;

        contenido.append(tituloPregunta, detalle);
        encabezado.appendChild(contenido);

        if (!soloLectura) {
            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.className = "btn btn-sm btn-outline-danger";
            eliminar.textContent = "Quitar";
            eliminar.addEventListener("click", () => {
                preguntas = preguntas.filter((item) => item.id !== pregunta.id);
                renderizarPreguntas();
            });
            encabezado.appendChild(eliminar);
        }

        articulo.appendChild(encabezado);
        lista.appendChild(articulo);
    });
}

function obtenerOpcionesMultiples() {
    return opciones.value
        .split(/\r?\n/)
        .map((opcion) => opcion.trim())
        .filter(Boolean);
}

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    ocultarMensaje();

    const esMultiple = tipo.value === "multiple";
    const listaOpciones = esMultiple
        ? obtenerOpcionesMultiples()
        : ["Verdadero", "Falso"];
    const correcta = esMultiple
        ? Number(respuestaMultiple.value) - 1
        : Number(respuestaVerdaderoFalso.value);

    const pregunta = normalizarPregunta({
        id: crearIdPregunta(),
        enunciado: enunciado.value,
        tipo: tipo.value,
        opciones: listaOpciones,
        correcta
    });

    if (!validarPregunta(pregunta)) {
        mostrarMensaje("Revisá el enunciado, las opciones y la respuesta correcta.", "warning");
        return;
    }

    preguntas.push(pregunta);
    formulario.reset();
    tipo.value = "verdadero_falso";
    respuestaVerdaderoFalso.value = "0";
    respuestaMultiple.value = "1";
    actualizarCamposPregunta();
    renderizarPreguntas();
    enunciado.focus();
});

tipo.addEventListener("change", actualizarCamposPregunta);

async function guardarEvaluacion() {
    if (preguntas.length === 0) {
        mostrarMensaje("Agregá al menos una pregunta antes de guardar.", "warning");
        return;
    }

    const textoTitulo = titulo.value.trim();
    if (!textoTitulo) {
        mostrarMensaje("Ingresá un título para la evaluación.", "warning");
        return;
    }

    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando...";

    try {
        const datos = {
            titulo: textoTitulo,
            preguntas,
            notaAprobacion: PORCENTAJE_MINIMO,
            fechaActualizacion: serverTimestamp()
        };

        if (!evaluacionCreada) {
            datos.fechaCreacion = serverTimestamp();
        }

        await setDoc(
            doc(db, "cursos", cursoId, "evaluacion", "final"),
            datos,
            { merge: true }
        );

        evaluacionCreada = true;
        botonEliminar.classList.remove("d-none");
        mostrarMensaje("Evaluación guardada correctamente.", "success");
    } catch (error) {
        console.error("No fue posible guardar la evaluación:", error);
        mostrarMensaje("No fue posible guardar la evaluación. Verificá las reglas de Firestore.", "danger");
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = "Guardar evaluación";
    }
}

async function eliminarEvaluacion() {
    if (!window.confirm("¿Querés eliminar la evaluación final de este curso?")) {
        return;
    }

    try {
        await deleteDoc(doc(db, "cursos", cursoId, "evaluacion", "final"));
        preguntas = [];
        evaluacionCreada = false;
        titulo.value = "Evaluación final";
        botonEliminar.classList.add("d-none");
        renderizarPreguntas();
        mostrarMensaje("Evaluación eliminada.", "success");
    } catch (error) {
        console.error("No fue posible eliminar la evaluación:", error);
        mostrarMensaje("No fue posible eliminar la evaluación.", "danger");
    }
}

botonGuardar.addEventListener("click", guardarEvaluacion);
botonEliminar.addEventListener("click", eliminarEvaluacion);

function configurarSoloLectura() {
    soloLectura = true;
    formulario.classList.add("d-none");
    botonGuardar.classList.add("d-none");
    botonEliminar.classList.add("d-none");
    titulo.disabled = true;
    mostrarMensaje("Vista previa administrativa: la evaluación se muestra en modo de solo lectura.", "warning");
}

async function cargarEvaluacion() {
    const referencia = doc(db, "cursos", cursoId, "evaluacion", "final");
    const resultado = await getDoc(referencia);

    if (!resultado.exists()) {
        preguntas = [];
        evaluacionCreada = false;
        renderizarPreguntas();
        return;
    }

    const datos = resultado.data();
    titulo.value = datos.titulo || "Evaluación final";
    preguntas = Array.isArray(datos.preguntas)
        ? datos.preguntas.map(normalizarPregunta).filter(validarPregunta)
        : [];
    evaluacionCreada = true;
    botonEliminar.classList.toggle("d-none", soloLectura);
    renderizarPreguntas();
}

actualizarCamposPregunta();
renderizarPreguntas();

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario || !cursoId) {
        panel.classList.add("d-none");
        return;
    }

    try {
        const [perfilDoc, cursoDoc] = await Promise.all([
            getDoc(doc(db, "usuarios", usuario.uid)),
            getDoc(doc(db, "cursos", cursoId))
        ]);

        if (!perfilDoc.exists() || !cursoDoc.exists()) {
            throw new Error("datos-no-disponibles");
        }

        const perfil = perfilDoc.data();
        const curso = cursoDoc.data();
        const esAdmin = perfil.rol === "admin" && vistaSolicitada === "docente";
        const esPropietario = perfil.rol === "docente" && curso.docenteId === usuario.uid;

        if (!esAdmin && !esPropietario) {
            panel.classList.add("d-none");
            return;
        }

        if (esAdmin) {
            configurarSoloLectura();
        }

        await cargarEvaluacion();
    } catch (error) {
        console.error("No fue posible cargar la evaluación:", error);
        editor.classList.add("d-none");
        mostrarMensaje("No fue posible cargar la evaluación del curso.", "danger");
    }
});
