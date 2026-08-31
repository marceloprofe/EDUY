document.querySelectorAll("[data-footer-eduy]").forEach((contenedor) => {
  const raiz = contenedor.dataset.raiz || ".";
  const paginas = `${raiz}/pages`;

  contenedor.outerHTML = `
    <footer class="footer-eduy mt-5">
      <div class="container py-5">
        <div class="row g-5">
          <div class="col-lg-4">
            <div class="d-flex align-items-center gap-3 mb-3">
              <img src="${raiz}/img/logo.png" class="footer-logo" alt="Logo de EDUY" />
              <h2 class="h4 mb-0">EDUY</h2>
            </div>
            <p>Plataforma educativa dedicada a la programación, la robótica y la tecnología mediante cursos prácticos para todos los niveles.</p>
          </div>
          <div class="col-6 col-lg-2">
            <h2 class="h5 footer-titulo">Información</h2>
            <ul class="list-unstyled footer-lista">
              <li><a href="${raiz}/index.html">Inicio</a></li>
              <li><a href="${paginas}/cursos.html">Cursos</a></li>
              <li><a href="${paginas}/login.html">Ingresar</a></li>
              <li><a href="#">Registrarse</a></li>
            </ul>
          </div>
          <div class="col-md-6 col-lg-3">
            <h2 class="h5 footer-titulo">Contacto</h2>
            <ul class="list-unstyled footer-lista footer-contacto">
              <li><svg class="footer-icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm2 2v.4l7 5.2 7-5.2V7H5Zm14 10V9.9l-7 5.2-7-5.2V17h14Z"/></svg><a href="mailto:contacto@eduy.com">contacto@eduy.com</a></li>
              <li><svg class="footer-icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 2 10 6.5 8 9c1.4 2.8 3.7 5.1 6.5 6.5l2.5-2 4.5 3.4-.7 3.6c-.2.9-1 1.5-1.9 1.5C9.6 22 2 14.4 2 5.1c0-.9.6-1.7 1.5-1.9L6.6 2Z"/></svg><a href="tel:+59800000000">+598 00 000 000</a></li>
              <li><svg class="footer-icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a8 8 0 0 1 8 8c0 5.7-8 12-8 12S4 15.7 4 10a8 8 0 0 1 8-8Zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg><span>Montevideo, Uruguay</span></li>
            </ul>
          </div>
          <div class="col-md-6 col-lg-3">
            <h2 class="h5 footer-titulo">Redes sociales</h2>
            <div class="footer-redes">
              <a href="#" aria-label="Instagram de EDUY"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg></a>
              <a href="#" aria-label="Facebook de EDUY"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h4V3h-4c-4 0-6 2.4-6 6v3H4v5h4v7h5v-7h4l1-5h-5V9c0-.7.3-1 1-1Z"/></svg></a>
              <a href="#" aria-label="YouTube de EDUY"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.6A3 3 0 0 0 1 7.2C.6 8.8.5 10.4.5 12s.1 3.2.5 4.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8ZM9.5 15.5v-7l6 3.5-6 3.5Z"/></svg></a>
              <a href="#" aria-label="LinkedIn de EDUY"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2 9h4v13H2V9Zm7 0h4v1.8c1-1.4 2.5-2.2 4.4-2.2 4 0 4.6 2.6 4.6 6V22h-4v-6.6c0-1.6 0-3.6-2.3-3.6s-2.7 1.7-2.7 3.5V22H9V9Z"/></svg></a>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-inferior text-center py-3"><p class="mb-0">&copy; 2026 EDUY. Todos los derechos reservados.</p></div>
    </footer>`;
});
