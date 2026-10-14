import { db } from "./firebase-config.js";
import { collection, getDocsFromServer } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { resumirCurso } from "./estadisticas-calculos.js";

const panel = document.querySelector("#estadisticas");
const estado = panel.querySelector("#estadoEstadisticas");
const lista = panel.querySelector("#listaEstadisticas");
const buscar = panel.querySelector("#buscarEstadisticas");

const actualizar = panel.querySelector("#actualizarEstadisticas");
const dinero = valor => new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(valor);
let datos = null;
let avisoVisitas = "";

function estadoTarjetas(texto) {
    for (const id of ["cursoMasAdquirido", "docenteMasAsignado", "cursoMasAlumnos"]) {
        panel.querySelector(`#${id}`).textContent = texto;
    }
    for (const id of ["cantidadMasAdquirido", "cantidadMasAsignado", "cantidadMasAlumnos"]) {
        panel.querySelector(`#${id}`).textContent = "";
    }
}

function mostrarDestacados() {
    const cursos = datos.cursos.map(curso => ({
        nombre: curso.titulo || "Curso sin título",
        ...resumirCurso(curso.id, datos.adquisiciones, [])
    }));
    const docentes = new Map();
    for (const curso of datos.cursos) {
        // Contar personas asignadas por UID; el equipo institucional no es un docente.
        if (!curso.docenteId) continue;
        const docente = datos.usuarios.find(u => u.id === curso.docenteId);
        const registro = docentes.get(curso.docenteId) || {
            nombre: docente?.nombre || curso.docenteNombre || "Docente sin nombre",
            cantidad: 0
        };
        registro.cantidad++;
        docentes.set(curso.docenteId, registro);
    }
    function destacar(registros, campo, nombreId, cantidadId, unidad) {
        const maximo = Math.max(0, ...registros.map(r => r[campo]));
        const ganadores = registros.filter(r => r[campo] === maximo);
        panel.querySelector(`#${nombreId}`).textContent = maximo > 0
            ? ganadores.map(r => r.nombre).join(" · ")
            : "Sin datos todavía";
        panel.querySelector(`#${cantidadId}`).textContent = maximo > 0
            ? `${maximo} ${unidad}${ganadores.length > 1 ? " · Empate" : ""}`
            : "";
    }
    destacar(cursos, "adquisiciones", "cursoMasAdquirido", "cantidadMasAdquirido", "adquisición(es)");
    destacar([...docentes.values()], "cantidad", "docenteMasAsignado", "cantidadMasAsignado", "curso(s) asignado(s)");
    destacar(cursos, "estudiantes", "cursoMasAlumnos", "cantidadMasAlumnos", "alumno(s)");
}

function mostrar() {
    if (!datos) return;
    mostrarDestacados();
    lista.replaceChildren();
    const texto = buscar.value.trim().toLocaleLowerCase("es");

    for (const curso of datos.cursos) {
        const docente = datos.usuarios.find(u => u.id === curso.docenteId);
        const nombreDocente = docente?.nombre || curso.docenteNombre || "Sin docente asignado";
        if (!`${curso.titulo} ${nombreDocente}`.toLocaleLowerCase("es").includes(texto)) continue;
        const resumen = resumirCurso(curso.id, datos.adquisiciones, datos.visitas || []);

        const fila = document.createElement("tr");
        const valores = [curso.titulo || "Curso sin título", datos.visitas === null ? "No disponible" : resumen.visitas, resumen.adquisiciones,
            dinero(resumen.ganancias), nombreDocente, resumen.estudiantes];
        for (const valor of valores) {
            const celda = document.createElement("td");
            celda.textContent = String(valor);
            fila.append(celda);
        }
        lista.append(fila);
    }
    estado.textContent = `${lista.children.length} curso(s). Actualizado: ${new Date().toLocaleString("es-UY")}. ${avisoVisitas}`;
}

async function cargar() {
    actualizar.disabled = true;
    estado.textContent = "Cargando estadísticas…";
    estadoTarjetas("Cargando…");
    lista.replaceChildren();
    try {
        const nombres = ["cursos", "usuarios", "adquisiciones", "visitasCursos"];
        const resultados = await Promise.allSettled(nombres.map(async nombre => {
            const respuesta = await getDocsFromServer(collection(db, nombre));
            return respuesta.docs.map(d => ({ ...d.data(), id: d.id }));
        }));
        const erroresPrincipales = resultados.slice(0, 3)
            .map((resultado, i) => ({ resultado, nombre: nombres[i] }))
            .filter(({ resultado }) => resultado.status === "rejected");
        if (erroresPrincipales.length) {
            const error = new Error("No se pudieron consultar: " + erroresPrincipales.map(e => e.nombre).join(", "));
            error.detalles = erroresPrincipales;
            throw error;
        }
        const visitasDisponibles = resultados[3].status === "fulfilled";
        avisoVisitas = "";
        if (!visitasDisponibles) {
            const errorVisitas = resultados[3].reason;
            console.warn("No se pudieron consultar visitasCursos:", errorVisitas);
            avisoVisitas = errorVisitas.code === "permission-denied"
                ? "Visitas no disponibles: falta publicar las reglas de visitasCursos en Firebase. Las demás estadísticas están disponibles."
                : "Visitas no disponibles por un error de conexión o consulta. Pulsá Actualizar para reintentar.";
        }
        datos = {
            cursos: resultados[0].value,
            usuarios: resultados[1].value,
            adquisiciones: resultados[2].value,
            visitas: visitasDisponibles ? resultados[3].value : null
        };
        // Conservar también el historial de cursos retirados del catálogo.
        for (const a of datos.adquisiciones) {
            if (a.cursoId && !datos.cursos.some(c => c.id === a.cursoId)) {
                datos.cursos.push({ id: a.cursoId, titulo: `${a.cursoTitulo || a.cursoId} (retirado)` });
            }
        }
        datos.cursos.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "es"));
        mostrar();
    } catch (error) {
        datos = null;
        estadoTarjetas("No disponible");
        console.error("Estadísticas:", error);
        estado.textContent = `${error.message}. Verificá la conexión y los permisos de administrador y pulsá Actualizar.`;
    } finally { actualizar.disabled = false; }
}

buscar.addEventListener("input", mostrar);
actualizar.addEventListener("click", cargar);
document.querySelector("#estadisticas-tab").addEventListener("shown.bs.tab", cargar);
