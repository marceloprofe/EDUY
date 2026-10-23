const controlZoom = document.getElementById("controlZoom");

// Agregar Accesibilidad al encabezado si todavía no existe.
if (!document.getElementById("controlZoom")) {
  const encabezado = document.querySelector(".navbar .container");

  if (encabezado) {
    const contenedor = document.createElement("div");
    contenedor.className = "dropdown ms-auto me-2";

    contenedor.innerHTML = `
      <button
        class="btn btn-outline-light dropdown-toggle"
        type="button"
        id="botonZoom"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false">
        Accesibilidad
      </button>

      <div class="dropdown-menu dropdown-menu-end p-3"
           aria-labelledby="botonZoom"
           style="width: 250px; max-width: 90vw;">
        <label for="controlZoom" class="form-label">
          Tamaño de la página:
          <output id="valorZoom">100 %</output>
        </label>

        <select class="form-select" id="controlZoom">
          <option value="100">Normal (100 %)</option>
          <option value="125">Aumentar 25 %</option>
          <option value="150">Aumentar 50 %</option>
          <option value="175">Aumentar 75 %</option>
          <option value="200">Aumentar 100 % (doble)</option>
        </select>

        <button type="button"
                class="btn btn-outline-secondary btn-sm mt-2"
                id="restablecerZoom">
          Restablecer al 100 %
        </button>
      </div>
    `;

    const menu = encabezado.querySelector(".navbar-toggler, .navbar-collapse");
    encabezado.insertBefore(contenedor, menu);
  }
}

const valorZoom = document.getElementById("valorZoom");
const restablecerZoom = document.getElementById("restablecerZoom");

const claveZoom = "eduyZoom";

function aplicarZoom(valor) {
  const numero = Number(valor);
  const porcentaje = Number.isFinite(numero)
    ? Math.min(200, Math.max(100, Math.round(numero / 25) * 25))
    : 100;

  document.documentElement.style.zoom = porcentaje / 100;

  if (controlZoom) {
    controlZoom.value = porcentaje;
    controlZoom.setAttribute("aria-valuetext", `${porcentaje} por ciento`);
  }

  if (valorZoom) {
    valorZoom.textContent = `${porcentaje} %`;
  }

  return porcentaje;
}

let zoomGuardado = 100;

try {
  zoomGuardado = localStorage.getItem(claveZoom) ?? 100;
} catch {
  // El zoom funciona aunque el navegador bloquee el almacenamiento.
}

aplicarZoom(zoomGuardado);

function cambiarZoom(valor) {
  const porcentaje = aplicarZoom(valor);

  try {
    localStorage.setItem(claveZoom, String(porcentaje));
  } catch {
    // Se mantiene el zoom durante esta visita.
  }
}

controlZoom?.addEventListener("change", () => {
  cambiarZoom(controlZoom.value);
});

restablecerZoom?.addEventListener("click", () => {
  cambiarZoom(100);
});