import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, getDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {
  CURSO_HTML_CSS_ID,
  buscarContenidoHtmlCss,
  contenidosHtmlCss
} from "./curso-html-css-contenidos.js";

const mensajeAula = document.querySelector("#mensajeAula");
const aulaCurso = document.querySelector("#aulaCurso");
const indiceLecciones = document.querySelector("#indiceLecciones");
const porcentajeAula = document.querySelector("#porcentajeAula");
const barraAula = document.querySelector("#barraAula");
const contenedorBarra = barraAula.parentElement;
const tipoLeccion = document.querySelector("#tipoLeccion");
const duracionLeccion = document.querySelector("#duracionLeccion");
const estadoLeccion = document.querySelector("#estadoLeccion");
const tituloLeccion = document.querySelector("#tituloLeccion");
const descripcionLeccion = document.querySelector("#descripcionLeccion");
const listaObjetivos = document.querySelector("#listaObjetivos");
const contenidoTeorico = document.querySelector("#contenidoTeorico");
const bloqueCodigo = document.querySelector("#bloqueCodigo");
const codigoLeccion = document.querySelector("#codigoLeccion");
const btnCopiarCodigo = document.querySelector("#btnCopiarCodigo");
const laboratorio = document.querySelector("#laboratorio");
const editorHtml = document.querySelector("#editorHtml");
const editorCss = document.querySelector("#editorCss");
const btnActualizarPreview = document.querySelector("#btnActualizarPreview");
const vistaPrevia = document.querySelector("#vistaPrevia");
const actividadSimple = document.querySelector("#actividadSimple");
const formActividad = document.querySelector("#formActividad");
const preguntaActividad = document.querySelector("#preguntaActividad");
const opcionesActividad = document.querySelector("#opcionesActividad");
const evaluacionFinal = document.querySelector("#evaluacionFinal");
const formEvaluacion = document.querySelector("#formEvaluacion");
const retroalimentacion = document.querySelector("#retroalimentacion");
const btnAnterior = document.querySelector("#btnAnterior");
const btnCompletar = document.querySelector("#btnCompletar");
const btnSiguiente = document.querySelector("#btnSiguiente");

const parametros = new URLSearchParams(window.location.search);
const contenidoInicial = parametros.get("leccion");
const modoVistaPrevia = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  && parametros.get("demo") === "1";

let usuarioActual = null;
let contenidoActual = buscarContenidoHtmlCss(contenidoInicial);
let contenidosCompletados = new Set();
let progresoCreado = false;

const etiquetasTipo = {
  leccion: "Lección",
  practica: "Práctica",
  proyecto: "Proyecto",
  evaluacion: "Evaluación"
};

function mostrarMensaje(texto, tipo = "info") {
  mensajeAula.textContent = texto;
  mensajeAula.className = `alert alert-${tipo}`;
}

function ocultarMensaje() {
  mensajeAula.classList.add("d-none");
}

function porcentajeActual() {
  const completadosValidos = contenidosHtmlCss.filter((contenido) =>
    contenidosCompletados.has(contenido.id)
  ).length;

  return Math.round((completadosValidos / contenidosHtmlCss.length) * 100);
}

function actualizarProgresoVisual() {
  const porcentaje = porcentajeActual();
  porcentajeAula.textContent = `${porcentaje}%`;
  barraAula.style.width = `${porcentaje}%`;
  contenedorBarra.setAttribute("aria-valuenow", String(porcentaje));
  barraAula.classList.toggle("bg-success", porcentaje === 100);
}

function urlLeccion(id) {
  const vistaPrevia = modoVistaPrevia ? "&demo=1" : "";
  return `./aula-html-css.html?leccion=${encodeURIComponent(id)}${vistaPrevia}`;
}

function renderizarIndice() {
  const fragmento = document.createDocumentFragment();

  contenidosHtmlCss.forEach((contenido) => {
    const enlace = document.createElement("a");
    enlace.href = urlLeccion(contenido.id);
    enlace.className = "list-group-item list-group-item-action aula-indice-enlace";
    enlace.classList.toggle("active", contenido.id === contenidoActual.id);
    enlace.setAttribute("aria-current", contenido.id === contenidoActual.id ? "page" : "false");

    const numero = document.createElement("span");
    numero.className = "aula-indice-numero";
    numero.textContent = String(contenido.orden);

    const texto = document.createElement("span");
    texto.className = "flex-grow-1";
    texto.textContent = contenido.titulo.replace(/^\d+\.\s*/, "");

    const estado = document.createElement("span");
    const completado = contenidosCompletados.has(contenido.id);
    estado.className = completado ? "aula-check completado" : "aula-check";
    estado.textContent = completado ? "✓" : "";
    estado.setAttribute("aria-label", completado ? "Completado" : "Pendiente");

    enlace.append(numero, texto, estado);
    fragmento.appendChild(enlace);
  });

  indiceLecciones.replaceChildren(fragmento);
}

function crearOpcion(nombre, indice, texto) {
  const contenedor = document.createElement("div");
  contenedor.className = "form-check aula-opcion";

  const input = document.createElement("input");
  input.className = "form-check-input";
  input.type = "radio";
  input.name = nombre;
  input.id = `${nombre}-${indice}`;
  input.value = String(indice);
  input.required = true;

  const label = document.createElement("label");
  label.className = "form-check-label w-100";
  label.htmlFor = input.id;
  label.textContent = texto;

  contenedor.append(input, label);
  return contenedor;
}

function renderizarActividadSimple() {
  actividadSimple.classList.remove("d-none");
  evaluacionFinal.classList.add("d-none");
  preguntaActividad.textContent = contenidoActual.pregunta;
  opcionesActividad.replaceChildren();

  contenidoActual.opciones.forEach((opcion, indice) => {
    opcionesActividad.appendChild(crearOpcion("respuesta", indice, opcion));
  });
}

function renderizarEvaluacion() {
  actividadSimple.classList.add("d-none");
  evaluacionFinal.classList.remove("d-none");
  formEvaluacion.replaceChildren();

  contenidoActual.evaluacion.forEach((item, numeroPregunta) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "aula-pregunta";

    const legend = document.createElement("legend");
    legend.className = "fs-6 fw-semibold mb-3";
    legend.textContent = `${numeroPregunta + 1}. ${item.pregunta}`;
    fieldset.appendChild(legend);

    item.opciones.forEach((opcion, indice) => {
      fieldset.appendChild(crearOpcion(`evaluacion-${numeroPregunta}`, indice, opcion));
    });

    formEvaluacion.appendChild(fieldset);
  });

  const boton = document.createElement("button");
  boton.type = "submit";
  boton.className = "btn btn-primary";
  boton.textContent = "Corregir evaluación";
  formEvaluacion.appendChild(boton);
}

function actualizarVistaPrevia() {
  const html = editorHtml.value;
  const css = editorCss.value;
  vistaPrevia.srcdoc = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><style>${css}</style></head><body>${html}</body></html>`;
}

function prepararLaboratorio() {
  laboratorio.classList.toggle("d-none", !contenidoActual.laboratorio);

  if (!contenidoActual.laboratorio) {
    return;
  }

  editorHtml.value = `<main class="hero">\n  <p class="etiqueta">Curso EDUY</p>\n  <h1>Aprendé creando</h1>\n  <p>Programación, robótica y tecnología mediante proyectos.</p>\n  <a href="#cursos">Ver cursos</a>\n</main>`;
  editorCss.value = `* { box-sizing: border-box; }\nbody { margin: 0; font-family: system-ui, sans-serif; }\n.hero { min-height: 100vh; padding: 4rem 2rem; color: white; background: #0a1d36; }\n.etiqueta { color: #ffd34d; font-weight: 700; }\nh1 { font-size: clamp(2.5rem, 8vw, 5rem); margin: .25rem 0; }\na { display: inline-block; margin-top: 1rem; padding: .75rem 1rem; border-radius: .75rem; color: #061225; background: #ffd34d; font-weight: 700; text-decoration: none; }`;
  actualizarVistaPrevia();
}

function renderizarNavegacion() {
  const indice = contenidosHtmlCss.findIndex((contenido) => contenido.id === contenidoActual.id);
  const anterior = contenidosHtmlCss[indice - 1];
  const siguiente = contenidosHtmlCss[indice + 1];

  btnAnterior.classList.toggle("invisible", !anterior);
  btnAnterior.href = anterior ? urlLeccion(anterior.id) : "#";
  btnSiguiente.classList.toggle("invisible", !siguiente);
  btnSiguiente.href = siguiente ? urlLeccion(siguiente.id) : "#";
}

function actualizarBotonCompletar() {
  const completado = contenidosCompletados.has(contenidoActual.id);
  estadoLeccion.textContent = completado ? "Completada" : "Pendiente";
  estadoLeccion.className = `badge ${completado ? "text-bg-success" : "text-bg-secondary"}`;
  btnCompletar.disabled = completado;
  btnCompletar.textContent = completado ? "✓ Lección completada" : "Completar lección";
}

function renderizarLeccion() {
  tipoLeccion.textContent = etiquetasTipo[contenidoActual.tipo] || "Contenido";
  duracionLeccion.textContent = contenidoActual.duracion;
  tituloLeccion.textContent = contenidoActual.titulo;
  descripcionLeccion.textContent = contenidoActual.descripcion;
  document.title = `${contenidoActual.titulo} | EDUY`;

  listaObjetivos.replaceChildren();
  contenidoActual.objetivos.forEach((objetivo) => {
    const item = document.createElement("li");
    item.textContent = objetivo;
    listaObjetivos.appendChild(item);
  });

  contenidoTeorico.replaceChildren();
  contenidoActual.teoria.forEach((parrafo) => {
    const elemento = document.createElement("p");
    elemento.textContent = parrafo;
    contenidoTeorico.appendChild(elemento);
  });

  const tieneCodigo = Boolean(contenidoActual.codigo);
  bloqueCodigo.classList.toggle("d-none", !tieneCodigo);
  codigoLeccion.textContent = tieneCodigo ? contenidoActual.codigo : "";

  prepararLaboratorio();
  contenidoActual.tipo === "evaluacion" ? renderizarEvaluacion() : renderizarActividadSimple();
  retroalimentacion.classList.add("d-none");
  btnCompletar.disabled = true;
  renderizarNavegacion();
  actualizarBotonCompletar();
}

function mostrarRetroalimentacion(texto, tipo) {
  retroalimentacion.textContent = texto;
  retroalimentacion.className = `alert alert-${tipo} mt-3`;
}

async function guardarProgreso() {
  if (modoVistaPrevia) {
    progresoCreado = true;
    return;
  }

  const progresoId = `${usuarioActual.uid}_${CURSO_HTML_CSS_ID}`;
  const datos = {
    usuarioId: usuarioActual.uid,
    cursoId: CURSO_HTML_CSS_ID,
    contenidosCompletados: Array.from(contenidosCompletados),
    porcentaje: porcentajeActual(),
    fechaActualizacion: serverTimestamp()
  };

  if (!progresoCreado) {
    datos.fechaCreacion = serverTimestamp();
  }

  await setDoc(doc(db, "progresos", progresoId), datos, { merge: true });
  progresoCreado = true;
}

async function completarLeccion() {
  if (contenidosCompletados.has(contenidoActual.id)) {
    return;
  }

  btnCompletar.disabled = true;
  btnCompletar.textContent = "Guardando...";
  contenidosCompletados.add(contenidoActual.id);

  try {
    await guardarProgreso();
    actualizarProgresoVisual();
    renderizarIndice();
    actualizarBotonCompletar();
    mostrarRetroalimentacion(
      porcentajeActual() === 100
        ? "¡Curso completado! Terminaste todas las unidades de HTML y CSS."
        : "Lección completada. Tu avance quedó guardado.",
      "success"
    );
  } catch (error) {
    console.error("No fue posible guardar el progreso:", error);
    contenidosCompletados.delete(contenidoActual.id);
    btnCompletar.disabled = false;
    btnCompletar.textContent = "Completar lección";
    mostrarRetroalimentacion("No fue posible guardar el avance. Intentá nuevamente.", "danger");
  }
}

async function cargarProgreso() {
  const progresoId = `${usuarioActual.uid}_${CURSO_HTML_CSS_ID}`;
  const resultado = await getDoc(doc(db, "progresos", progresoId));

  if (!resultado.exists()) {
    contenidosCompletados = new Set();
    progresoCreado = false;
    return;
  }

  const validos = new Set(contenidosHtmlCss.map((contenido) => contenido.id));
  const guardados = resultado.data().contenidosCompletados;
  contenidosCompletados = new Set(
    Array.isArray(guardados) ? guardados.filter((id) => validos.has(id)) : []
  );
  progresoCreado = true;
}

async function verificarAcceso(usuario) {
  const [perfil, adquisicion] = await Promise.all([
    getDoc(doc(db, "usuarios", usuario.uid)),
    getDoc(doc(db, "adquisiciones", `${usuario.uid}_${CURSO_HTML_CSS_ID}`))
  ]);

  return perfil.exists()
    && perfil.data().rol === "estudiante"
    && adquisicion.exists()
    && adquisicion.data().estado === "confirmada";
}

formActividad.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const respuesta = new FormData(formActividad).get("respuesta");

  if (Number(respuesta) === contenidoActual.correcta) {
    btnCompletar.disabled = contenidosCompletados.has(contenidoActual.id);
    mostrarRetroalimentacion(`¡Correcto! ${contenidoActual.explicacion}`, "success");
  } else {
    btnCompletar.disabled = true;
    mostrarRetroalimentacion("Todavía no es correcto. Revisá el contenido y volvé a intentarlo.", "warning");
  }
});

formEvaluacion.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const datos = new FormData(formEvaluacion);
  let correctas = 0;

  contenidoActual.evaluacion.forEach((item, indice) => {
    if (Number(datos.get(`evaluacion-${indice}`)) === item.correcta) {
      correctas += 1;
    }
  });

  const porcentaje = Math.round((correctas / contenidoActual.evaluacion.length) * 100);
  const aprobado = porcentaje >= 80;
  btnCompletar.disabled = !aprobado || contenidosCompletados.has(contenidoActual.id);
  mostrarRetroalimentacion(
    aprobado
      ? `Aprobaste con ${porcentaje}%. Ya podés completar la evaluación.`
      : `Obtuviste ${porcentaje}%. Necesitás 80% para aprobar; revisá las respuestas e intentá nuevamente.`,
    aprobado ? "success" : "warning"
  );
});

btnCompletar.addEventListener("click", completarLeccion);
btnActualizarPreview.addEventListener("click", actualizarVistaPrevia);
btnCopiarCodigo.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(contenidoActual.codigo);
    btnCopiarCodigo.textContent = "Copiado ✓";
    window.setTimeout(() => { btnCopiarCodigo.textContent = "Copiar código"; }, 1800);
  } catch {
    mostrarRetroalimentacion("Seleccioná el código y copialo manualmente.", "info");
  }
});

onAuthStateChanged(auth, async (usuario) => {
  if (modoVistaPrevia) {
    usuarioActual = { uid: "vista-previa" };
    contenidosCompletados = new Set();
    progresoCreado = true;
    contenidoActual = buscarContenidoHtmlCss(contenidoInicial);
    renderizarIndice();
    renderizarLeccion();
    actualizarProgresoVisual();
    aulaCurso.classList.remove("d-none");
    ocultarMensaje();
    return;
  }

  if (!usuario) {
    window.location.replace("./login.html");
    return;
  }

  try {
    const tieneAcceso = await verificarAcceso(usuario);
    if (!tieneAcceso) {
      window.location.replace("./acceso-denegado.html");
      return;
    }

    usuarioActual = usuario;
    await cargarProgreso();
    contenidoActual = buscarContenidoHtmlCss(contenidoInicial);
    renderizarIndice();
    renderizarLeccion();
    actualizarProgresoVisual();
    aulaCurso.classList.remove("d-none");
    ocultarMensaje();
  } catch (error) {
    console.error("No fue posible abrir el aula:", error);
    mostrarMensaje("No fue posible cargar el aula. Verificá la conexión e intentá nuevamente.", "danger");
  }
});
