import { auth, db } from "./firebase-config.js";
import { obtenerCursoFirestore } from "./cursos-datos.js";
import {
  escaparHTML,
  resolverImagen,
  prepararImagenes,
  nombresNivel
} from "./curso-utils.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  addDoc,
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  query,
  runTransaction,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const parametros = new URLSearchParams(window.location.search);
const cursoIdFirestore = parametros.get("cursoId") || parametros.get("id");
const vieneDeMisCursos = parametros.get("origen") === "mis-cursos";

let curso = null;
let errorConsulta = false;
function obtenerUrlVideoYouTube(url) {
  const coincidencia = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );

  return coincidencia
    ? `https://www.youtube-nocookie.com/embed/${coincidencia[1]}`
    : "";
}

function esperarUsuarioAutenticado() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve) => {
    const dejarDeObservar = onAuthStateChanged(auth, (usuario) => {
      dejarDeObservar();
      resolve(usuario);
    });
  });
}

async function obtenerResumenValoraciones(docenteId) {
  const referenciaValoraciones = collection(db, "valoracionesDocentes");
  const consultaValoraciones = query(
    referenciaValoraciones,
    where("docenteId", "==", docenteId)
  );
  const resultado = await getDocsFromServer(consultaValoraciones);

  const valoraciones = resultado.docs.map((documento) => documento.data());
  const cantidadValoraciones = valoraciones.length;
  const sumaEstrellas = valoraciones.reduce(
    (suma, valoracion) => suma + Number(valoracion.estrellas || 0),
    0
  );

  return {
    cantidad: cantidadValoraciones,
    promedio: cantidadValoraciones
      ? sumaEstrellas / cantidadValoraciones
      : 0
  };
}

function actualizarResumenEnPantalla(resumen) {
  const elementoResumen = document.querySelector("#resumenValoracionesDocente");
  if (!elementoResumen) return;

  if (resumen.cantidad === 0) {
    elementoResumen.textContent = "Todavía no hay valoraciones para este docente.";
    return;
  }

  elementoResumen.textContent =
    `${resumen.promedio.toFixed(1)} de 5 estrellas · ` +
    `${resumen.cantidad} ${resumen.cantidad === 1 ? "valoración" : "valoraciones"}`;
}

function actualizarEstrellasSeleccionadas(raiz, valor) {
  const botones = raiz.querySelectorAll("[data-estrella]");

  botones.forEach((boton) => {
    const numero = Number(boton.dataset.estrella);
    const seleccionada = numero <= valor;

    boton.textContent = seleccionada ? "★" : "☆";
    boton.classList.toggle("text-warning", seleccionada);
    boton.classList.toggle("text-secondary", !seleccionada);
    boton.setAttribute("aria-pressed", String(numero === valor));
  });
}

function mostrarFormularioValoracion(raiz, valoracionExistente = null) {
  const formulario = raiz.querySelector("#formularioValoracionDocente");
  const mensaje = raiz.querySelector("#mensajeValoracionDocente");
  const campoComentario = raiz.querySelector("#comentarioValoracionDocente");
  const botonGuardar = raiz.querySelector("#guardarValoracionDocente");
  const estado = raiz.querySelector("#estadoValoracionDocente");
  let estrellasSeleccionadas = Number(valoracionExistente?.estrellas || 0);

  formulario.classList.remove("d-none");
  campoComentario.value = valoracionExistente?.comentario || "";
  estado.textContent = valoracionExistente
    ? "Ya valoraste a este docente. Podés modificar tu valoración."
    : "Podés enviar una valoración y modificarla más adelante.";

  actualizarEstrellasSeleccionadas(raiz, estrellasSeleccionadas);

  raiz.querySelectorAll("[data-estrella]").forEach((boton) => {
    boton.addEventListener("click", () => {
      estrellasSeleccionadas = Number(boton.dataset.estrella);
      actualizarEstrellasSeleccionadas(raiz, estrellasSeleccionadas);
      mensaje.className = "small mt-2";
      mensaje.textContent = "";
    });
  });

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (estrellasSeleccionadas < 1 || estrellasSeleccionadas > 5) {
      mensaje.className = "small mt-2 text-danger";
      mensaje.textContent = "Seleccioná una cantidad de estrellas.";
      return;
    }

    const comentario = campoComentario.value.trim();
    if (comentario.length > 500) {
      mensaje.className = "small mt-2 text-danger";
      mensaje.textContent = "El comentario no puede superar los 500 caracteres.";
      return;
    }

    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando…";
    mensaje.className = "small mt-2";
    mensaje.textContent = "";

    try {
      const usuario = auth.currentUser;
      if (!usuario) {
        throw new Error("sesion-finalizada");
      }

      const idValoracion = `${usuario.uid}_${curso.id}`;
      const referenciaValoracion = doc(
        db,
        "valoracionesDocentes",
        idValoracion
      );

      await runTransaction(db, async (transaccion) => {
        const valoracionActual = await transaccion.get(referenciaValoracion);

        const camposEditables = {
          estrellas: estrellasSeleccionadas,
          comentario,
          fechaActualizacion: serverTimestamp()
        };

        if (valoracionActual.exists()) {
          transaccion.update(referenciaValoracion, camposEditables);
        } else {
          transaccion.set(referenciaValoracion, {
            estudianteId: usuario.uid,
            cursoId: curso.id,
            docenteId: curso.docenteId,
            estrellas: estrellasSeleccionadas,
            comentario,
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp()
          });
        }
      });

      mensaje.className = "small mt-2 text-success";
      mensaje.textContent = "Tu valoración quedó guardada.";
      estado.textContent = "Ya valoraste a este docente. Podés modificar tu valoración.";

      try {
        const resumen = await obtenerResumenValoraciones(curso.docenteId);
        actualizarResumenEnPantalla(resumen);
      } catch (errorResumen) {
        console.error("La valoración se guardó, pero no se actualizó el promedio:", errorResumen);
      }
    } catch (error) {
      console.error("No fue posible guardar la valoración:", error);
      mensaje.className = "small mt-2 text-danger";
      mensaje.textContent = error.message === "sesion-finalizada"
        ? "Tu sesión terminó. Ingresá nuevamente para valorar."
        : "No pudimos guardar la valoración. Revisá tu conexión e intentá de nuevo.";
    } finally {
      botonGuardar.disabled = false;
      botonGuardar.textContent = "Guardar valoración";
    }
  });
}

async function prepararValoracionesDocente(cursoActual) {
  const raiz = document.querySelector("#valoracionesDocente");
  const elementoResumen = raiz.querySelector("#resumenValoracionesDocente");
  const areaAccion = raiz.querySelector("#accionValoracionDocente");

  if (!cursoActual.docenteId) {
    elementoResumen.textContent =
      "Este curso todavía no tiene un docente asignado para recibir valoraciones.";
    areaAccion.textContent = "";
    return;
  }

  try {
    const usuario = await esperarUsuarioAutenticado();

    if (!usuario) {
      elementoResumen.textContent = "Ingresá para consultar las valoraciones.";
      areaAccion.innerHTML = `
        <a href="./login.html" class="btn btn-outline-secondary btn-sm">
          Ingresar
        </a>`;
      return;
    }

    const referenciaPerfil = doc(db, "usuarios", usuario.uid);
    const documentoPerfil = await getDocFromServer(referenciaPerfil);
    const perfil = documentoPerfil.exists() ? documentoPerfil.data() : null;

    if (!perfil) {
      elementoResumen.textContent = "No se encontró tu perfil de usuario.";
      areaAccion.textContent = "";
      return;
    }

    const resumen = await obtenerResumenValoraciones(cursoActual.docenteId);
    actualizarResumenEnPantalla(resumen);

    if (perfil.rol !== "estudiante") {
      areaAccion.textContent = "Solo los estudiantes pueden valorar a sus docentes.";
      return;
    }

    const referenciaAdquisicion = doc(
      db,
      "adquisiciones",
      `${usuario.uid}_${cursoActual.id}`
    );
    const documentoAdquisicion = await getDocFromServer(referenciaAdquisicion);

    if (
      !documentoAdquisicion.exists() ||
      documentoAdquisicion.data().estado !== "confirmada"
    ) {
      areaAccion.textContent =
        "Podés valorar al docente cuando hayas adquirido este curso.";
      return;
    }

    const referenciaValoracion = doc(
      db,
      "valoracionesDocentes",
      `${usuario.uid}_${cursoActual.id}`
    );
    const documentoValoracion = await getDocFromServer(referenciaValoracion);
    const valoracionExistente = documentoValoracion.exists()
      ? documentoValoracion.data()
      : null;

    areaAccion.innerHTML = `
      <form id="formularioValoracionDocente">
        <fieldset class="mb-3">
          <legend class="form-label fs-6 mb-2">Tu calificación</legend>
          <div role="group" aria-label="Elegir de una a cinco estrellas">
            ${[1, 2, 3, 4, 5].map((numero) => `
              <button
                type="button"
                class="btn btn-link fs-3 p-0 me-1 text-secondary"
                data-estrella="${numero}"
                aria-label="${numero} ${numero === 1 ? "estrella" : "estrellas"}"
                aria-pressed="false"
              >☆</button>`).join("")}
          </div>
        </fieldset>

        <label for="comentarioValoracionDocente" class="form-label">
          Comentario (opcional)
        </label>
        <textarea
          id="comentarioValoracionDocente"
          class="form-control mb-3"
          rows="3"
          maxlength="500"
          placeholder="Contanos brevemente tu experiencia"
        ></textarea>

        <p id="estadoValoracionDocente" class="small text-body-secondary"></p>
        <p id="mensajeValoracionDocente" class="small mt-2" role="status" aria-live="polite"></p>

        <button id="guardarValoracionDocente" type="submit" class="btn btn-oro">
          Guardar valoración
        </button>
      </form>`;

    mostrarFormularioValoracion(raiz, valoracionExistente);
  } catch (error) {
    console.error("No fue posible cargar las valoraciones:", error);
    elementoResumen.textContent =
      "No pudimos cargar las valoraciones. Revisá tu conexión e intentá nuevamente.";
    areaAccion.textContent = "";
  }
}

if (cursoIdFirestore) {
  document.querySelector("#app").textContent = "Cargando curso…";

  try {
    const datos = await obtenerCursoFirestore(cursoIdFirestore);

    if (datos) {
      // Una apertura de detalle equivale a una visita, sin guardar datos personales.
      if (datos.habilitado === true) {
        addDoc(collection(db, "visitasCursos"), {
          cursoId: datos.id,
          fecha: serverTimestamp()
        }).catch(error => console.warn("No se pudo registrar la visita al curso.", error));
      }
      curso = {
        id: datos.id,
        titulo: escaparHTML(datos.titulo || "Curso sin título"),
        descripcion: escaparHTML(
          datos.descripcion || "Descripción no disponible."
        ),
        nivel: nombresNivel[datos.nivel] || "Básico",
        imagen: escaparHTML(resolverImagen(datos.imagen)),
        videoPresentacion:
          typeof datos.videoPresentacion === "string"
            ? datos.videoPresentacion
            : "",
        docenteNombre: escaparHTML(datos.docenteNombre || "Equipo EDUY"),
        docenteId: typeof datos.docenteId === "string" ? datos.docenteId : "",
        duracion: escaparHTML(datos.duracion || "No especificada"),
        modulos: Array.isArray(datos.modulos)
          ? datos.modulos
            .filter((modulo) => modulo && typeof modulo === "object")
            .map((modulo) => [
              escaparHTML(modulo.titulo),
              escaparHTML(modulo.descripcion)
            ])
          : []
      };
    }
  } catch (error) {
    console.error("No fue posible consultar el curso:", error);
    errorConsulta = true;
  }
}

if (!curso) {
  const mensaje = errorConsulta
    ? "No fue posible cargar el curso. Intentá nuevamente más tarde."
    : "El curso no existe o no está disponible.";

  document.querySelector("#app").innerHTML = `
    <main class="container py-5">
      <div class="alert alert-warning" role="alert">
        ${mensaje}
      </div>
      <a href="./cursos.html" class="btn btn-oro">Volver al catálogo</a>
    </main>`;
} else {
  document.title = `${curso.titulo} | EDUY`;

  const modulos = curso.modulos.map(([titulo, descripcion], indice) => `
    <article class="modulo-curso card h-100">
      <div class="card-body">
        <span class="numero-modulo">${indice + 1}</span>
        <h2 class="h5 mt-3">Módulo ${indice + 1}: ${titulo}</h2>
        <p class="mb-0">${descripcion}</p>
      </div>
    </article>`).join("");
  const urlVideoPresentacion =
    obtenerUrlVideoYouTube(curso.videoPresentacion);

  const seccionVideoPresentacion = urlVideoPresentacion
    ? `
    <section class="card mt-4">
      <div class="card-body">
        <h2 class="h4">Presentación del curso</h2>
        <div class="ratio ratio-16x9">
          <iframe
            src="${urlVideoPresentacion}"
            title="Presentación de ${curso.titulo}"
            loading="lazy"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </section>`
    : "";

  const usuarioSesion = await esperarUsuarioAutenticado();
  let cursoAdquirido = false;

  if (usuarioSesion) {
    try {
      const referenciaAdquisicion = doc(
        db,
        "adquisiciones",
        `${usuarioSesion.uid}_${curso.id}`
      );
      const documentoAdquisicion = await getDocFromServer(
        referenciaAdquisicion
      );

      cursoAdquirido =
        documentoAdquisicion.exists() &&
        documentoAdquisicion.data().estado === "confirmada";
    } catch (error) {
      console.error("No fue posible comprobar la adquisición:", error);
    }
  }

  const botonPrincipal = vieneDeMisCursos
    ? '<a href="./mis-adquisiciones.html" class="btn btn-oro w-100 mb-2">Volver a Mis cursos adquiridos</a>'
    : cursoAdquirido
      ? `<a href="./curso-estudiante.html?cursoId=${encodeURIComponent(curso.id)}" class="btn btn-oro w-100 mb-2">Ir al curso</a>`
      : `<a href="./adquisicion.html?cursoId=${encodeURIComponent(curso.id)}" class="btn btn-oro w-100 mb-2">Adquirir curso</a>`;

  document.querySelector("#app").innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="../index.html">
          <img src="../img/logo.png" class="logo-navbar" alt="Logo de EDUY" />
          <span class="h4 mb-0">Bienvenido a EDUY</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Mostrar navegación">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menuPrincipal">
          <ul class="navbar-nav ms-auto" data-menu-sesion hidden>
            <li class="nav-item"><a class="nav-link" href="../index.html">Inicio</a></li>
            <li class="nav-item"><a class="nav-link active" href="./cursos.html">Cursos</a></li>
            <li class="nav-item"><a class="nav-link" href="./login.html" data-auth-login>Ingresar</a></li>
            <li class="nav-item"><a class="nav-link" href="./registro.html" data-auth-registro>Registro</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container py-5">
      <nav aria-label="Navegación secundaria">
        <ol class="breadcrumb detalle-breadcrumb">
          <li class="breadcrumb-item"><a href="../index.html">Inicio</a></li>
          <li class="breadcrumb-item"><a href="./cursos.html">Cursos</a></li>
          <li class="breadcrumb-item active" aria-current="page">${curso.titulo}</li>
        </ol>
      </nav>

      <section class="banner-curso position-relative overflow-hidden rounded-4 shadow-lg">
        <img data-imagen-curso src="${curso.imagen}" alt="${curso.titulo}" />
        <div class="banner-curso-contenido">
          <span class="badge nivel-${curso.nivel.toLowerCase().replace("á", "a")} mb-3">${curso.nivel}</span>
          <h1 class="display-5 fw-bold">${curso.titulo}</h1>
          <p class="lead mb-0">${curso.descripcion}</p>
        </div>
      </section>
      ${seccionVideoPresentacion}

      <section class="row g-4 mt-4">
        <div class="col-lg-8">
          <div class="row g-4">${modulos}</div>
        </div>

        <aside class="col-lg-4">
          <div class="card detalle-resumen sticky-lg-top">
            <div class="card-body p-4">
              <h2 class="h4">Información del curso</h2>
              <hr />
              <p><strong>Nivel:</strong> ${curso.nivel}</p>
              <p><strong>Duración:</strong> ${curso.duracion}</p>
              <p><strong>Modalidad:</strong> En línea y asincrónica</p>
              <p class="mb-2"><strong>Instructor:</strong> ${curso.docenteNombre}</p>

              <section id="valoracionesDocente" class="border rounded-3 p-3 my-3" aria-labelledby="tituloValoracionesDocente">
                <h3 id="tituloValoracionesDocente" class="h6 mb-2">Valoración del docente</h3>
                <p id="resumenValoracionesDocente" class="small mb-3" aria-live="polite">Cargando valoraciones…</p>
                <div id="accionValoracionDocente"></div>
              </section>

              ${botonPrincipal}
              <a href="./cursos.html" class="btn btn-outline-secondary w-100">Volver al catálogo</a>
            </div>
          </div>
        </aside>
      </section>
    </main>
    <div data-footer-eduy data-raiz=".."></div>`;

  prepararImagenes(document.querySelector("#app"));
  await import("./sesion.js");
  await prepararValoracionesDocente(curso);
}

document.querySelector("#app").setAttribute("aria-busy", "false");

await import("./footer.js");
