import { auth, db } from "./firebase-config.js";

import {
    actualizarContadorCarrito,
    obtenerCarrito,
    quitarDelCarrito,
    vaciarCarrito
} from "./carrito-store.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getDocFromServer,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const lista = document.querySelector("#listaCarrito");
const estado = document.querySelector("#estadoCarrito");
const mensaje = document.querySelector("#mensajeCarrito");
const cantidad = document.querySelector("#cantidadCursos");
const total = document.querySelector("#totalCarrito");
const botonConfirmar = document.querySelector("#btnConfirmarCarrito");

let cursosEnCarrito = [];
let usuarioActual = null;
let rolActual = null;
let procesando = false;

function mostrarMensaje(texto, tipo = "info") {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo}`;
}

function obtenerPrecio(curso) {
    const precioGuardado = Number(curso.precio);

    if (precioGuardado > 0) {
        return precioGuardado;
    }

    const preciosPorNivel = {
        basico: 1200,
        intermedio: 1800,
        avanzado: 2400
    };

    return preciosPorNivel[curso.nivel] || 1200;
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: "UYU",
        maximumFractionDigits: 0
    }).format(valor);
}

async function cargarCarrito() {
    const ids = obtenerCarrito();

    lista.replaceChildren();
    cursosEnCarrito = [];

    if (ids.length === 0) {
        estado.textContent = "Tu carrito está vacío.";
        cantidad.textContent = "0";
        total.textContent = formatearMoneda(0);
        botonConfirmar.disabled = true;
        actualizarContadorCarrito();
        return;
    }

    estado.textContent = "Consultando cursos…";

    try {
        const resultados = await Promise.all(
            ids.map(async (id) => {
                const resultado = await getDocFromServer(
                    doc(db, "cursos", id)
                );

                return resultado.exists()
                    ? { id: resultado.id, ...resultado.data() }
                    : null;
            })
        );

        cursosEnCarrito = resultados.filter(
            (curso) => curso && curso.habilitado === true
        );

        const idsNoDisponibles = ids.filter(
            (id) => !cursosEnCarrito.some((curso) => curso.id === id)
        );

        idsNoDisponibles.forEach(quitarDelCarrito);

        cursosEnCarrito.forEach((curso) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "card";

            const cuerpo = document.createElement("div");
            cuerpo.className =
                "card-body d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3";

            const datos = document.createElement("div");

            const titulo = document.createElement("h2");
            titulo.className = "h5 mb-1";
            titulo.textContent = curso.titulo || "Curso sin título";

            const nivel = document.createElement("p");
            nivel.className = "text-body-secondary mb-0";
            nivel.textContent = `Nivel: ${curso.nivel || "No especificado"}`;

            datos.append(titulo, nivel);

            const acciones = document.createElement("div");
            acciones.className = "d-flex align-items-center gap-3";

            const precio = document.createElement("strong");
            precio.textContent = formatearMoneda(obtenerPrecio(curso));

            const botonQuitar = document.createElement("button");
            botonQuitar.type = "button";
            botonQuitar.className = "btn btn-sm btn-outline-danger";
            botonQuitar.textContent = "Quitar";
            botonQuitar.setAttribute(
                "aria-label",
                `Quitar ${curso.titulo || "curso"} del carrito`
            );

            botonQuitar.addEventListener("click", () => {
                quitarDelCarrito(curso.id);
                cargarCarrito();
            });

            acciones.append(precio, botonQuitar);
            cuerpo.append(datos, acciones);
            tarjeta.append(cuerpo);
            lista.append(tarjeta);
        });

        const suma = cursosEnCarrito.reduce(
            (acumulado, curso) => acumulado + obtenerPrecio(curso),
            0
        );

        cantidad.textContent = String(cursosEnCarrito.length);
        total.textContent = formatearMoneda(suma);

        estado.textContent = cursosEnCarrito.length
            ? ""
            : "No quedan cursos disponibles en el carrito.";

        botonConfirmar.disabled =
            cursosEnCarrito.length === 0 || procesando;

        actualizarContadorCarrito();

        if (idsNoDisponibles.length > 0) {
            mostrarMensaje(
                "Quitamos del carrito los cursos que ya no están disponibles.",
                "warning"
            );
        }
    } catch (error) {
        console.error("No fue posible cargar el carrito:", error);

        estado.textContent =
            "No pudimos consultar los cursos. Revisá tu conexión e intentá nuevamente.";

        botonConfirmar.disabled = true;
    }
}

async function confirmarAdquisicion() {
    if (procesando) return;

    if (!usuarioActual) {
        window.location.href = "./login.html";
        return;
    }

    if (rolActual !== "estudiante") {
        window.location.href = "./acceso-denegado.html";
        return;
    }

    const ids = obtenerCarrito();

    if (ids.length === 0) {
        await cargarCarrito();
        return;
    }

    procesando = true;
    botonConfirmar.disabled = true;
    botonConfirmar.textContent = "Procesando…";

    try {
        await runTransaction(db, async (transaccion) => {
            const cursos = [];
            const referenciasAdquisicion = [];

            for (const id of ids) {
                const referenciaCurso = doc(db, "cursos", id);
                const referenciaAdquisicion = doc(
                    db,
                    "adquisiciones",
                    `${usuarioActual.uid}_${id}`
                );

                const cursoDoc = await transaccion.get(referenciaCurso);
                const adquisicionDoc =
                    await transaccion.get(referenciaAdquisicion);

                if (!cursoDoc.exists() || cursoDoc.data().habilitado !== true) {
                    throw new Error("curso-no-disponible");
                }

                if (adquisicionDoc.exists()) {
                    throw new Error("curso-ya-adquirido");
                }

                const curso = {
                    id: cursoDoc.id,
                    ...cursoDoc.data()
                };

                const importe = obtenerPrecio(curso);

                if (![1200, 1800, 2400].includes(importe)) {
                    throw new Error("precio-no-valido");
                }

                cursos.push({ curso, importe });
                referenciasAdquisicion.push(referenciaAdquisicion);
            }

            cursos.forEach(({ curso, importe }, indice) => {
                transaccion.set(referenciasAdquisicion[indice], {
                    usuarioId: usuarioActual.uid,
                    usuarioCorreo: usuarioActual.email || "",
                    cursoId: curso.id,
                    cursoTitulo: curso.titulo || "Curso sin título",
                    importe,
                    estado: "confirmada",
                    pagoSimulado: true,
                    fechaAdquisicion: serverTimestamp()
                });
            });
        });

        vaciarCarrito();

        mostrarMensaje(
            "Adquisiciones confirmadas. El pago fue simulado y no se realizó ningún cargo.",
            "success"
        );

        await cargarCarrito();

        window.setTimeout(() => {
            window.location.href = "./mis-adquisiciones.html";
        }, 1400);
    } catch (error) {
        console.error("No fue posible confirmar las adquisiciones:", error);

        const errores = {
            "curso-no-disponible":
                "Uno de los cursos dejó de estar disponible. Revisá el carrito antes de volver a confirmar.",
            "curso-ya-adquirido":
                "Ya tenés adquirido uno de los cursos. Quitalo del carrito para continuar.",
            "precio-no-valido":
                "El precio de uno de los cursos no coincide con los importes habilitados por las reglas actuales de Firestore."
        };

        mostrarMensaje(
            errores[error.message] ||
            "No fue posible completar la adquisición. Verificá las reglas de Firestore e intentá nuevamente.",
            "danger"
        );

        await cargarCarrito();
    } finally {
        procesando = false;
        botonConfirmar.textContent = "Confirmar adquisición";
        botonConfirmar.disabled = cursosEnCarrito.length === 0;
    }
}

botonConfirmar.addEventListener("click", confirmarAdquisicion);

document.addEventListener("carritoActualizado", cargarCarrito);

onAuthStateChanged(auth, async (usuario) => {
    usuarioActual = usuario;
    rolActual = null;

    if (usuario) {
        try {
            const perfil = await getDoc(
                doc(db, "usuarios", usuario.uid)
            );

            rolActual = perfil.exists()
                ? perfil.data().rol
                : null;
        } catch (error) {
            console.error("No fue posible consultar el perfil:", error);
        }
    }

    await cargarCarrito();
});