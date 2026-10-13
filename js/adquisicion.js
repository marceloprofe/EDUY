import { auth, db } from "./firebase-config.js";

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

const tituloCurso = document.querySelector("#tituloCursoAdquisicion");
const descripcionCurso = document.querySelector(
    "#descripcionCursoAdquisicion"
);
const precioCurso = document.querySelector("#precioCursoAdquisicion");
const metodoPago = document.querySelector("#metodoPago");
const mensajeAdquisicion = document.querySelector("#mensajeAdquisicion");
const botonConfirmar = document.querySelector("#btnConfirmarAdquisicion");
const botonCancelar = document.querySelector("#btnCancelarAdquisicion");
const avisoConfirmacion = document.querySelector("#avisoConfirmacion");

const parametros = new URLSearchParams(window.location.search);
const cursoId = parametros.get("cursoId");

let usuarioActual = null;
let perfilActual = null;
let cursoActual = null;
let importeActual = 0;

function mostrarMensaje(texto, tipo = "info") {
    mensajeAdquisicion.textContent = texto;
    mensajeAdquisicion.className = `alert alert-${tipo}`;
}

function obtenerImporte(curso) {
    if (typeof curso.precio === "number" && curso.precio > 0) {
        return curso.precio;
    }

    const importesPorNivel = {
        basico: 1200,
        intermedio: 1800,
        avanzado: 2400
    };

    return importesPorNivel[curso.nivel] || 1200;
}

function formatearImporte(importe) {
    return new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: "UYU",
        maximumFractionDigits: 0
    }).format(importe);
}

async function cargarPerfil(usuario) {
    const referenciaPerfil = doc(db, "usuarios", usuario.uid);
    const documentoPerfil = await getDoc(referenciaPerfil);

    if (!documentoPerfil.exists()) {
        return null;
    }

    return documentoPerfil.data();
}

async function cargarCurso() {
    if (!cursoId) {
        mostrarMensaje(
            "No se indicó el curso que se desea adquirir.",
            "danger"
        );
        return false;
    }

    const referenciaCurso = doc(db, "cursos", cursoId);
    const documentoCurso = await getDocFromServer(referenciaCurso);

    if (!documentoCurso.exists()) {
        mostrarMensaje("El curso seleccionado no existe.", "danger");
        return false;
    }

    const datosCurso = documentoCurso.data();

    if (datosCurso.habilitado !== true) {
        mostrarMensaje(
            "Este curso no está habilitado actualmente.",
            "warning"
        );
        return false;
    }

    cursoActual = {
        id: documentoCurso.id,
        ...datosCurso
    };

    importeActual = obtenerImporte(cursoActual);

    tituloCurso.textContent = cursoActual.titulo || "Curso sin título";
    descripcionCurso.textContent =
        cursoActual.descripcion || "Este curso no tiene descripción.";
    precioCurso.textContent = formatearImporte(importeActual);

    avisoConfirmacion.textContent =
        "Elegí un método de pago simulado y revisá los datos antes de confirmar.";

    return true;
}

async function comprobarAdquisicionExistente() {
    const adquisicionId = `${usuarioActual.uid}_${cursoActual.id}`;
    const referenciaAdquisicion = doc(db, "adquisiciones", adquisicionId);
    const documentoAdquisicion = await getDoc(referenciaAdquisicion);

    if (documentoAdquisicion.exists()) {
        mostrarMensaje(
            "Ya adquiriste este curso anteriormente.",
            "info"
        );

        avisoConfirmacion.textContent =
            "Esta adquisición ya se encuentra registrada.";

        botonConfirmar.disabled = true;
        botonConfirmar.textContent = "Curso ya adquirido";

        return true;
    }

    return false;
}

async function confirmarAdquisicion() {
    if (!usuarioActual || !perfilActual || !cursoActual) {
        mostrarMensaje(
            "No fue posible verificar los datos de la adquisición.",
            "danger"
        );
        return;
    }

    const metodoSeleccionado = metodoPago.value;

    if (!metodoSeleccionado) {
        mostrarMensaje("Seleccioná un método de pago simulado.", "warning");
        metodoPago.focus();
        return;
    }

    botonConfirmar.disabled = true;
    botonConfirmar.textContent = "Procesando…";

    const adquisicionId = `${usuarioActual.uid}_${cursoActual.id}`;
    const referenciaAdquisicion = doc(db, "adquisiciones", adquisicionId);

    try {
        await runTransaction(db, async (transaccion) => {
            const adquisicionExistente =
                await transaccion.get(referenciaAdquisicion);

            if (adquisicionExistente.exists()) {
                throw new Error("adquisicion-duplicada");
            }

            transaccion.set(referenciaAdquisicion, {
                usuarioId: usuarioActual.uid,
                usuarioCorreo: usuarioActual.email || "",
                cursoId: cursoActual.id,
                cursoTitulo: cursoActual.titulo || "Curso sin título",
                importe: importeActual,
                estado: "confirmada",
                pagoSimulado: true,
                metodoPago: metodoSeleccionado,
                estadoPago: "aprobado_simulado",
                fechaAdquisicion: serverTimestamp()
            });
        });

        mostrarMensaje(
            "Pago simulado correctamente. El curso fue adquirido.",
            "success"
        );

        avisoConfirmacion.classList.add("d-none");
        metodoPago.disabled = true;
        botonConfirmar.textContent = "Adquisición confirmada";
    } catch (error) {
        console.error(error);

        if (error.message === "adquisicion-duplicada") {
            mostrarMensaje(
                "Ya adquiriste este curso anteriormente.",
                "warning"
            );

            avisoConfirmacion.textContent =
                "Esta adquisición ya se encuentra registrada.";

            botonConfirmar.textContent = "Curso ya adquirido";
            return;
        }

        mostrarMensaje(
            "No fue posible completar la adquisición. Revisá tu conexión e intentá nuevamente.",
            "danger"
        );

        botonConfirmar.disabled = false;
        botonConfirmar.textContent = "Confirmar adquisición";
    }
}

botonConfirmar.addEventListener("click", confirmarAdquisicion);

botonCancelar.addEventListener("click", () => {
    window.location.href = "./cursos.html";
});

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        window.location.href = "./login.html";
        return;
    }

    usuarioActual = usuario;

    try {
        perfilActual = await cargarPerfil(usuario);

        if (!perfilActual) {
            mostrarMensaje(
                "No se encontró el perfil del usuario.",
                "danger"
            );
            return;
        }

        if (perfilActual.rol !== "estudiante") {
            window.location.href = "./acceso-denegado.html";
            return;
        }

        const cursoCargado = await cargarCurso();

        if (!cursoCargado) {
            botonConfirmar.disabled = true;
            return;
        }

        const yaFueAdquirido = await comprobarAdquisicionExistente();

        if (!yaFueAdquirido) {
            botonConfirmar.disabled = false;
        }
    } catch (error) {
        console.error(error);

        mostrarMensaje(
            "No fue posible preparar la adquisición.",
            "danger"
        );

        botonConfirmar.disabled = true;
    }
});