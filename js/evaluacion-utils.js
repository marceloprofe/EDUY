export const PORCENTAJE_MINIMO = 60;
export const PORCENTAJE_CERTIFICADO = 70;

export function normalizarPregunta(pregunta = {}) {
    const tipo = pregunta.tipo === "multiple"
        ? "multiple"
        : "verdadero_falso";

    const opciones = tipo === "verdadero_falso"
        ? ["Verdadero", "Falso"]
        : Array.isArray(pregunta.opciones)
            ? pregunta.opciones
                .map((opcion) => String(opcion).trim())
                .filter(Boolean)
                .slice(0, 6)
            : [];

    return {
        id: String(pregunta.id || ""),
        enunciado: String(pregunta.enunciado || "").trim(),
        tipo,
        opciones,
        correcta: Number(pregunta.correcta)
    };
}

export function validarPregunta(pregunta) {
    const normalizada = normalizarPregunta(pregunta);

    if (!normalizada.id || !normalizada.enunciado) {
        return false;
    }

    if (
        normalizada.opciones.length < 2 ||
        !Number.isInteger(normalizada.correcta) ||
        normalizada.correcta < 0 ||
        normalizada.correcta >= normalizada.opciones.length
    ) {
        return false;
    }

    return true;
}

export function calcularResultado(preguntas, respuestas) {
    const validas = preguntas
        .map(normalizarPregunta)
        .filter(validarPregunta);

    const correctas = validas.reduce(
        (total, pregunta) => total + (
            Number(respuestas[pregunta.id]) === pregunta.correcta
                ? 1
                : 0
        ),
        0
    );

    const porcentaje = validas.length === 0
        ? 0
        : Math.round((correctas / validas.length) * 100);

    return {
        correctas,
        total: validas.length,
        porcentaje,
        aprobado: porcentaje > PORCENTAJE_MINIMO,
        certificadoHabilitado: porcentaje > PORCENTAJE_CERTIFICADO
    };
}
