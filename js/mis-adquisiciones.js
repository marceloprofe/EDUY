import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const lista = document.querySelector("#listaAdquisiciones");
const mensajeEstado = document.querySelector("#estadoAdquisiciones");
const mensajeVacio = document.querySelector("#mensajeSinAdquisiciones");

let versionConsulta = 0;

function mostrarEstado(texto, tipo = "info") {
  mensajeEstado.textContent = texto;
  mensajeEstado.className = `alert alert-${tipo}`;
  mensajeVacio.classList.add("d-none");
}

function obtenerFecha(fecha) {
  return typeof fecha?.toDate === "function"
    ? fecha.toDate()
    : null;
}

function formatearFecha(fecha) {
  const valor = obtenerFecha(fecha);

  if (!valor || Number.isNaN(valor.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-UY", {
    dateStyle: "medium",
    timeZone: "America/Montevideo"
  }).format(valor);
}

function formatearImporte(importe) {
  if (typeof importe !== "number" || !Number.isFinite(importe)) {
    return "Importe no disponible";
  }

  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "UYU"
  }).format(importe);
}

function agregarCelda(fila, texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  fila.appendChild(celda);
}

function mostrarAdquisiciones(adquisiciones) {
  const fragmento = document.createDocumentFragment();

  adquisiciones.forEach((adquisicion) => {
    const fila = document.createElement("tr");

    agregarCelda(
      fila,
      adquisicion.cursoTitulo || "Título no disponible"
    );
    agregarCelda(
      fila,
      formatearFecha(adquisicion.fechaAdquisicion)
    );
    agregarCelda(
      fila,
      formatearImporte(adquisicion.importe)
    );
    agregarCelda(
      fila,
      adquisicion.estado === "confirmada"
        ? "Confirmada"
        : adquisicion.estado || "Estado no disponible"
    );

    fragmento.appendChild(fila);
  });

  lista.replaceChildren(fragmento);
}

onAuthStateChanged(auth, async (usuario) => {
  const versionActual = ++versionConsulta;

  lista.replaceChildren();
  mensajeVacio.classList.add("d-none");

  if (!usuario) {
    window.location.replace("./login.html");
    return;
  }

  mostrarEstado("Cargando adquisiciones…");

  try {
    const perfil = await getDoc(
      doc(db, "usuarios", usuario.uid)
    );

    if (versionActual !== versionConsulta) {
      return;
    }

    if (!perfil.exists() || perfil.data().rol !== "estudiante") {
      window.location.replace("./acceso-denegado.html");
      return;
    }

    const consulta = query(
      collection(db, "adquisiciones"),
      where("usuarioId", "==", usuario.uid)
    );

    const resultado = await getDocs(consulta);

    // Evita mostrar resultados de una sesión anterior.
    if (versionActual !== versionConsulta) {
      return;
    }

    const adquisiciones = resultado.docs.map(
      (documento) => documento.data()
    );

    adquisiciones.sort((primera, segunda) => {
      const fechaPrimera =
        obtenerFecha(primera.fechaAdquisicion)?.getTime() || 0;
      const fechaSegunda =
        obtenerFecha(segunda.fechaAdquisicion)?.getTime() || 0;

      return fechaSegunda - fechaPrimera;
    });

    mostrarAdquisiciones(adquisiciones);
    mensajeEstado.classList.add("d-none");

    mensajeVacio.classList.toggle(
      "d-none",
      adquisiciones.length !== 0
    );
  } catch (error) {
    if (versionActual !== versionConsulta) {
      return;
    }

    console.error("No fue posible cargar las adquisiciones:", error);
    lista.replaceChildren();

    mostrarEstado(
      "No fue posible cargar tu historial. Intentá nuevamente más tarde.",
      "danger"
    );
  }
});