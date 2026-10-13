const CLAVE_CARRITO = "eduy-carrito-v1";

export function obtenerCarrito() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_CARRITO) || "[]"
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

function guardarCarrito(cursos) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(cursos));
    document.dispatchEvent(new CustomEvent("carritoActualizado"));
}

export function agregarAlCarrito(cursoId) {
    if (typeof cursoId !== "string" || !cursoId.trim()) {
        return false;
    }

    const carrito = obtenerCarrito();

    if (carrito.includes(cursoId)) {
        return false;
    }

    carrito.push(cursoId);
    guardarCarrito(carrito);
    return true;
}

export function quitarDelCarrito(cursoId) {
    guardarCarrito(
        obtenerCarrito().filter((id) => id !== cursoId)
    );
}

export function vaciarCarrito() {
    guardarCarrito([]);
}

export function actualizarContadorCarrito() {
    const cantidad = obtenerCarrito().length;

    document
        .querySelectorAll("#contadorCarrito, .contador-carrito")
        .forEach((elemento) => {
            elemento.textContent = String(cantidad);
            elemento.setAttribute(
                "aria-label",
                `${cantidad} cursos en el carrito`
            );
        });
}

document.addEventListener(
    "carritoActualizado",
    actualizarContadorCarrito
);

window.addEventListener("storage", actualizarContadorCarrito);