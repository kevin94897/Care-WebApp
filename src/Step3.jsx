import { useState, useEffect } from 'react'
import { Header, Stepper } from './UI'
import { IconDownload, IconShare } from './Icons'
import { formatMoney, formatDate } from './calc'

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ─── Sheet body por beneficio ────────────────────────────────────────────────
function CtsSheetBody({ result }) {
  return (
    <>
      <div className="detail-section">
        <div className="detail-section-title">Tiempo computable</div>
        <div className="detail-row">
          <span className="label">Meses laborados</span>
          <span className="value">{result.months}</span>
        </div>
        <div className="detail-row">
          <span className="label">Días laborados</span>
          <span className="value">{result.days}</span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Cálculo</div>
        <div className="detail-row">
          <span className="label">Sueldo</span>
          <span className="value">{formatMoney(result.sueldo)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Promedio horas extras</span>
          <span className="value">{formatMoney(result.promHE)}</span>
        </div>
        <div className="detail-row">
          <span className="label">⅙ Gratificación</span>
          <span className="value">{formatMoney(result.gratificacion)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Asignación familiar</span>
          <span className="value">{formatMoney(result.af)}</span>
        </div>
      </div>

      <div className="legal-card">
        <div className="legal-title">Tarjeta de Desglose Legal · Ley N° 31047</div>
        <div className="legal-row">
          <span className="lbl">Fecha Inicio</span>
          <span className="val">{result.periodStart}</span>
        </div>
        <div className="legal-row">
          <span className="lbl">Fecha Fin</span>
          <span className="val">{result.periodEnd}</span>
        </div>
        <div className="legal-row">
          <span className="lbl">Fórmula meses</span>
          <span className="val">({formatMoney(result.base)} / 12) × {result.months}</span>
        </div>
        <div className="legal-row">
          <span className="lbl">Monto meses</span>
          <span className="val">{formatMoney(result.totalMeses)}</span>
        </div>
        <div className="legal-row">
          <span className="lbl">Fórmula días</span>
          <span className="val">({formatMoney(result.base)} / 360) × {result.days}</span>
        </div>
        <div className="legal-row">
          <span className="lbl">Monto días</span>
          <span className="val">{formatMoney(result.totalDias)}</span>
        </div>
        <div className="legal-total">
          <span className="lbl">Total CTS</span>
          <span className="val">{formatMoney(result.total)}</span>
        </div>
      </div>
    </>
  )
}

function VacaSheetBody({ result }) {
  return (
    <div className="detail-section">
      <div className="detail-section-title">Cálculo</div>
      <div className="detail-row">
        <span className="label">Sueldo mensual</span>
        <span className="value">{formatMoney(result.sueldo)}</span>
      </div>
      <div className="detail-row">
        <span className="label">Vacaciones</span>
        <span className="value">(SM/30) x vacaciones pendientes</span>
      </div>
      <div className="detail-row">
        <span className="label">Vacaciones pendientes</span>
        <span className="value">{result.diasPendientes}</span>
      </div>
    </div>
  )
}

function GratiSheetBody({ result }) {
  return (
    <>
      <div className="detail-section">
        <div className="detail-section-title">Tiempo computable</div>
        <div className="detail-row">
          <span className="label">Meses laborados</span>
          <span className="value">{result.months}</span>
        </div>
        <div className="detail-row">
          <span className="label">Días laborados</span>
          <span className="value">{result.days}</span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Cálculo</div>
        <div className="detail-row">
          <span className="label">Sueldo</span>
          <span className="value">{formatMoney(result.sueldo)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Promedio horas extras</span>
          <span className="value">{formatMoney(result.promHE)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Asignación familiar</span>
          <span className="value">{formatMoney(result.af)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Bono ({(result.bonoPct * 100).toFixed(2)}% {result.eps ? 'EPS' : 'EsSalud'})</span>
          <span className="value">{formatMoney(result.bono)}</span>
        </div>
      </div>

      <div className="legal-card">
        <div className="legal-title">Tarjeta de Desglose Legal · Ley N° 27735</div>
        <div className="legal-row">
          <span className="lbl">Periodo</span>
          <span className="val">{result.periodLabel}</span>
        </div>
        <div className="legal-row">
          <span className="lbl">Fecha Inicio</span>
          <span className="val">{result.periodStart}</span>
        </div>
        <div className="legal-row">
          <span className="lbl">Fecha Fin</span>
          <span className="val">{result.periodEnd}</span>
        </div>
        <div className="legal-total">
          <span className="lbl">Total Gratificación</span>
          <span className="val">{formatMoney(result.total)}</span>
        </div>
      </div>
    </>
  )
}

function LiqSheetBody({ result }) {
  return (
    <>
      <div className="detail-section">
        <div className="detail-section-title">Cálculo</div>
        <div className="detail-row">
          <span className="label">CTS trunca</span>
          <span className="value">{formatMoney(result.ctsTrunca)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Gratificación trunca</span>
          <span className="value">{formatMoney(result.gratiTrunca)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Vacaciones truncas</span>
          <span className="value">{formatMoney(result.vacacionesTruncas)}</span>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">Recordatorio</div>
        <p className="text-[13px] leading-[19px] font-medium text-grey-500 mb-2">
          · La CTS se otorga a quienes trabajan 4 o más horas al día
        </p>
        <p className="text-[13px] leading-[19px] font-medium text-grey-500">
          · Los montos pueden aumentar si tu empleador/a no ha pagado adecuadamente los beneficios sociales anteriores.
        </p>
      </div>
    </>
  )
}

function DetailSheet({ open, onClose, result, benefit }) {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 340)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!mounted) return null

  const sheetTitle = benefit === 'liquidacion' ? 'Mis beneficios truncos' : 'Detalle del cálculo'

  return (
    <div
      className="sheet-overlay"
      style={{ opacity: visible ? 1 : 0 }}
      onClick={onClose}
    >
      <div
        className="sheet-panel"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="sheet-header">
          <span className="sheet-title">{sheetTitle}</span>
          <button className="sheet-close-btn" onClick={onClose} aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        <div className="sheet-body">
          {benefit === 'vacaciones' && <VacaSheetBody result={result} />}
          {benefit === 'gratificacion' && <GratiSheetBody result={result} />}
          {benefit === 'liquidacion' && <LiqSheetBody result={result} />}
          {(!benefit || benefit === 'cts') && <CtsSheetBody result={result} />}
        </div>
      </div>
    </div>
  )
}

// ─── Hero + Summary por beneficio ────────────────────────────────────────────
function CtsView({ data, result }) {
  return (
    <>
      <div className="mt-2 mb-1 text-[12px] leading-[18px] font-medium text-grey-500 text-center">
        Calculadora de CTS · Mayo 2026
      </div>

      <div className="result-hero fade-up">
        <div className="label">Tu CTS de Mayo 2026 es:</div>
        <div className="amount">{formatMoney(result.total)}</div>
        <div className="period">Periodo: Nov 2025 — Abr 2026</div>
      </div>

      <div className="result-detail fade-up-2">
        <div className="result-row">
          <span className="label">Sueldo mensual</span>
          <span className="value">{formatMoney(result.sueldo)}</span>
        </div>
        <div className="result-row">
          <span className="label">Fecha de inicio</span>
          <span className="value">{formatDate(data?.fechaInicio)}</span>
        </div>
        <div className="result-row">
          <span className="label">Periodo</span>
          <span className="value">Mayo 2026</span>
        </div>
      </div>
    </>
  )
}

function VacaView({ result }) {
  return (
    <>
      <div className="mt-2 mb-1 text-[12px] leading-[18px] font-medium text-grey-500 text-center">
        Calculadora de vacaciones
      </div>

      <div className="result-hero fade-up">
        <div className="label">Tu monto por vacaciones es:</div>
        <div className="amount">{formatMoney(result.total)}</div>
        <div className="period">Modalidad - {result.modalidad}</div>
      </div>

      <div className="result-detail fade-up-2">
        <div className="result-row">
          <span className="label">Fecha de inicio</span>
          <span className="value">{formatDate(result.fechaInicio)}</span>
        </div>
        <div className="result-row">
          <span className="label">Vacaciones generadas</span>
          <span className="value">{result.diasGenerados} días</span>
        </div>
        <div className="result-row">
          <span className="label">Vacaciones gozadas</span>
          <span className="value">{result.diasGozados} días</span>
        </div>
      </div>
    </>
  )
}

function GratiView({ data, result }) {
  return (
    <>
      <div className="mt-2 mb-1 text-[12px] leading-[18px] font-medium text-grey-500 text-center">
        Calculadora de gratificación · {result.periodLabel}
      </div>

      <div className="result-hero fade-up">
        <div className="label">Tu gratificación de {result.periodLabel} es:</div>
        <div className="amount">{formatMoney(result.total)}</div>
        <div className="period">{result.eps ? 'Régimen EPS' : 'Régimen EsSalud'}</div>
      </div>

      <div className="result-detail fade-up-2">
        <div className="result-row">
          <span className="label">Sueldo mensual</span>
          <span className="value">{formatMoney(result.sueldo)}</span>
        </div>
        <div className="result-row">
          <span className="label">Fecha de inicio</span>
          <span className="value">{formatDate(data?.fechaInicio)}</span>
        </div>
        <div className="result-row">
          <span className="label">Periodo</span>
          <span className="value">{result.periodLabel}</span>
        </div>
      </div>
    </>
  )
}

function LiqView({ result }) {
  return (
    <>
      <div className="mt-2 mb-1 text-[12px] leading-[18px] font-medium text-grey-500 text-center">
        Calculadora de liquidación de beneficios sociales
      </div>

      <div className="result-hero fade-up">
        <div className="label">Tu total de liquidación es:</div>
        <div className="amount">{formatMoney(result.total)}</div>
        <div className="period">Periodo: {result.periodoTexto}</div>
      </div>

      <div className="result-detail fade-up-2">
        <div className="result-row">
          <span className="label">Sueldo mensual</span>
          <span className="value">{formatMoney(result.sueldo)}</span>
        </div>
        <div className="result-row">
          <span className="label">Fecha de inicio</span>
          <span className="value">{formatDate(result.fechaInicio)}</span>
        </div>
        <div className="result-row">
          <span className="label">Fecha de cese</span>
          <span className="value">{formatDate(result.fechaFin)}</span>
        </div>
      </div>
    </>
  )
}

export default function Step3({ data, result, benefit, onBack, onDownload }) {
  const [showDetail, setShowDetail] = useState(false)
  const detailBtnLabel =
    benefit === 'liquidacion' ? 'Conocer mis beneficios truncos' : 'Ver detalle del cálculo'

  return (
    <div>
      <Header onBack={onBack} />
      <div className="content">
        <Stepper current={3} />

        {benefit === 'vacaciones' && <VacaView data={data} result={result} />}
        {benefit === 'gratificacion' && <GratiView data={data} result={result} />}
        {benefit === 'liquidacion' && <LiqView result={result} />}
        {(!benefit || benefit === 'cts') && <CtsView data={data} result={result} />}

        {/* Detail – Bottom Sheet trigger */}
        <div className="detail-card fade-up-3">
          <button
            className="detail-card-header"
            onClick={() => setShowDetail(true)}
            aria-haspopup="dialog"
          >
            <span>{detailBtnLabel}</span>
            <span className="detail-card-arrow">↗</span>
          </button>
        </div>

        {/* Bottom Sheet */}
        <DetailSheet
          open={showDetail}
          onClose={() => setShowDetail(false)}
          result={result}
          benefit={benefit}
        />

        {/* Actions */}
        <div className="flex gap-3 mt-2 fade-up-3">
          <button className="btn-primary flex-1 flex items-center justify-center gap-4 border-2" onClick={onDownload}>
            Descargar
          </button>
          <button className="btn-secondary flex-1 flex items-center justify-center gap-4 border-2">
            Compartir
          </button>
        </div>

        <div className="mt-4 px-4 py-3.5 text-[13px] leading-[19px] font-medium text-grey-500 text-center">
          ¿Quieres un documento más completo? Ingresa los datos del empleador/a y los tuyos.
        </div>
        <button className="btn-outline-only mt-2.5" onClick={onDownload}>
          Ingresar datos del empleador/a →
        </button>
      </div>
    </div>
  )
}
