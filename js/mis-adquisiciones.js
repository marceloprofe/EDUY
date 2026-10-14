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

function mostrarAdquisiciones(adquisiciones) {
  const fragmento = document.createDocumentFragment();

  adquisiciones.forEach((adquisicion) => {
    const columna = document.createElement("div");
    columna.className = "col-12 col-md-6 col-xl-4";

    const tarjeta = document.createElement("article");
    tarjeta.className = "card tarjeta-curso-adquirido h-100 shadow-sm";

    const cuerpo = document.createElement("div");
    cuerpo.className = "card-body d-flex flex-column p-4";

    const estado = document.createElement("span");
    estado.className = `badge ${adquisicion.estado === "confirmada" ? "text-bg-success" : "text-bg-secondary"} align-self-start mb-3`;
    estado.textContent = adquisicion.estado === "confirmada"
      ? "Confirmada"
      : adquisicion.estado || "Estado no disponible";

    const titulo = document.createElement("h3");
    titulo.className = "h5 fw-bold";
    titulo.textContent = adquisicion.cursoTitulo || "Título no disponible";

    const fecha = document.createElement("p");
    fecha.className = "mb-2 text-body-secondary";
    fecha.textContent = `Adquirido: ${formatearFecha(adquisicion.fechaAdquisicion)}`;

    const importe = document.createElement("p");
    importe.className = "mb-4";
    importe.innerHTML = "<strong>Importe:</strong> ";
    importe.append(document.createTextNode(formatearImporte(adquisicion.importe)));

    const boton = document.createElement("a");
    boton.className = "btn btn-oro mt-auto w-100";
    boton.href = `./curso-estudiante.html?cursoId=${encodeURIComponent(adquisicion.cursoId)}`;
    boton.textContent = "Ingresar al contenido";

    cuerpo.append(estado, titulo, fecha, importe, boton);
    tarjeta.appendChild(cuerpo);
    columna.appendChild(tarjeta);
    fragmento.appendChild(columna);
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
