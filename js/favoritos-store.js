const CLAVE_FAVORITOS = "eduy-favoritos-v1";

export function obtenerFavoritos() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_FAVORITOS) || "[]"
        );

        return Array.isArray(guardado)
            ? [...new Set(
                guardado.filter(
                    (id) => typeof id === "string" && id.trim()
                )
            )]
            : [];
    } catch {
        return [];
    }
}

function guardarFavoritos(cursos) {
    localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(cursos));
    document.dispatchEvent(new CustomEvent("favoritosActualizados"));
}

export function agregarAFavoritos(cursoId) {
    if (typeof cursoId !== "string" || !cursoId.trim()) {
        return false;
    }

    const favoritos = obtenerFavoritos();

    if (favoritos.includes(cursoId)) {
        return false;
    }

    favoritos.push(cursoId);
    guardarFavoritos(favoritos);
    return true;
}

export function quitarDeFavoritos(cursoId) {
    guardarFavoritos(
        obtenerFavoritos().filter((id) => id !== cursoId)
    );
}

export function vaciarFavoritos() {
    guardarFavoritos([]);
}

export function actualizarContadorFavoritos() {
    const cantidad = obtenerFavoritos().length;

    document
        .querySelectorAll("#contadorFavoritos, .contador-favoritos")
        .forEach((elemento) => {
            elemento.textContent = String(cantidad);
            elemento.setAttribute(
                "aria-label",
                `${cantidad} cursos en favoritos`
            );
        });
}

document.addEventListener(
    "favoritosActualizados",
    actualizarContadorFavoritos
);

window.addEventListener("storage", actualizarContadorFavoritos);
