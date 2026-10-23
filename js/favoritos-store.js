import { auth } from "./firebase-config.js";

const PREFIJO_CLAVE_FAVORITOS = "eduy-favoritos-v2";

function obtenerClaveFavoritos() {
    return auth.currentUser
        ? `${PREFIJO_CLAVE_FAVORITOS}:${auth.currentUser.uid}`
        : null;
}

export function obtenerFavoritos() {
    const claveFavoritos = obtenerClaveFavoritos();

    if (!claveFavoritos) {
        return [];
    }

    try {
        const guardado = JSON.parse(
            localStorage.getItem(claveFavoritos) || "[]"
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
    const claveFavoritos = obtenerClaveFavoritos();

    if (!claveFavoritos) {
        return false;
    }

    localStorage.setItem(claveFavoritos, JSON.stringify(cursos));
    document.dispatchEvent(new CustomEvent("favoritosActualizados"));
    return true;
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
    return guardarFavoritos(favoritos);
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
