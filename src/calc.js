export function formatMoney(n) {
  return 'S/. ' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function calculateCTS({ sueldo, fechaInicio, cesada, fechaCese, horasExtra, asignacionFamiliar }) {
  const s = parseFloat(sueldo) || 0
  const startDate = new Date(fechaInicio)
  const periodStart = new Date('2025-11-01')
  const periodEnd = new Date('2026-04-30')

  const compStart =
    cesada
      ? new Date(fechaCese) > periodStart
        ? new Date(fechaCese)
        : periodStart
      : startDate > periodStart
      ? startDate
      : periodStart

  const compEnd =
    cesada
      ? new Date(fechaCese) < periodEnd
        ? new Date(fechaCese)
        : periodEnd
      : periodEnd

  let months = 0
  let days = 0
  if (compEnd >= compStart) {
    const diffMs = compEnd - compStart
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
    months = Math.floor(totalDays / 30)
    days = totalDays % 30
  }

  const promHE = horasExtra
    ? Object.values(horasExtra).reduce((sum, v) => sum + (parseFloat(v) || 0), 0) / 6
    : 0
  const gratificacion = (s + promHE) / 6
  const af = asignacionFamiliar ? 102 : 0
  const base = s + promHE + gratificacion + af
  const montoPorMes = base / 12
  const montoPorDia = base / 360
  const totalMeses = montoPorMes * months
  const totalDias = montoPorDia * days
  const total = totalMeses + totalDias

  return {
    total,
    months,
    days,
    sueldo: s,
    promHE,
    gratificacion,
    af,
    base,
    montoPorMes,
    montoPorDia,
    totalMeses,
    totalDias,
    periodStart: '2025-11-01',
    periodEnd: '2026-04-30',
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ─── Vacaciones ──────────────────────────────────────────────────────────────
// Régimen TdH (Ley 31047): 30 días/año si trabaja 4+ horas diarias,
// 15 días/año si trabaja menos. Monto = (sueldo/30) × días pendientes.
export function calculateVacaciones({
  sueldo,
  fechaInicioTrabajo,
  fechaFinTrabajo,
  yaSalido,
  diasSalido,
  trabaja4Horas,
}) {
  const s = parseFloat(sueldo) || 0
  const diasGozados = yaSalido ? (parseInt(diasSalido, 10) || 0) : 0
  const diasGenerados = trabaja4Horas ? 30 : 15
  const diasPendientes = Math.max(0, diasGenerados - diasGozados)
  const montoPorDia = s / 30
  const total = montoPorDia * diasPendientes

  return {
    total,
    sueldo: s,
    diasGenerados,
    diasGozados,
    diasPendientes,
    montoPorDia,
    fechaInicio: fechaInicioTrabajo,
    fechaFin: fechaFinTrabajo,
    modalidad: trabaja4Horas ? 'Tiempo completo' : 'Tiempo parcial',
  }
}

// ─── Gratificación ───────────────────────────────────────────────────────────
// Sueldo mensual × meses computables / 6 + bono 9% EsSalud (si NO tiene EPS).
// Periodos: julio (Ene-Jun) y diciembre (Jul-Dic).
const GRATI_PERIODS = {
  julio2026:  { start: '2026-01-01', end: '2026-06-30', label: 'Julio 2026' },
  dic2026:    { start: '2026-07-01', end: '2026-12-31', label: 'Diciembre 2026' },
  julio2025:  { start: '2025-01-01', end: '2025-06-30', label: 'Julio 2025' },
  dic2025:    { start: '2025-07-01', end: '2025-12-31', label: 'Diciembre 2025' },
}

export function calculateGratificacion({
  sueldo,
  period,
  fechaInicio,
  cesada,
  fechaCese,
  eps,
  horasExtra,
  asignacionFamiliar,
}) {
  const s = parseFloat(sueldo) || 0
  const p = GRATI_PERIODS[period] || GRATI_PERIODS.julio2026
  const periodStart = new Date(p.start)
  const periodEnd = new Date(p.end)
  const startDate = fechaInicio ? new Date(fechaInicio) : periodStart

  const compStart = startDate > periodStart ? startDate : periodStart
  const compEnd =
    cesada && fechaCese
      ? new Date(fechaCese) < periodEnd ? new Date(fechaCese) : periodEnd
      : periodEnd

  let months = 0
  let days = 0
  if (compEnd >= compStart) {
    const totalDays = Math.floor((compEnd - compStart) / 86400000) + 1
    months = Math.floor(totalDays / 30)
    days = totalDays % 30
  }

  const promHE = horasExtra
    ? Object.values(horasExtra).reduce((sum, v) => sum + (parseFloat(v) || 0), 0) / 6
    : 0
  const af = asignacionFamiliar ? 102 : 0
  const base = s + promHE + af
  const montoBase = (base / 6) * months + (base / 180) * days
  // Bono extraordinario: 9% si EsSalud, 6.75% si EPS
  const bonoPct = eps ? 0.0675 : 0.09
  const bono = montoBase * bonoPct
  const total = montoBase + bono

  return {
    total,
    months,
    days,
    sueldo: s,
    promHE,
    af,
    base,
    montoBase,
    bono,
    bonoPct,
    eps: !!eps,
    periodLabel: p.label,
    periodStart: p.start,
    periodEnd: p.end,
  }
}

// ─── Liquidación de beneficios sociales ──────────────────────────────────────
// Combina CTS trunca + Gratificación trunca + Vacaciones truncas hasta la
// fecha de cese, descontando los periodos que ya fueron pagados al trabajador.
function monthsBetween(d1, d2) {
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
}

export function calculateLiquidacion({
  sueldo,
  fechaInicioTrabajo,
  fechaFinTrabajo,
  yaSalido,
  diasSalido,
  trabaja4Horas,
  eps,
  ctsPagados = [],
  gratiPagados = [],
  vacacionesPagadas = [],
}) {
  const s = parseFloat(sueldo) || 0
  const fechaInicio = fechaInicioTrabajo ? new Date(fechaInicioTrabajo) : new Date()
  const fechaFin = fechaFinTrabajo ? new Date(fechaFinTrabajo) : new Date()
  const totalMonths = Math.max(0, monthsBetween(fechaInicio, fechaFin))

  // VACACIONES TRUNCAS — días generados según modalidad menos días gozados
  const diasGozados = yaSalido ? (parseInt(diasSalido, 10) || 0) : 0
  // Si pagaron años completos, asumimos 30 días/año cancelados de derecho
  const aniosPagados = (vacacionesPagadas?.length || 0)
  const diasDerecho = trabaja4Horas ? 30 : 15
  const diasPendientes = Math.max(0, diasDerecho - diasGozados - aniosPagados * diasDerecho)
  const vacacionesTruncas = (s / 30) * diasPendientes

  // CTS TRUNCA — 1/12 sueldo por mes computable, hasta 6 meses por periodo;
  // descontamos los periodos ya pagados (cada uno cubre 6 meses).
  const ctsMonthsAvail = Math.max(0, totalMonths - (ctsPagados?.length || 0) * 6)
  const ctsMonths = Math.min(6, ctsMonthsAvail)
  const ctsTrunca = (s / 12) * ctsMonths

  // GRATIFICACIÓN TRUNCA — sueldo/6 por mes, hasta 6 meses por periodo;
  // bono 9% EsSalud o 6.75% EPS sobre el monto base.
  const gratiMonthsAvail = Math.max(0, totalMonths - (gratiPagados?.length || 0) * 6)
  const gratiMonths = Math.min(6, gratiMonthsAvail)
  const gratiBase = (s / 6) * gratiMonths
  const bonoPct = eps ? 0.0675 : 0.09
  const gratiTrunca = gratiBase + gratiBase * bonoPct

  const total = vacacionesTruncas + ctsTrunca + gratiTrunca

  // Periodo textual derivado de la fecha de cese: Ene-Jun o Jul-Dic
  const ceseYear = fechaFin.getFullYear()
  const ceseSem = fechaFin.getMonth() < 6 ? 'Enero — Junio' : 'Julio — Diciembre'
  const periodoTexto = `${ceseSem} ${ceseYear}`

  return {
    total,
    sueldo: s,
    ctsTrunca,
    gratiTrunca,
    vacacionesTruncas,
    diasPendientes,
    diasGozados,
    eps: !!eps,
    bonoPct,
    fechaInicio: fechaInicioTrabajo,
    fechaFin: fechaFinTrabajo,
    periodoTexto,
  }
}
