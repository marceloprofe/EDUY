import { obtenerCursosHabilitados } from './cursos-datos.js';
import { escaparHTML, resolverImagen, prepararImagenes } from './curso-utils.js';
const carrusel = document.querySelector('#carruselInicio');
const estado = document.querySelector('#estadoCursosInicio');
async function cargar() {
  estado.textContent = 'Cargando cursos…';
  try {
    const cursos = await obtenerCursosHabilitados();
    const destacados = cursos.filter(c => c.destacado === true);
    const visibles = destacados.length ? destacados : cursos;
    carrusel.querySelector('.carousel-indicators').innerHTML = visibles.map((c,i) => `<button type="button" data-bs-target="#carruselInicio" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" ${i === 0 ? 'aria-current="true"' : ''} aria-label="${escaparHTML(c.titulo)}"></button>`).join('');
    carrusel.querySelector('.carousel-inner').innerHTML = visibles.map((c,i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="card tarjeta-curso mx-auto shadow">
          <img data-imagen-curso class="card-img-top" src="${escaparHTML(resolverImagen(c.imagen))}" alt="${escaparHTML(c.titulo)}" />
          <div class="card-body text-center">
            <h3 class="card-title h4">${escaparHTML(c.titulo)}</h3>
            <p class="card-text">${escaparHTML(c.descripcion)}</p>
            <a class="btn btn-oro" href="./pages/detalle.html?cursoId=${encodeURIComponent(c.id)}">Ver curso en detalle</a>
          </div>
        </div>
      </div>`).join('');
    prepararImagenes(carrusel);
    estado.textContent = visibles.length ? '' : 'Todavía no hay cursos habilitados.';
    if (visibles.length) window.bootstrap?.Carousel.getOrCreateInstance(carrusel).cycle();
  } catch (error) {
    console.error('No fue posible cargar el inicio:', error);
    estado.textContent = 'No fue posible cargar los cursos. ';
    const boton = document.createElement('button');
    boton.className = 'btn btn-oro';
    boton.textContent = 'Reintentar';
    boton.addEventListener('click', cargar);
    estado.append(boton);
  }
}
cargar();
