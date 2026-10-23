(() => {
  const clave = "eduyZoom";
  const control = document.createElement("div");
  control.className = "zoom-control";
  control.innerHTML = `
    <label for="controlZoom">Zoom</label>
    <span aria-hidden="true" style="font-size: .75em">A</span>
    <input type="range" id="controlZoom" min="100" max="200" step="5" value="100" aria-label="Tamaño de la página">
    <span aria-hidden="true" style="font-size: 1.2em">A</span>
    <output id="valorZoom" for="controlZoom">100 %</output>
    <button type="button" id="restablecerZoom" aria-label="Restablecer zoom al 100 por ciento" title="Restablecer zoom">↺</button>`;
  const rango = control.querySelector("input");
  const salida = control.querySelector("output");
  let porcentaje = 100;
  let barraProvisional;

  function aplicar(valor, guardar = false) {
    const numero = Number(valor);
    porcentaje = Number.isFinite(numero) ? Math.min(200, Math.max(100, Math.round(numero / 5) * 5)) : 100;
    document.documentElement.style.zoom = "";

document.querySelectorAll("main, footer, .modal").forEach((elemento) => {
  elemento.style.zoom = porcentaje / 100;
});
    rango.value = String(porcentaje);
    rango.setAttribute("aria-valuetext", `${porcentaje} por ciento`);
    salida.textContent = `${porcentaje} %`;
    if (guardar) {
      try { localStorage.setItem(clave, String(porcentaje)); } catch { /* Almacenamiento no disponible. */ }
    }
  }
  try { porcentaje = localStorage.getItem(clave) ?? 100; } catch { /* Usar valor normal. */ }
  aplicar(porcentaje);
  rango.addEventListener("input", () => aplicar(rango.value, true));
  control.querySelector("button").addEventListener("click", () => aplicar(100, true));

  function colocarControl() {
    document.querySelectorAll("main, footer, .modal").forEach((elemento) => {
  elemento.style.zoom = porcentaje / 100;
});
    const barra = document.querySelector(".barra-sesion-usuario:not([data-zoom-provisional])");
    if (barra) {
      const destino = barra.querySelector(".container");
      if (destino && control.parentElement !== destino) destino.prepend(control);
      barraProvisional?.remove();
      barraProvisional = null;
      return;
    }
    const nav = document.querySelector("nav.navbar");
    if (!nav || control.isConnected) return;
    barraProvisional = document.createElement("div");
    barraProvisional.className = "barra-sesion-usuario";
    barraProvisional.dataset.zoomProvisional = "true";
    barraProvisional.innerHTML = '<div class="container d-flex flex-wrap align-items-center gap-2 py-2"></div>';
    barraProvisional.firstElementChild.append(control);
    nav.insertAdjacentElement("afterend", barraProvisional);
  }
  function iniciar() {
    colocarControl();
    // Detalle del curso genera la navegación después de consultar Firebase.
    new MutationObserver(colocarControl).observe(document.body, {childList: true, subtree: true});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar, {once: true});
  else iniciar();
})();
