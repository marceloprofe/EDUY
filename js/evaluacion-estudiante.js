import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    PORCENTAJE_CERTIFICADO,
    PORCENTAJE_MINIMO,
    calcularResultado,
    normalizarPregunta,
    validarPregunta
} from "./evaluacion-utils.js";

const parametros = new URLSearchParams(window.location.search);
const cursoId = parametros.get("cursoId");
const vistaSolicitada = parametros.get("vista");

const seccion = document.querySelector("#seccionEvaluacion");
const titulo = document.querySelector("#tituloEvaluacionFinal");
const estado = document.querySelector("#estadoEvaluacion");
const mensaje = document.querySelector("#mensajeEvaluacion");
const formulario = document.querySelector("#formEvaluacion");
const resultado = document.querySelector("#resultadoEvaluacion");
const botonCertificado = document.querySelector("#verCertificado");

let usuarioActual = null;
let perfilActual = null;
let cursoActual = null;
let preguntas = [];
let porcentajeAvance = 0;
let modoVistaPrevia = false;
let ultimoResultado = null;

function escaparHTML(valor) {
    const elemento = document.createElement("div");
    elemento.textContent = String(valor ?? "");
    return elemento.innerHTML;
}

function mostrarMensaje(texto, variante = "info") {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${variante}`;
}

function actualizarDisponibilidad() {
    const habilitada = porcentajeAvance === 100 || modoVistaPrevia;

    formulario.querySelectorAll("input, button").forEach((control) => {
        control.disabled = !habilitada;
    });

    if (modoVistaPrevia) {
        estado.textContent = "Vista previa";
        estado.className = "badge text-bg-info";
        mostrarMensaje("Vista previa: podés responder la evaluación, pero el resultado no se guardará.", "info");
        return;
    }

    if (!habilitada) {
        estado.textContent = "Bloqueada";
        estado.className = "badge text-bg-secondary";
        mostrarMensaje("Completá el 100 % de los contenidos para realizar la evaluación.", "warning");
        return;
    }

    if (!ultimoResultado) {
        estado.textContent = "Disponible";
        estado.className = "badge text-bg-primary";
        mostrarMensaje(`La aprobación requiere más de ${PORCENTAJE_MINIMO} %.`, "info");
    }
}

function renderizarEvaluacion() {
    formulario.replaceChildren();

    preguntas.forEach((pregunta, indice) => {
        const grupo = document.createElement("fieldset");
        grupo.className = "border rounded p-3";

        const leyenda = document.createElement("legend");
        leyenda.className = "h5 fw-bold float-none w-auto px-2";
        leyenda.textContent = `${indice + 1}. ${pregunta.enunciado}`;
        grupo.appendChild(leyenda);

        pregunta.opciones.forEach((opcion, opcionIndice) => {
            const contenedor = document.createElement("div");
            contenedor.className = "form-check mb-2";

            const control = document.createElement("input");
            control.className = "form-check-input";
            control.type = "radio";
            control.name = `pregunta-${pregunta.id}`;
            control.id = `pregunta-${pregunta.id}-${opcionIndice}`;
            control.value = String(opcionIndice);
            control.required = true;

            const etiqueta = document.createElement("label");
            etiqueta.className = "form-check-label";
            etiqueta.htmlFor = control.id;
            etiqueta.textContent = opcion;

            contenedor.append(control, etiqueta);
            grupo.appendChild(contenedor);
        });

        formulario.appendChild(grupo);
    });

    const enviar = document.createElement("button");
    enviar.type = "submit";
    enviar.className = "btn btn-oro justify-self-start";
    enviar.textContent = "Corregir evaluación";
    formulario.appendChild(enviar);
    formulario.classList.remove("d-none");
    actualizarDisponibilidad();
}

function leerRespuestas() {
    const datos = new FormData(formulario);
    return Object.fromEntries(
        preguntas.map((pregunta) => [
            pregunta.id,
            datos.get(`pregunta-${pregunta.id}`)
        ])
    );
}

function mostrarResultado(datos) {
    ultimoResultado = datos;
    resultado.className = `alert alert-${datos.aprobado ? "success" : "warning"} mt-4`;
    resultado.textContent = datos.aprobado
        ? `Aprobaste con ${datos.porcentaje} % (${datos.correctas} de ${datos.total} respuestas correctas).`
        : `Obtuviste ${datos.porcentaje} % (${datos.correctas} de ${datos.total}). Necesitás más de ${PORCENTAJE_MINIMO} % para aprobar.`;

    estado.textContent = datos.aprobado ? "Aprobado" : "Reintentar";
    estado.className = `badge text-bg-${datos.aprobado ? "success" : "warning"}`;
    botonCertificado.classList.toggle("d-none", !datos.certificadoHabilitado);

    if (datos.aprobado && !datos.certificadoHabilitado) {
        resultado.textContent += ` Para obtener el certificado necesitás más de ${PORCENTAJE_CERTIFICADO} %.`;
    }
}

async function guardarResultado(datos) {
    const resultadoId = `${usuarioActual.uid}_${cursoId}`;
    const referencia = doc(db, "resultadosEvaluaciones", resultadoId);
    const anterior = await getDoc(referencia);
    const datosAnteriores = anterior.exists() ? anterior.data() : {};
    const porcentajeAnterior = Number(datosAnteriores.mejorPorcentaje) || 0;
    const esMejorResultado = !anterior.exists() || datos.porcentaje >= porcentajeAnterior;
    const mejorPorcentaje = Math.max(porcentajeAnterior, datos.porcentaje);

    const registro = {
        usuarioId: usuarioActual.uid,
        cursoId,
        correctas: esMejorResultado
            ? datos.correctas
            : Number(datosAnteriores.correctas) || 0,
        total: esMejorResultado
            ? datos.total
            : Number(datosAnteriores.total) || datos.total,
        porcentaje: mejorPorcentaje,
        mejorPorcentaje,
        aprobado: mejorPorcentaje > PORCENTAJE_MINIMO,
        certificadoHabilitado: mejorPorcentaje > PORCENTAJE_CERTIFICADO,
        intentos: (Number(datosAnteriores.intentos) || 0) + 1,
        fechaActualizacion: serverTimestamp()
    };

    if (!anterior.exists()) {
        registro.fechaCreacion = serverTimestamp();
    }

    await setDoc(referencia, registro, { merge: true });
    return {
        correctas: registro.correctas,
        total: registro.total,
        porcentaje: registro.porcentaje,
        aprobado: registro.aprobado,
        certificadoHabilitado: registro.certificadoHabilitado
    };
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = calcularResultado(preguntas, leerRespuestas());

    if (modoVistaPrevia) {
        mostrarResultado(datos);
        return;
    }

    try {
        formulario.querySelectorAll("input, button").forEach((control) => {
            control.disabled = true;
        });
        const guardado = await guardarResultado(datos);
        mostrarResultado(guardado);
    } catch (error) {
        console.error("No fue posible guardar el resultado:", error);
        mostrarMensaje("No fue posible guardar el resultado. Verificá las reglas de Firestore.", "danger");
    } finally {
        actualizarDisponibilidad();
    }
});

function abrirCertificado() {
    if (!ultimoResultado?.certificadoHabilitado) {
        return;
    }

    const nombre = perfilActual?.nombre || usuarioActual.displayName || usuarioActual.email;
    const ventana = window.open("", "_blank");

    if (!ventana) {
        mostrarMensaje("El navegador bloqueó el certificado. Permití las ventanas emergentes e intentá nuevamente.", "warning");
        return;
    }

    ventana.opener = null;

    ventana.document.write(`<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
        <title>Certificado EDUY</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 40px; color: #071c3a; background: #f4f6f9; }
            main { max-width: 900px; margin: auto; padding: 70px; background: white; border: 12px solid #071c3a; text-align: center; }
            h1 { font-size: 48px; margin: 0 0 32px; }
            h2 { font-size: 32px; margin: 24px 0; }
            .marca { color: #0b55b7; font-weight: bold; letter-spacing: 3px; }
            .nota { margin-top: 36px; font-size: 18px; }
            @media print { body { background: white; padding: 0; } main { border-width: 8px; } }
          </style>
        </head>
        <body>
          <main>
            <p class="marca">EDUY</p>
            <h1>Certificado de aprobación</h1>
            <p>Se certifica que</p>
            <h2>${escaparHTML(nombre)}</h2>
            <p>aprobó el curso</p>
            <h2>${escaparHTML(cursoActual.titulo || "Curso EDUY")}</h2>
            <p class="nota">Resultado: ${ultimoResultado.porcentaje} % · ${new Date().toLocaleDateString("es-UY")}</p>
            <p>Usá la opción Imprimir del navegador para guardarlo como PDF.</p>
          </main>
          <script>window.print();<\/script>
        </body>
      </html>`);
    ventana.document.close();
}

botonCertificado.addEventListener("click", abrirCertificado);

document.addEventListener("eduy:progreso-actualizado", (evento) => {
    porcentajeAvance = Number(evento.detail?.porcentaje) || 0;
    if (preguntas.length > 0) {
        actualizarDisponibilidad();
    }
});

async function iniciarEvaluacion(usuario) {
    const [perfilDoc, cursoDoc, evaluacionDoc] = await Promise.all([
        getDoc(doc(db, "usuarios", usuario.uid)),
        getDoc(doc(db, "cursos", cursoId)),
        getDoc(doc(db, "cursos", cursoId, "evaluacion", "final"))
    ]);

    if (!perfilDoc.exists() || !cursoDoc.exists() || !evaluacionDoc.exists()) {
        return;
    }

    perfilActual = perfilDoc.data();
    cursoActual = cursoDoc.data();
    modoVistaPrevia = perfilActual.rol === "admin"
        || (perfilActual.rol === "docente" && vistaSolicitada === "docente");

    preguntas = Array.isArray(evaluacionDoc.data().preguntas)
        ? evaluacionDoc.data().preguntas.map(normalizarPregunta).filter(validarPregunta)
        : [];

    if (preguntas.length === 0) {
        return;
    }

    titulo.textContent = evaluacionDoc.data().titulo || "Evaluación final";
    seccion.classList.remove("d-none");

    if (!modoVistaPrevia) {
        const progresoDoc = await getDoc(doc(db, "progresos", `${usuario.uid}_${cursoId}`));
        porcentajeAvance = progresoDoc.exists()
            ? Number(progresoDoc.data().porcentaje) || 0
            : 0;

        const resultadoDoc = await getDoc(doc(db, "resultadosEvaluaciones", `${usuario.uid}_${cursoId}`));
        if (resultadoDoc.exists()) {
            const datos = resultadoDoc.data();
            mostrarResultado({
                correctas: Number(datos.correctas) || 0,
                total: Number(datos.total) || preguntas.length,
                porcentaje: Number(datos.mejorPorcentaje) || Number(datos.porcentaje) || 0,
                aprobado: datos.aprobado === true,
                certificadoHabilitado: datos.certificadoHabilitado === true
                    || (Number(datos.mejorPorcentaje) || Number(datos.porcentaje) || 0) > PORCENTAJE_CERTIFICADO
            });
        }
    }

    renderizarEvaluacion();
}

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario || !cursoId) {
        return;
    }

    usuarioActual = usuario;

    try {
        await iniciarEvaluacion(usuario);
    } catch (error) {
        console.error("No fue posible cargar la evaluación:", error);
        seccion.classList.remove("d-none");
        mostrarMensaje("No fue posible cargar la evaluación final.", "danger");
    }
});
