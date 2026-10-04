import { obtenerCursoFirestore } from './cursos-datos.js';
import { escaparHTML, resolverImagen, prepararImagenes, nombresNivel } from './curso-utils.js';

// Obtiene la clave del curso indicada en la URL.
// Ejemplo: detalle.html?id=esp32-basico
const parametros = new URLSearchParams(window.location.search);
const cursoIdFirestore = parametros.get("cursoId") || parametros.get("id");

let curso = null;
let errorConsulta = false;


if (cursoIdFirestore) {
  document.querySelector("#app").textContent = "Cargando curso…";

  try {
    const datos = await obtenerCursoFirestore(cursoIdFirestore);

    if (datos) {

      curso = {
        id: datos.id,
        titulo: escaparHTML(datos.titulo || "Curso sin título"),
        descripcion: escaparHTML(
          datos.descripcion || "Descripción no disponible."
        ),
        nivel: nombresNivel[datos.nivel] || "Básico",
        imagen: escaparHTML(resolverImagen(datos.imagen)),
        docenteNombre: escaparHTML(datos.docenteNombre || 'Equipo EDUY'),
        duracion: escaparHTML(datos.duracion || 'No especificada'),
        modulos: Array.isArray(datos.modulos) ? datos.modulos.filter(m => m && typeof m === 'object').map(m => [escaparHTML(m.titulo), escaparHTML(m.descripcion)]) : []
      };
    }
  } catch (error) {
    console.error("No fue posible consultar el curso:", error);
    errorConsulta = true;
  }
}

// Muestra un aviso comprensible si el HTML solicita un curso que no existe.
if (!curso) {
  const mensaje = errorConsulta
    ? "No fue posible cargar el curso. Intentá nuevamente más tarde."
    : "El curso no existe o no está disponible.";

  document.querySelector("#app").innerHTML = `
    <main class="container py-5">
      <div class="alert alert-warning" role="alert">
        ${mensaje}
      </div>
      <a href="./cursos.html" class="btn btn-oro">
        Volver al catálogo
      </a>
    </main>
  `;
} else {
  // Actualiza el título de la pestaña con el nombre del curso seleccionado.
  document.title = `${curso.titulo} | EDUY`;

  // Convierte cada módulo del catálogo en una tarjeta numerada de Bootstrap.
  const modulos = curso.modulos.map(([titulo, descripcion], indice) => `
    <article class="modulo-curso card h-100">
      <div class="card-body">
        <span class="numero-modulo">${indice + 1}</span>
        <h2 class="h5 mt-3">Módulo ${indice + 1}: ${titulo}</h2>
        <p class="mb-0">${descripcion}</p>
      </div>
    </article>`).join("");

  // Inserta la página completa dentro del contenedor #app del archivo HTML.
  document.querySelector("#app").innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="../index.html">
          <img src="../img/logo.png" class="logo-navbar" alt="Logo de EDUY" />
          <span class="h4 mb-0">Bienvenido a EDUY</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuPrincipal" aria-controls="menuPrincipal" aria-expanded="false" aria-label="Mostrar navegación"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="menuPrincipal"><ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="../index.html">Inicio</a></li>
          <li class="nav-item"><a class="nav-link active" href="./cursos.html">Cursos</a></li>
          <li class="nav-item">
  <a class="nav-link" href="./login.html" data-auth-login>Ingresar</a>
</li>
<li class="nav-item">
  <a class="nav-link" href="./registro.html" data-auth-registro>Registro</a>
</li>
        </ul></div>
      </div>
    </nav>
    <main class="container py-5">
      <nav aria-label="Navegación secundaria"><ol class="breadcrumb detalle-breadcrumb">
        <li class="breadcrumb-item"><a href="../index.html">Inicio</a></li>
        <li class="breadcrumb-item"><a href="./cursos.html">Cursos</a></li>
        <li class="breadcrumb-item active" aria-current="page">${curso.titulo}</li>
      </ol></nav>
      <section class="banner-curso position-relative overflow-hidden rounded-4 shadow-lg">
        <img data-imagen-curso src="${curso.imagen}" alt="${curso.titulo}" />
        <div class="banner-curso-contenido">
          <span class="badge nivel-${curso.nivel.toLowerCase().replace('á', 'a')} mb-3">${curso.nivel}</span>
          <h1 class="display-5 fw-bold">${curso.titulo}</h1>
          <p class="lead mb-0">${curso.descripcion}</p>
        </div>
      </section>
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
              <p><strong>Instructor:</strong> ${curso.docenteNombre}</p>
              <a href="./adquisicion.html?cursoId=${encodeURIComponent(curso.id)}" class="btn btn-oro w-100 mb-2">Adquirir curso</a>
              <a href="./cursos.html" class="btn btn-outline-secondary w-100">Volver al catálogo</a>
            </div>
          </div>
        </aside>
      </section>
    </main>
    <div data-footer-eduy data-raiz=".."></div>`;
  prepararImagenes(document.querySelector("#app"));
  import("./sesion.js");
}
await import("./footer.js");

