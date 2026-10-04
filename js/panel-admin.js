import { auth, authAltaUsuario, db, functions } from "./firebase-config.js";

import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    deleteUser,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    doc,
    addDoc,
    deleteDoc,
    deleteField,
    getDoc,
    getDocFromServer,
    getDocsFromServer,
    limit,
    query,
    setDoc,
    serverTimestamp,
    updateDoc,
    where,
    Timestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    httpsCallable
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js";

const contenidoAdmin = document.querySelector("#contenidoAdmin");
const listaUsuarios = document.querySelector("#listaUsuarios");
const estadoUsuarios = document.querySelector("#estadoUsuarios");
const buscadorUsuarios = document.querySelector("#buscadorUsuarios");
const mensajeAdmin = document.querySelector("#mensajeAdmin");
const formularioUsuario = document.querySelector("#formUsuario");
const modalUsuario = new bootstrap.Modal(
    document.querySelector("#modalUsuario")
);
const btnNuevoUsuario = document.querySelector("#btnNuevoUsuario");
const btnGuardarUsuario = document.querySelector("#btnGuardarUsuario");
const tituloModalUsuario = document.querySelector("#tituloModalUsuario");
const campoId = document.querySelector("#usuarioId");
const campoNombre = document.querySelector("#usuarioNombre");
const campoEmail = document.querySelector("#usuarioEmail");
const campoContrasena = document.querySelector("#usuarioContrasena");
const campoRol = document.querySelector("#usuarioRol");
const contenedorContrasena = document.querySelector("#contenedorContrasena");
const listaCursosAdmin = document.querySelector("#listaCursosAdmin");
const estadoCursosAdmin = document.querySelector("#estadoCursosAdmin");
const buscadorCursosAdmin = document.querySelector("#buscadorCursosAdmin");
const formularioCursoAdmin = document.querySelector("#formCursoAdmin");
const modalCursoAdmin = new bootstrap.Modal(document.querySelector("#modalCurso"));
const btnNuevoCurso = document.querySelector("#btnNuevoCurso");
const btnGuardarCursoAdmin = document.querySelector("#btnGuardarCursoAdmin");
const tituloModalCurso = document.querySelector("#tituloModalCurso");
const campoCursoId = document.querySelector("#cursoAdminId");
const campoCursoTitulo = document.querySelector("#cursoAdminTitulo");
const campoCursoDescripcion = document.querySelector("#cursoAdminDescripcion");
const campoCursoModulos = document.querySelector("#cursoAdminModulos");
const campoCursoNivel = document.querySelector("#cursoAdminNivel");
const contenedorDocenteCursoAdmin = document.querySelector("#contenedorDocenteCursoAdmin");
const campoCursoDocente = document.querySelector("#cursoAdminDocente");
const campoCursoPrecio = document.querySelector("#cursoAdminPrecio");
const campoCursoDuracion = document.querySelector("#cursoAdminDuracion");
const campoCursoImagen = document.querySelector("#cursoAdminImagen");
const campoCursoEstado = document.querySelector("#cursoAdminEstado");
const listaAdquisicionesAdmin = document.querySelector("#listaAdquisicionesAdmin");
const estadoAdquisicionesAdmin = document.querySelector("#estadoAdquisicionesAdmin");
const buscadorAdquisicionesAdmin = document.querySelector("#buscadorAdquisicionesAdmin");
const formularioAdquisicionAdmin = document.querySelector("#formAdquisicionAdmin");
const modalAdquisicionAdmin = new bootstrap.Modal(document.querySelector("#modalAdquisicionAdmin"));
const btnNuevaAdquisicion = document.querySelector("#btnNuevaAdquisicion");
const btnGuardarAdquisicionAdmin = document.querySelector("#btnGuardarAdquisicionAdmin");
const tituloModalAdquisicionAdmin = document.querySelector("#tituloModalAdquisicionAdmin");
const campoAdquisicionId = document.querySelector("#adquisicionAdminId");
const contenedorEstudianteAdquisicion = document.querySelector("#contenedorEstudianteAdquisicion");
const campoAdquisicionEstudiante = document.querySelector("#adquisicionAdminEstudiante");
const contenedorCursoAdquisicion = document.querySelector("#contenedorCursoAdquisicion");
const campoAdquisicionCurso = document.querySelector("#adquisicionAdminCurso");
const identidadAdquisicionAdmin = document.querySelector("#identidadAdquisicionAdmin");
const campoAdquisicionImporte = document.querySelector("#adquisicionAdminImporte");
const contenedorFechaAdquisicionAdmin = document.querySelector("#contenedorFechaAdquisicionAdmin");
const campoAdquisicionFecha = document.querySelector("#adquisicionAdminFecha");

const gestionarUsuario = httpsCallable(functions, "gestionarUsuario");

let usuarios = [];
let cursosAdmin = [];
let adquisicionesAdmin = [];
let administradorActual = null;
let modoFormulario = "crear";
let modoFormularioCurso = "crear";

const preciosPorNivel = { basico: 1200, intermedio: 1800, avanzado: 2400 };

function mostrarMensaje(texto, tipo) {
    mensajeAdmin.textContent = texto;
    mensajeAdmin.className = `alert alert-${tipo}`;
}

function escaparHTML(texto = "") {
    const elemento = document.createElement("div");
    elemento.textContent = String(texto);
    return elemento.innerHTML;
}

async function comprobarAdministrador(usuario) {
    const referenciaUsuario = doc(db, "usuarios", usuario.uid);
    const documentoUsuario = await getDoc(referenciaUsuario);

    if (!documentoUsuario.exists()) return null;

    const datosUsuario = documentoUsuario.data();
    return datosUsuario.rol === "admin" ? datosUsuario : null;
}

async function cargarUsuarios() {
    estadoUsuarios.textContent = "Cargando usuarios...";

    try {
        const resultado = await getDocsFromServer(collection(db, "usuarios"));
        usuarios = resultado.docs.map((documentoUsuario) => ({
            id: documentoUsuario.id,
            ...documentoUsuario.data()
        }));

        usuarios.sort((usuarioA, usuarioB) => {
            const nombreA = usuarioA.nombre || usuarioA.correo || "";
            const nombreB = usuarioB.nombre || usuarioB.correo || "";
            return nombreA.localeCompare(nombreB, "es");
        });

        filtrarUsuarios();
    } catch (error) {
        console.error(error);
        estadoUsuarios.textContent = "No fue posible cargar los usuarios.";
        mostrarMensaje(
            "Firestore no permitió consultar la lista de usuarios.",
            "danger"
        );
    }
}

function formatearPrecioCurso(precio) {
    return new Intl.NumberFormat("es-UY", {
        style: "currency",
        currency: "UYU",
        maximumFractionDigits: 0
    }).format(Number(precio) || 0);
}

async function cargarCursosAdmin() {
    estadoCursosAdmin.textContent = "Cargando cursos...";
    try {
        const resultado = await getDocsFromServer(collection(db, "cursos"));
        cursosAdmin = resultado.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));
        cursosAdmin.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "es"));
        filtrarCursosAdmin();
    } catch (error) {
        console.error("No fue posible cargar cursos desde Firestore.", error);
        listaCursosAdmin.innerHTML = "";
        estadoCursosAdmin.textContent = "No fue posible cargar los cursos.";
        const codigoError = error.code || "sin código";
        mostrarMensaje(`No fue posible consultar cursos en Firestore (${codigoError}). Verificá las reglas de listado y que tu perfil en usuarios/${administradorActual} tenga rol "admin".`, "danger");
    }
}

function formatearFechaAdquisicion(fecha) {
    const valor = typeof fecha?.toDate === "function" ? fecha.toDate() : null;
    if (!valor || Number.isNaN(valor.getTime())) return "Fecha no disponible";
    return new Intl.DateTimeFormat("es-UY", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Montevideo"
    }).format(valor);
}

function fechaAdquisicionParaInput(fecha = new Date()) {
    const valor = typeof fecha?.toDate === "function" ? fecha.toDate() : fecha;
    const local = new Date(valor.getTime() - valor.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function precioSugeridoCurso(curso) {
    return Number(curso?.precio) > 0
        ? Number(curso.precio)
        : preciosPorNivel[curso?.nivel] || 1200;
}

function llenarSelectAdquisicion(select, opciones, etiquetaVacia) {
    select.replaceChildren(new Option(etiquetaVacia, ""));
    opciones.forEach(({ id, etiqueta }) => select.add(new Option(etiqueta, id)));
}

function cargarAdquisicionesAdmin() {
    estadoAdquisicionesAdmin.textContent = "Cargando adquisiciones...";
    return getDocsFromServer(collection(db, "adquisiciones"))
        .then((resultado) => {
            adquisicionesAdmin = resultado.docs.map((documento) => ({
                id: documento.id,
                ...documento.data()
            }));
            adquisicionesAdmin.sort((a, b) => {
                const fechaA = typeof a.fechaAdquisicion?.toDate === "function" ? a.fechaAdquisicion.toDate().getTime() : 0;
                const fechaB = typeof b.fechaAdquisicion?.toDate === "function" ? b.fechaAdquisicion.toDate().getTime() : 0;
                return fechaB - fechaA;
            });
            filtrarAdquisicionesAdmin();
        })
        .catch((error) => {
            console.error("No fue posible cargar las adquisiciones desde Firestore.", error);
            listaAdquisicionesAdmin.innerHTML = "";
            estadoAdquisicionesAdmin.textContent = "No fue posible cargar las adquisiciones.";
            mostrarMensaje(`No se pudieron consultar las adquisiciones (${error.code || "error"}). Verificá que las reglas permitan listarlas al administrador.`, "danger");
        });
}

function mostrarAdquisicionesAdmin(lista) {
    if (lista.length === 0) {
        listaAdquisicionesAdmin.innerHTML = "";
        estadoAdquisicionesAdmin.textContent = "No se encontraron adquisiciones.";
        return;
    }

    estadoAdquisicionesAdmin.textContent = `${lista.length} adquisición(es) encontrada(s).`;
    listaAdquisicionesAdmin.innerHTML = lista.map((adquisicion) => {
        const usuario = usuarios.find((item) => item.id === adquisicion.usuarioId);
        const estudiante = usuario?.nombre || adquisicion.usuarioCorreo || adquisicion.usuarioId;
        const correo = usuario?.correo || usuario?.email || adquisicion.usuarioCorreo || "";
        const estudianteVisible = correo && correo !== estudiante ? `${estudiante} (${correo})` : estudiante;
        const curso = cursosAdmin.find((item) => item.id === adquisicion.cursoId);
        const tituloCurso = curso?.titulo || adquisicion.cursoTitulo || adquisicion.cursoId;
        return `
            <tr>
                <td>${escaparHTML(estudianteVisible)}</td>
                <td>${escaparHTML(tituloCurso)}</td>
                <td>${escaparHTML(formatearFechaAdquisicion(adquisicion.fechaAdquisicion))}</td>
                <td>${escaparHTML(formatearPrecioCurso(adquisicion.importe))}</td>
                <td><span class="badge text-bg-success">${escaparHTML(adquisicion.estado || "Confirmada")}</span></td>
                <td>
                    <div class="d-flex flex-wrap gap-2">
                        <button type="button" class="btn btn-sm btn-outline-primary btn-editar-adquisicion" data-id="${escaparHTML(adquisicion.id)}">Editar</button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-adquisicion" data-id="${escaparHTML(adquisicion.id)}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    listaAdquisicionesAdmin.querySelectorAll(".btn-editar-adquisicion")
        .forEach((boton) => boton.addEventListener("click", abrirEdicionAdquisicion));
    listaAdquisicionesAdmin.querySelectorAll(".btn-eliminar-adquisicion")
        .forEach((boton) => boton.addEventListener("click", eliminarAdquisicionAdmin));
}

function filtrarAdquisicionesAdmin() {
    const texto = buscadorAdquisicionesAdmin.value.trim().toLocaleLowerCase("es");
    mostrarAdquisicionesAdmin(adquisicionesAdmin.filter((adquisicion) => {
        const usuario = usuarios.find((item) => item.id === adquisicion.usuarioId);
        const curso = cursosAdmin.find((item) => item.id === adquisicion.cursoId);
        return [
            usuario?.nombre,
            usuario?.correo,
            usuario?.email,
            adquisicion.usuarioCorreo,
            curso?.titulo,
            adquisicion.cursoTitulo
        ].some((valor) => String(valor || "").toLocaleLowerCase("es").includes(texto));
    }));
}

function prepararSelectsNuevaAdquisicion() {
    const estudiantes = usuarios.filter((usuario) => usuario.rol === "estudiante").map((usuario) => {
        const nombre = usuario.nombre || usuario.correo || usuario.email || "Estudiante";
        const correo = usuario.correo || usuario.email || "";
        return { id: usuario.id, etiqueta: correo && correo !== nombre ? `${nombre} (${correo})` : nombre };
    });
    const cursos = cursosAdmin.map((curso) => ({
        id: curso.id,
        etiqueta: curso.titulo || curso.id
    }));
    llenarSelectAdquisicion(campoAdquisicionEstudiante, estudiantes, "Elegí un estudiante...");
    llenarSelectAdquisicion(campoAdquisicionCurso, cursos, "Elegí un curso...");
}

function abrirAltaAdquisicion() {
    formularioAdquisicionAdmin.reset();
    campoAdquisicionId.value = "";
    prepararSelectsNuevaAdquisicion();
    contenedorEstudianteAdquisicion.classList.remove("d-none");
    contenedorCursoAdquisicion.classList.remove("d-none");
    campoAdquisicionEstudiante.required = true;
    campoAdquisicionCurso.required = true;
    identidadAdquisicionAdmin.classList.add("d-none");
    contenedorFechaAdquisicionAdmin.classList.add("d-none");
    campoAdquisicionFecha.required = false;
    campoAdquisicionFecha.value = fechaAdquisicionParaInput();
    campoAdquisicionImporte.value = "";
    tituloModalAdquisicionAdmin.textContent = "Crear adquisición";
    btnGuardarAdquisicionAdmin.textContent = "Crear adquisición";
    modalAdquisicionAdmin.show();
}

function abrirEdicionAdquisicion(evento) {
    const adquisicion = adquisicionesAdmin.find((item) => item.id === evento.currentTarget.dataset.id);
    if (!adquisicion) return;
    formularioAdquisicionAdmin.reset();
    campoAdquisicionId.value = adquisicion.id;
    contenedorEstudianteAdquisicion.classList.add("d-none");
    contenedorCursoAdquisicion.classList.add("d-none");
    campoAdquisicionEstudiante.required = false;
    campoAdquisicionCurso.required = false;
    identidadAdquisicionAdmin.classList.remove("d-none");
    contenedorFechaAdquisicionAdmin.classList.remove("d-none");
    campoAdquisicionFecha.required = true;
    campoAdquisicionImporte.value = adquisicion.importe ?? "";
    campoAdquisicionFecha.value = fechaAdquisicionParaInput(adquisicion.fechaAdquisicion);
    tituloModalAdquisicionAdmin.textContent = "Modificar adquisición";
    btnGuardarAdquisicionAdmin.textContent = "Guardar cambios";
    modalAdquisicionAdmin.show();
}

function camposAdquisicionValidos(importe) {
    if (!Number.isFinite(importe) || importe <= 0 || importe > 1000000) {
        mostrarMensaje("El importe debe ser mayor que cero y no superar $1.000.000.", "warning");
        return false;
    }
    return true;
}

async function guardarAdquisicionAdmin(evento) {
    evento.preventDefault();
    const importe = Number(campoAdquisicionImporte.value);
    if (!camposAdquisicionValidos(importe)) return;

    btnGuardarAdquisicionAdmin.disabled = true;
    btnGuardarAdquisicionAdmin.textContent = "Guardando...";
    try {
        if (!campoAdquisicionId.value) {
            const estudiante = usuarios.find((usuario) => usuario.id === campoAdquisicionEstudiante.value && usuario.rol === "estudiante");
            const curso = cursosAdmin.find((item) => item.id === campoAdquisicionCurso.value);
            if (!estudiante || !curso) {
                mostrarMensaje("Seleccioná un estudiante y un curso válidos.", "warning");
                return;
            }

            const referencia = doc(db, "adquisiciones", `${estudiante.id}_${curso.id}`);
            await runTransaction(db, async (transaccion) => {
                const existente = await transaccion.get(referencia);
                if (existente.exists()) {
                    const error = new Error("Ya existe una adquisición para este estudiante y curso.");
                    error.code = "already-exists";
                    throw error;
                }
                transaccion.set(referencia, {
                    usuarioId: estudiante.id,
                    usuarioCorreo: estudiante.correo || estudiante.email || "",
                    cursoId: curso.id,
                    cursoTitulo: curso.titulo || "Curso",
                    importe,
                    estado: "confirmada",
                    pagoSimulado: true,
                    fechaAdquisicion: serverTimestamp()
                });
            });
        } else {
            const fecha = new Date(campoAdquisicionFecha.value);
            if (Number.isNaN(fecha.getTime())) {
                mostrarMensaje("Ingresá una fecha válida.", "warning");
                return;
            }
            await updateDoc(doc(db, "adquisiciones", campoAdquisicionId.value), {
                importe,
                fechaAdquisicion: Timestamp.fromDate(fecha)
            });
            const verificacion = await getDocFromServer(doc(db, "adquisiciones", campoAdquisicionId.value));
            if (!verificacion.exists() || Number(verificacion.data().importe) !== importe) {
                throw new Error("Firestore no confirmó la modificación.");
            }
        }

        modalAdquisicionAdmin.hide();
        mostrarMensaje(campoAdquisicionId.value ? "Adquisición modificada correctamente." : "Adquisición creada correctamente.", "success");
        await cargarAdquisicionesAdmin();
    } catch (error) {
        console.error("No fue posible guardar la adquisición.", error);
        const mensaje = error.code === "already-exists"
            ? "Ese estudiante ya tiene una adquisición registrada para este curso."
            : error.code === "permission-denied"
                ? "Firestore rechazó el cambio. Publicá las reglas administrativas de adquisiciones."
                : "No fue posible guardar la adquisición. El modal sigue abierto para reintentar.";
        mostrarMensaje(mensaje, error.code === "already-exists" ? "warning" : "danger");
    } finally {
        btnGuardarAdquisicionAdmin.disabled = false;
        btnGuardarAdquisicionAdmin.textContent = campoAdquisicionId.value ? "Guardar cambios" : "Crear adquisición";
    }
}

async function eliminarAdquisicionAdmin(evento) {
    const boton = evento.currentTarget;
    const adquisicion = adquisicionesAdmin.find((item) => item.id === boton.dataset.id);
    if (!adquisicion) return;
    if (!window.confirm(`¿Eliminar la adquisición de “${adquisicion.cursoTitulo || "este curso"}” para ${adquisicion.usuarioCorreo || adquisicion.usuarioId}? Se borrará del historial y el estudiante podrá adquirirlo nuevamente.`)) return;

    boton.disabled = true;
    boton.textContent = "Eliminando...";
    try {
        await deleteDoc(doc(db, "adquisiciones", adquisicion.id));
        mostrarMensaje("Adquisición eliminada del historial.", "success");
        await cargarAdquisicionesAdmin();
    } catch (error) {
        console.error("No fue posible eliminar la adquisición.", error);
        mostrarMensaje(error.code === "permission-denied"
            ? "Firestore rechazó la baja. Publicá las reglas administrativas de adquisiciones."
            : "No fue posible eliminar la adquisición.", "danger");
        boton.disabled = false;
        boton.textContent = "Eliminar";
    }
}

function mostrarCursosAdmin(lista) {
    if (lista.length === 0) {
        listaCursosAdmin.innerHTML = "";
        estadoCursosAdmin.textContent = "No se encontraron cursos.";
        return;
    }

    estadoCursosAdmin.textContent = `${lista.length} curso(s) encontrado(s).`;
    listaCursosAdmin.innerHTML = lista.map((curso) => {
        const publicado = curso.habilitado === true;
        const estado = publicado ? "Publicado" : "Borrador";
        const nivel = { basico: "Básico", intermedio: "Intermedio", avanzado: "Avanzado" }[curso.nivel] || curso.nivel || "Sin nivel";
        const precio = curso.precio ?? preciosPorNivel[curso.nivel] ?? 1200;
        return `
            <tr>
                <td><strong>${escaparHTML(curso.titulo || "Sin título")}</strong></td>
                <td>${escaparHTML(nivel)}</td>
                <td>${escaparHTML(formatearPrecioCurso(precio))}</td>
                <td>${escaparHTML(curso.docenteNombre || "Equipo EDUY")}</td>
                <td><span class="badge ${publicado ? "text-bg-success" : "text-bg-secondary"}">${estado}</span></td>
                <td>
                    <div class="d-flex flex-wrap gap-2">
                        <button type="button" class="btn btn-sm btn-outline-primary btn-editar-curso" data-id="${escaparHTML(curso.id)}">Editar</button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-curso" data-id="${escaparHTML(curso.id)}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    listaCursosAdmin.querySelectorAll(".btn-editar-curso")
        .forEach((boton) => boton.addEventListener("click", abrirEdicionCurso));
    listaCursosAdmin.querySelectorAll(".btn-eliminar-curso")
        .forEach((boton) => boton.addEventListener("click", eliminarCursoAdmin));
}

function filtrarCursosAdmin() {
    const texto = buscadorCursosAdmin.value.trim().toLocaleLowerCase("es");
    mostrarCursosAdmin(cursosAdmin.filter((curso) =>
        (curso.titulo || "").toLocaleLowerCase("es").includes(texto)
        || (curso.docenteNombre || "").toLocaleLowerCase("es").includes(texto)
    ));
}

function abrirAltaCurso() {
    modoFormularioCurso = "crear";
    formularioCursoAdmin.reset();
    contenedorDocenteCursoAdmin.classList.add("d-none");
    campoCursoId.value = "";
    campoCursoNivel.value = "basico";
    campoCursoPrecio.value = preciosPorNivel.basico;
    campoCursoEstado.value = "borrador";
    tituloModalCurso.textContent = "Crear curso";
    btnGuardarCursoAdmin.textContent = "Crear curso";
    modalCursoAdmin.show();
}

function abrirEdicionCurso(evento) {
    const curso = cursosAdmin.find((item) => item.id === evento.currentTarget.dataset.id);
    if (!curso) return;
    modoFormularioCurso = "editar";
    formularioCursoAdmin.reset();
    campoCursoId.value = curso.id;
    campoCursoTitulo.value = curso.titulo || "";
    campoCursoDescripcion.value = curso.descripcion || "";
    campoCursoModulos.value = (Array.isArray(curso.modulos) ? curso.modulos : [])
        .map((modulo) => `${modulo.titulo || ""} | ${modulo.descripcion || ""}`)
        .join("\n");
    campoCursoNivel.value = ["basico", "intermedio", "avanzado"].includes(curso.nivel) ? curso.nivel : "basico";
    cargarOpcionesDocentesCurso(curso);
    campoCursoPrecio.value = curso.precio ?? preciosPorNivel[curso.nivel] ?? 1200;
    campoCursoDuracion.value = curso.duracion || "";
    campoCursoImagen.value = curso.imagen || "";
    campoCursoEstado.value = curso.habilitado === true ? "habilitado" : "borrador";
    tituloModalCurso.textContent = "Modificar curso";
    btnGuardarCursoAdmin.textContent = "Guardar cambios";
    modalCursoAdmin.show();
}

function cargarOpcionesDocentesCurso(curso) {
    campoCursoDocente.replaceChildren(new Option("Equipo EDUY", ""));
    const docentes = usuarios
        .filter((usuario) => usuario.rol === "docente")
        .sort((a, b) => (a.nombre || a.correo || "").localeCompare(b.nombre || b.correo || "", "es"));

    docentes.forEach((docente) => {
        const nombre = docente.nombre || docente.correo || docente.email || "Docente sin nombre";
        const correo = docente.correo || docente.email;
        const etiqueta = correo && correo !== nombre ? `${nombre} (${correo})` : nombre;
        campoCursoDocente.add(new Option(etiqueta, docente.id));
    });

    if (curso.docenteId && !docentes.some((docente) => docente.id === curso.docenteId)) {
        campoCursoDocente.add(new Option(
            `${curso.docenteNombre || "Docente asignado"} (perfil no encontrado)`,
            curso.docenteId
        ));
    }

    campoCursoDocente.value = curso.docenteId || "";
    contenedorDocenteCursoAdmin.classList.remove("d-none");
}

function validarImagenCurso(imagen) {
    return !imagen || /^https:\/\//i.test(imagen) || /^img\/[a-zA-Z0-9_./-]+$/.test(imagen);
}

async function guardarCursoAdmin(evento) {
    evento.preventDefault();
    const titulo = campoCursoTitulo.value.trim();
    const descripcion = campoCursoDescripcion.value.trim();
    const lineasModulos = campoCursoModulos.value.split("\n").map((linea) => linea.trim()).filter(Boolean);
    const modulos = [];
    for (const linea of lineasModulos) {
        const separador = linea.indexOf("|");
        if (separador < 1 || !linea.slice(separador + 1).trim()) {
            mostrarMensaje("Cada módulo debe tener el formato título | descripción.", "warning");
            return;
        }
        modulos.push({
            titulo: linea.slice(0, separador).trim(),
            descripcion: linea.slice(separador + 1).trim()
        });
    }
    if (modulos.length > 20) {
        mostrarMensaje("Un curso puede tener hasta 20 módulos.", "warning");
        return;
    }
    const nivel = campoCursoNivel.value;
    const precio = Number(campoCursoPrecio.value);
    const duracion = campoCursoDuracion.value.trim();
    const imagen = campoCursoImagen.value.trim();
    const habilitado = campoCursoEstado.value === "habilitado";

    if (!validarImagenCurso(imagen)) {
        mostrarMensaje("Ingresá una URL HTTPS o una ruta que empiece por img/.", "warning");
        return;
    }
    if (!Number.isFinite(precio) || precio <= 0) {
        mostrarMensaje("El precio debe ser un número mayor que cero.", "warning");
        return;
    }

    btnGuardarCursoAdmin.disabled = true;
    btnGuardarCursoAdmin.textContent = "Guardando...";
    const datos = {
        titulo,
        descripcion,
        nivel,
        imagen,
        duracion,
        precio,
        habilitado,
        estado: habilitado ? "habilitado" : "borrador",
        modulos,
        fechaActualizacion: serverTimestamp()
    };

    try {
        let cursoId = campoCursoId.value;
        if (modoFormularioCurso === "crear") {
            const referencia = await addDoc(collection(db, "cursos"), {
                ...datos,
                docenteNombre: "Equipo EDUY",
                fechaCreacion: serverTimestamp(),
                destacado: false,
                orden: cursosAdmin.length
            });
            cursoId = referencia.id;
        } else {
            const docenteId = campoCursoDocente.value;
            const docente = usuarios.find((usuario) => usuario.id === docenteId && usuario.rol === "docente");
            const cursoOriginal = cursosAdmin.find((curso) => curso.id === cursoId);
            const docenteNombre = docente
                ? docente.nombre || docente.correo || docente.email || "Docente"
                : docenteId
                    ? cursoOriginal?.docenteNombre || "Docente asignado"
                    : "Equipo EDUY";
            await updateDoc(doc(db, "cursos", cursoId), {
                ...datos,
                docenteNombre,
                docenteId: docenteId || deleteField()
            });
        }

        const verificacion = await getDocFromServer(doc(db, "cursos", cursoId));
        const cursoGuardado = verificacion.exists() ? verificacion.data() : null;
        if (!cursoGuardado || cursoGuardado.titulo !== titulo || cursoGuardado.habilitado !== habilitado || Number(cursoGuardado.precio) !== precio) {
            throw new Error("Firestore no confirmó los datos del curso.");
        }
        if (modoFormularioCurso === "editar" && cursoGuardado.docenteId !== (campoCursoDocente.value || undefined)) {
            throw new Error("Firestore no confirmó el docente asignado.");
        }

        modalCursoAdmin.hide();
        mostrarMensaje(modoFormularioCurso === "crear" ? "Curso creado correctamente." : "Curso modificado correctamente.", "success");
        await cargarCursosAdmin();
    } catch (error) {
        console.error("No fue posible guardar el curso.", error);
        mostrarMensaje(error.code === "permission-denied"
            ? "Firestore rechazó el cambio. Publicá las reglas de cursos para administradores y volvé a intentar."
            : "No fue posible guardar el curso. El modal sigue abierto para que puedas corregir o reintentar.", "danger");
    } finally {
        btnGuardarCursoAdmin.disabled = false;
        btnGuardarCursoAdmin.textContent = modoFormularioCurso === "crear" ? "Crear curso" : "Guardar cambios";
    }
}

async function eliminarCursoAdmin(evento) {
    const boton = evento.currentTarget;
    const curso = cursosAdmin.find((item) => item.id === boton.dataset.id);
    if (!curso) return;
    if (!window.confirm(`¿Eliminar el curso “${curso.titulo || "Sin título"}”? Esta acción no se puede deshacer.`)) return;

    boton.disabled = true;
    boton.textContent = "Verificando...";
    try {
        const adquisiciones = query(
            collection(db, "adquisiciones"),
            where("cursoId", "==", curso.id),
            limit(1)
        );
        const resultadoAdquisiciones = await getDocsFromServer(adquisiciones);
        if (!resultadoAdquisiciones.empty) {
            mostrarMensaje("Este curso tiene adquisiciones asociadas. Para conservar el historial, cambialo a Borrador desde Editar en lugar de eliminarlo.", "warning");
            boton.disabled = false;
            boton.textContent = "Eliminar";
            return;
        }
        boton.textContent = "Eliminando...";
        await deleteDoc(doc(db, "cursos", curso.id));
        mostrarMensaje("Curso eliminado correctamente.", "success");
        await cargarCursosAdmin();
    } catch (error) {
        console.error("No fue posible eliminar el curso.", error);
        mostrarMensaje(error.code === "permission-denied"
            ? "Firestore rechazó la baja. Verificá las reglas administrativas de cursos y adquisiciones."
            : "No fue posible verificar las adquisiciones o eliminar el curso.", "danger");
        boton.disabled = false;
        boton.textContent = "Eliminar";
    }
}

function mostrarUsuarios(lista) {
    if (lista.length === 0) {
        listaUsuarios.innerHTML = "";
        estadoUsuarios.textContent = "No se encontraron usuarios.";
        return;
    }

    estadoUsuarios.textContent = `${lista.length} usuario(s) encontrado(s).`;
    listaUsuarios.innerHTML = lista.map((usuario) => {
        const nombre = usuario.nombre || "Sin nombre";
        const correo = usuario.correo || usuario.email || "Sin correo";
        const rol = usuario.rol || "estudiante";
        const rolVisible = {
            estudiante: "Estudiante",
            docente: "Docente",
            admin: "Administrador"
        }[rol] || rol;
        const protegido = rol === "admin" || usuario.id === administradorActual;
        const acciones = protegido
            ? '<span class="text-body-secondary">Protegido</span>'
            : `
                <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary btn-editar-usuario" data-id="${escaparHTML(usuario.id)}">Editar</button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-usuario" data-id="${escaparHTML(usuario.id)}">Eliminar</button>
                </div>
            `;

        return `
            <tr>
                <td>${escaparHTML(nombre)}</td>
                <td>${escaparHTML(correo)}</td>
                <td><span class="badge text-bg-secondary">${escaparHTML(rolVisible)}</span></td>
                <td>${acciones}</td>
            </tr>
        `;
    }).join("");

    listaUsuarios.querySelectorAll(".btn-editar-usuario")
        .forEach((boton) => boton.addEventListener("click", abrirEdicion));
    listaUsuarios.querySelectorAll(".btn-eliminar-usuario")
        .forEach((boton) => boton.addEventListener("click", eliminarUsuario));
}

function filtrarUsuarios() {
    const texto = buscadorUsuarios.value.trim().toLocaleLowerCase("es");
    const filtrados = usuarios.filter((usuario) => {
        const nombre = (usuario.nombre || "").toLocaleLowerCase("es");
        const correo = (usuario.correo || usuario.email || "").toLocaleLowerCase("es");
        return nombre.includes(texto) || correo.includes(texto);
    });
    mostrarUsuarios(filtrados);
}

function abrirAlta() {
    modoFormulario = "crear";
    formularioUsuario.reset();
    campoId.value = "";
    campoEmail.disabled = false;
    campoContrasena.required = true;
    contenedorContrasena.classList.remove("d-none");
    campoRol.value = "estudiante";
    tituloModalUsuario.textContent = "Crear usuario";
    btnGuardarUsuario.textContent = "Crear usuario";
    modalUsuario.show();
}

function abrirEdicion(evento) {
    const usuario = usuarios.find((item) => item.id === evento.currentTarget.dataset.id);
    if (!usuario) return;

    modoFormulario = "editar";
    formularioUsuario.reset();
    campoId.value = usuario.id;
    campoNombre.value = usuario.nombre || "";
    campoEmail.value = usuario.correo || usuario.email || "";
    campoEmail.disabled = true;
    campoContrasena.required = false;
    contenedorContrasena.classList.add("d-none");
    // El formulario usa etiquetas visibles y conserva el valor canónico guardado.
    campoRol.value = ["estudiante", "docente", "admin"].includes(usuario.rol)
        ? usuario.rol
        : "estudiante";
    tituloModalUsuario.textContent = "Modificar usuario";
    btnGuardarUsuario.textContent = "Guardar cambios";
    modalUsuario.show();
}

function mensajeError(error) {
    const mensajes = {
        "functions/unauthenticated": "La sesión expiró. Iniciá sesión nuevamente.",
        "functions/permission-denied": "No tenés permisos para administrar usuarios.",
        "permission-denied": "Firestore rechazó el cambio. Verificá que las reglas estén desplegadas y que tu perfil tenga rol administrador.",
        "auth/email-already-in-use": "Ya existe una cuenta con ese correo electrónico.",
        "auth/invalid-email": "El correo electrónico no es válido.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/operation-not-allowed": "El acceso con correo y contraseña no está habilitado en Firebase Authentication.",
        "functions/invalid-argument": "Revisá los datos ingresados.",
        "functions/already-exists": "Ya existe una cuenta con ese correo.",
        "functions/not-found": "No se encontró la cuenta seleccionada.",
        "functions/failed-precondition": error.message || "No se puede eliminar este usuario en su estado actual.",
        "functions/unavailable": "La baja requiere desplegar gestionarUsuario; Firebase indica que este proyecto debe pasar al plan Blaze para usar Cloud Functions.",
        "functions/internal": error.message || "La función de Firebase no pudo guardar los cambios. Revisá sus registros de ejecución.",
        "local/profile-not-updated": "La operación terminó, pero Firestore no confirma el nombre y rol nuevos. El modal sigue abierto; revisá la función desplegada y volvé a intentar."
    };
    if (error.cleanupFailed) {
        return "No se pudo guardar el perfil y Firebase no pudo retirar la cuenta temporal. Revisá Authentication antes de reintentar.";
    }
    return mensajes[error.code] || "No fue posible completar la operación.";
}

async function crearCuentaUsuario(data) {
    const credencial = await createUserWithEmailAndPassword(
        authAltaUsuario,
        data.email,
        data.password
    );

    try {
        await updateProfile(credencial.user, { displayName: data.nombre });
        await setDoc(doc(db, "usuarios", credencial.user.uid), {
            nombre: data.nombre,
            correo: data.email,
            rol: data.rol,
            fechaCreacion: serverTimestamp(),
            fechaActualizacion: serverTimestamp(),
            actualizadoPor: administradorActual
        });
        return { uid: credencial.user.uid };
    } catch (error) {
        try {
            await deleteUser(credencial.user);
        } catch (errorLimpieza) {
            error.cleanupFailed = true;
            console.error("No se pudo eliminar la cuenta temporal de Authentication.", errorLimpieza);
        }
        throw error;
    } finally {
        try {
            await signOut(authAltaUsuario);
        } catch (errorCierre) {
            console.warn("No se pudo cerrar la sesión de la instancia secundaria.", errorCierre);
        }
    }
}

async function guardarUsuario(evento) {
    evento.preventDefault();
    const nombre = campoNombre.value.trim();
    const data = modoFormulario === "crear"
        ? {
            action: "create",
            nombre,
            email: campoEmail.value.trim().toLowerCase(),
            password: campoContrasena.value,
            rol: campoRol.value
        }
        : {
            action: "update",
            uid: campoId.value,
            nombre,
            rol: campoRol.value
        };

    btnGuardarUsuario.disabled = true;
    btnGuardarUsuario.textContent = "Guardando...";

    try {
        if (modoFormulario === "crear") {
            await crearCuentaUsuario(data);
        } else {
            await updateDoc(doc(db, "usuarios", data.uid), {
                nombre,
                rol: data.rol,
                fechaActualizacion: serverTimestamp(),
                actualizadoPor: administradorActual
            });
        }

        if (modoFormulario === "editar") {
            const perfilActual = await getDocFromServer(doc(db, "usuarios", data.uid));
            const datosActuales = perfilActual.exists() ? perfilActual.data() : null;

            if (
                !datosActuales ||
                datosActuales.nombre !== nombre ||
                datosActuales.rol !== data.rol
            ) {
                const errorVerificacion = new Error("Firestore no devolvió los datos solicitados.");
                errorVerificacion.code = "local/profile-not-updated";
                throw errorVerificacion;
            }
        }

        modalUsuario.hide();
        mostrarMensaje(
            modoFormulario === "crear"
                ? "Usuario creado correctamente."
                : "Usuario modificado correctamente.",
            "success"
        );
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(mensajeError(error), "danger");
    } finally {
        btnGuardarUsuario.disabled = false;
        btnGuardarUsuario.textContent = modoFormulario === "crear"
            ? "Crear usuario"
            : "Guardar cambios";
    }
}

async function eliminarUsuario(evento) {
    const boton = evento.currentTarget;
    const usuario = usuarios.find((item) => item.id === boton.dataset.id);
    if (!usuario) return;

    const nombre = usuario.nombre || usuario.correo || "este usuario";
    if (!window.confirm(`¿Eliminar la cuenta de ${nombre}? Esta acción no se puede deshacer.`)) return;

    boton.disabled = true;
    boton.textContent = "Eliminando...";

    try {
        await gestionarUsuario({ action: "delete", uid: usuario.id });
        mostrarMensaje("Usuario eliminado de Authentication y Firestore.", "success");
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarMensaje(mensajeError(error), "danger");
        boton.disabled = false;
        boton.textContent = "Eliminar";
    }
}

btnNuevoUsuario.addEventListener("click", abrirAlta);
formularioUsuario.addEventListener("submit", guardarUsuario);
buscadorUsuarios.addEventListener("input", filtrarUsuarios);
btnNuevoCurso.addEventListener("click", abrirAltaCurso);
formularioCursoAdmin.addEventListener("submit", guardarCursoAdmin);
buscadorCursosAdmin.addEventListener("input", filtrarCursosAdmin);
btnNuevaAdquisicion.addEventListener("click", abrirAltaAdquisicion);
formularioAdquisicionAdmin.addEventListener("submit", guardarAdquisicionAdmin);
buscadorAdquisicionesAdmin.addEventListener("input", filtrarAdquisicionesAdmin);
campoAdquisicionCurso.addEventListener("change", () => {
    const curso = cursosAdmin.find((item) => item.id === campoAdquisicionCurso.value);
    if (curso) campoAdquisicionImporte.value = precioSugeridoCurso(curso);
});

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        window.location.href = "./login.html";
        return;
    }

    try {
        const perfilAdmin = await comprobarAdministrador(usuario);
        if (!perfilAdmin) {
            alert("Esta sección es exclusiva para administradores.");
            window.location.href = "../index.html";
            return;
        }

        administradorActual = usuario.uid;
        contenidoAdmin.classList.remove("d-none");
        await Promise.all([cargarUsuarios(), cargarCursosAdmin()]);
        await cargarAdquisicionesAdmin();
    } catch (error) {
        console.error(error);
        mostrarMensaje(
            "No fue posible verificar el perfil administrador.",
            "danger"
        );
    }
});
