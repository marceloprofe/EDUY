// Importes reales y simulados se calculan por separado.
export function resumirCurso(cursoId, adquisiciones, visitas, costos = null) {
    const confirmadas = adquisiciones.filter(a => a.cursoId === cursoId && a.estado === "confirmada");
    const sumar = lista => lista.reduce((total, a) => total + (typeof a.importe === "number" && Number.isFinite(a.importe) && a.importe >= 0 ? a.importe : 0), 0);
    const reales = confirmadas.filter(a => a.pagoSimulado === false && a.estadoPago === "aprobado");
    const simuladas = confirmadas.filter(a => a.pagoSimulado === true);
    const cobrado = sumar(reales);
    const simulado = sumar(simuladas);
    const factor = costos ? 1 - (costos.comision + costos.docente) / 100 : null;
    return {
        visitas: visitas.filter(v => v.cursoId === cursoId).length,
        adquisiciones: confirmadas.length,
        ganancias: sumar(confirmadas),
        estudiantes: new Set(confirmadas.map(a => a.usuarioId).filter(Boolean)).size,
        cobrado, simulado,
        neto: factor === null ? null : cobrado * factor,
        netoSimulado: factor === null ? null : simulado * factor,
        sinVerificar: confirmadas.length - reales.length - simuladas.length
    };
}
