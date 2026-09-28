const campoBusqueda =
    document.querySelector("#buscarCurso");

const selectorNivel =
    document.querySelector("#filtroNivel");

const botonLimpiar =
    document.querySelector("#limpiarFiltros");

const resultadoFiltros =
    document.querySelector("#resultadoFiltros");

function normalizarTexto(texto = "") {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function filtrarCursos() {
    const busqueda = normalizarTexto(
        campoBusqueda.value
    );

    const nivelSeleccionado = normalizarTexto(
        selectorNivel.value
    );

    /*
     * Se consultan las tarjetas cada vez para incluir
     * también los cursos cargados desde Firestore.
     */
    const cursos = document.querySelectorAll(
        "#listaCursos > div"
    );

    let cantidadVisible = 0;

    cursos.forEach((columnaCurso) => {
        const tarjeta =
            columnaCurso.querySelector(".curso-card");

        if (!tarjeta) {
            return;
        }

        const badgeNivel =
            tarjeta.querySelector(".badge");

        const contenidoCurso = normalizarTexto(
            tarjeta.textContent
        );

        const nivelCurso = normalizarTexto(
            badgeNivel?.textContent
        );

        const coincideBusqueda =
            contenidoCurso.includes(busqueda);

        const coincideNivel =
            nivelSeleccionado === "" ||
            nivelCurso === nivelSeleccionado;

        const debeMostrarse =
            coincideBusqueda && coincideNivel;

        columnaCurso.classList.toggle(
            "d-none",
            !debeMostrarse
        );

        if (debeMostrarse) {
            cantidadVisible++;
        }
    });

    resultadoFiltros.textContent =
        cantidadVisible === 1
            ? "Mostrando 1 curso."
            : `Mostrando ${cantidadVisible} cursos.`;
}

campoBusqueda.addEventListener(
    "input",
    filtrarCursos
);

selectorNivel.addEventListener(
    "change",
    filtrarCursos
);

botonLimpiar.addEventListener("click", () => {
    campoBusqueda.value = "";
    selectorNivel.value = "";

    filtrarCursos();
    campoBusqueda.focus();
});

const parametrosURL = new URLSearchParams(
    window.location.search
);

const busquedaInicial =
    parametrosURL.get("busqueda");

if (busquedaInicial) {
    campoBusqueda.value = busquedaInicial;
}

/*
 * Vuelve a aplicar los filtros cuando Firestore
 * termina de agregar los cursos habilitados.
 */
document.addEventListener(
    "cursosActualizados",
    filtrarCursos
);

filtrarCursos();