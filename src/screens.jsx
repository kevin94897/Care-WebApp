import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header, FieldError } from './UI'
import { IconCheck, IconCalendar } from './Icons'

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Limpia el valor dejando sólo dígitos (para DNI/RUC).
const onlyDigits = (s) => (s || '').replace(/\D+/g, '')

// Devuelve true cuando el sentinel (pie del formulario) es visible
function useSticky() {
  const sentinelRef = useRef(null)
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsAtBottom(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { sentinelRef, isAtBottom }
}

// ─── Schemas Zod ──────────────────────────────────────────────────────────────
// RUC: exactamente 11 dígitos
const rucSchema = z
  .string()
  .min(1, 'Ingresa el RUC')
  .regex(/^\d{11}$/, 'El RUC debe tener exactamente 11 dígitos')

// DNI: exactamente 8 dígitos
const dniSchema = z
  .string()
  .min(1, 'Ingresa tu número de documento')
  .regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos')

// Documento por tipo (DNI estricto; CE/Pasaporte alfanumérico básico)
const numDocByTipo = (tipo) => {
  if (tipo === 'dni') return dniSchema
  if (tipo === 'ce' || tipo === 'pasaporte') {
    return z
      .string()
      .min(1, 'Ingresa tu número de documento')
      .max(20, 'Máximo 20 caracteres')
      .regex(/^[A-Za-z0-9]+$/, 'Sólo se permiten letras y números')
  }
  return z.string().min(1, 'Ingresa tu número de documento')
}

const employerSchema = z
  .object({
    razonSocial: z.string().min(1, 'Ingresa el nombre o razón social'),
    ruc: rucSchema,
    domicilio: z.string().min(1, 'Ingresa el domicilio'),
    tipoDoc: z.enum(['dni', 'ce', 'pasaporte'], {
      errorMap: () => ({ message: 'Selecciona un tipo de documento' }),
    }),
    numDoc: z.string().min(1, 'Ingresa el número de documento'),
  })
  .superRefine((val, ctx) => {
    const result = numDocByTipo(val.tipoDoc).safeParse(val.numDoc)
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['numDoc'],
        message: result.error.issues[0].message,
      })
    }
  })

const workerSchema = z
  .object({
    nombres: z.string().min(1, 'Ingresa tus nombres y apellidos'),
    tipoDoc: z.enum(['dni', 'ce', 'pasaporte'], {
      errorMap: () => ({ message: 'Selecciona un tipo de documento' }),
    }),
    numDoc: z.string().min(1, 'Ingresa el número de documento'),
    fechaNac: z.string().min(1, 'Ingresa tu fecha de nacimiento'),
    genero: z.enum(['f', 'm', 'otro'], {
      errorMap: () => ({ message: 'Selecciona tu género' }),
    }),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'Debes aceptar los Términos y Condiciones' }),
    }),
  })
  .superRefine((val, ctx) => {
    const result = numDocByTipo(val.tipoDoc).safeParse(val.numDoc)
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['numDoc'],
        message: result.error.issues[0].message,
      })
    }
  })

// ─── Loading Screen ───────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loader" />
      <div className="loading-text">Calculando tu CTS...</div>
    </div>
  )
}

// ─── Employer Form ────────────────────────────────────────────────────────────
export function EmployerForm({ onBack, onNext }) {
  const { sentinelRef, isAtBottom } = useSticky()
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employerSchema),
    mode: 'onChange',
    defaultValues: {
      razonSocial: '',
      ruc: '',
      domicilio: '',
      tipoDoc: '',
      numDoc: '',
    },
  })

  const tipoDoc = watch('tipoDoc')
  const numDoc = watch('numDoc') || ''
  const numDocMax = tipoDoc === 'dni' ? 8 : 20
  const isNumericDoc = tipoDoc === 'dni'

  const onValid = (data) => onNext(data)

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <Header onBack={onBack} />
      <div className="content">
        <p className="section-title fade-up">
          Datos del empleador/a{' '}
          <span className="optional-badge">Opcional</span>
        </p>
        <p className="section-sub fade-up">
          Completa estos datos para descargar un documento personalizado.
        </p>

        <div className="field fade-up">
          <label>Nombre o razón social</label>
          <input
            type="text"
            className={`input-base ${errors.razonSocial ? 'error' : ''}`}
            placeholder="Ingresa el nombre o razón social"
            {...register('razonSocial')}
          />
          <FieldError message={errors.razonSocial?.message} />
        </div>

        <div className="field fade-up-2">
          <label>RUC</label>
          <Controller
            name="ruc"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`input-base ${errors.ruc ? 'error' : ''}`}
                placeholder="Ingresa el RUC"
                maxLength={11}
                value={field.value}
                onChange={e => field.onChange(onlyDigits(e.target.value))}
                onPaste={e => {
                  e.preventDefault()
                  const text = e.clipboardData.getData('text')
                  field.onChange(onlyDigits(text).slice(0, 11))
                }}
              />
            )}
          />
          <FieldError message={errors.ruc?.message} />
        </div>

        <div className="field fade-up-2">
          <label>Domicilio</label>
          <input
            type="text"
            className={`input-base ${errors.domicilio ? 'error' : ''}`}
            placeholder="Ingresa el domicilio"
            {...register('domicilio')}
          />
          <FieldError message={errors.domicilio?.message} />
        </div>

        <div className="field fade-up-3">
          <label>Tipo de documento</label>
          <div className="relative">
            <select
              className={`input-base appearance-none pr-10 ${errors.tipoDoc ? 'error' : ''}`}
              {...register('tipoDoc')}
            >
              <option value="">Selecciona tipo de documento</option>
              <option value="dni">DNI</option>
              <option value="ce">Carné de Extranjería</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-grey-500">▾</span>
          </div>
          <FieldError message={errors.tipoDoc?.message} />
        </div>

        <div className="field fade-up-3">
          <label>Número de documento</label>
          <Controller
            name="numDoc"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                inputMode={isNumericDoc ? 'numeric' : 'text'}
                pattern={isNumericDoc ? '[0-9]*' : undefined}
                className={`input-base ${errors.numDoc ? 'error' : ''}`}
                placeholder="Digita el número de documento"
                maxLength={numDocMax}
                value={field.value}
                onChange={e => {
                  const v = isNumericDoc ? onlyDigits(e.target.value) : e.target.value
                  field.onChange(v.slice(0, numDocMax))
                }}
                onPaste={e => {
                  if (!isNumericDoc) return
                  e.preventDefault()
                  const text = e.clipboardData.getData('text')
                  field.onChange(onlyDigits(text).slice(0, numDocMax))
                }}
              />
            )}
          />
          <div className="flex justify-between mt-1">
            <FieldError message={errors.numDoc?.message} />
            <p className="text-[12px] leading-[18px] font-medium text-grey-500 text-right ml-auto">
              {numDoc.length}/{numDocMax}
            </p>
          </div>
        </div>
      </div>

      {/* Sentinel: cuando es visible el bottom-bar deja de flotar */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      <div className={isAtBottom ? 'bottom-bar bottom-bar--static' : 'bottom-bar'}>
        <button type="submit" className="btn-primary">Siguiente →</button>
        <button type="button" className="btn-secondary" onClick={() => onNext({})}>
          Saltar este paso
        </button>
      </div>
    </form>
  )
}

// ─── Worker Form ──────────────────────────────────────────────────────────────
export function WorkerForm({ onBack, onNext }) {
  const { sentinelRef, isAtBottom } = useSticky()
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(workerSchema),
    mode: 'onChange',
    defaultValues: {
      nombres: '',
      tipoDoc: '',
      numDoc: '',
      fechaNac: '',
      genero: '',
      terms: false,
    },
  })

  const tipoDoc = watch('tipoDoc')
  const isNumericDoc = tipoDoc === 'dni'
  const numDocMax = tipoDoc === 'dni' ? 8 : 20

  const onValid = (data) => onNext(data)

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <Header onBack={onBack} />
      <div className="content">
        <p className="section-title fade-up">Datos de la trabajadora/o del hogar</p>
        <p className="section-sub fade-up">
          Completa estos datos para descargar un documento personalizado. Son opcionales.
        </p>

        <div className="field fade-up">
          <label>Nombres y apellidos</label>
          <input
            type="text"
            className={`input-base ${errors.nombres ? 'error' : ''}`}
            placeholder="Ingresa tus nombres y apellidos"
            {...register('nombres')}
          />
          <FieldError message={errors.nombres?.message} />
        </div>

        <div className="field fade-up-2">
          <label>Tipo de documento</label>
          <div className="relative">
            <select
              className={`input-base appearance-none pr-10 ${errors.tipoDoc ? 'error' : ''}`}
              {...register('tipoDoc')}
            >
              <option value="">Selecciona tipo de documento</option>
              <option value="dni">DNI</option>
              <option value="ce">Carné de Extranjería</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-grey-500">▾</span>
          </div>
          <FieldError message={errors.tipoDoc?.message} />
        </div>

        <div className="field fade-up-2">
          <label>Número de documento</label>
          <Controller
            name="numDoc"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                inputMode={isNumericDoc ? 'numeric' : 'text'}
                pattern={isNumericDoc ? '[0-9]*' : undefined}
                className={`input-base ${errors.numDoc ? 'error' : ''}`}
                placeholder="Digita tu número de documento"
                maxLength={numDocMax}
                value={field.value}
                onChange={e => {
                  const v = isNumericDoc ? onlyDigits(e.target.value) : e.target.value
                  field.onChange(v.slice(0, numDocMax))
                }}
                onPaste={e => {
                  if (!isNumericDoc) return
                  e.preventDefault()
                  const text = e.clipboardData.getData('text')
                  field.onChange(onlyDigits(text).slice(0, numDocMax))
                }}
              />
            )}
          />
          <FieldError message={errors.numDoc?.message} />
        </div>

        <div className="field fade-up-2">
          <label>Fecha de nacimiento</label>
          <div className="relative">
            <input
              type="date"
              className={`input-base ${errors.fechaNac ? 'error' : ''}`}
              {...register('fechaNac')}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-brand opacity-60">
              <IconCalendar />
            </span>
          </div>
          <FieldError message={errors.fechaNac?.message} />
        </div>

        <div className="field fade-up-3">
          <label>Género</label>
          <div className="relative">
            <select
              className={`input-base appearance-none pr-10 ${errors.genero ? 'error' : ''}`}
              {...register('genero')}
            >
              <option value="">Selecciona tu género</option>
              <option value="f">Femenino</option>
              <option value="m">Masculino</option>
              <option value="otro">Prefiero no decir</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-grey-500">▾</span>
          </div>
          <FieldError message={errors.genero?.message} />
        </div>

        <div className="checkbox-row fade-up-3">
          <input type="checkbox" id="terms" {...register('terms')} />
          <label htmlFor="terms">He leído y acepto los Términos y Condiciones</label>
        </div>
        <FieldError message={errors.terms?.message} />
      </div>

      {/* Sentinel: cuando es visible el bottom-bar deja de flotar */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      <div className={isAtBottom ? 'bottom-bar bottom-bar--static' : 'bottom-bar'}>
        <button type="submit" className="btn-primary">Siguiente →</button>
        <button type="button" className="btn-secondary" onClick={() => onNext({})}>
          Saltar este paso
        </button>
      </div>
    </form>
  )
}

// ─── Download Screen ──────────────────────────────────────────────────────────
export function DownloadScreen({ onBack }) {
  return (
    <div>
      <Header onBack={onBack} />
      <div className="download-screen">
        <div className="check-circle">
          <IconCheck />
        </div>
        <div className="download-title">¡Tu documento está listo!</div>
        <div className="download-sub">
          Ya puedes descargar tu constancia de CTS con los datos que ingresaste.
        </div>

        <button
          className="btn-primary w-full"
          onClick={() => alert('Descargando documento...')}
        >
          Descargar documento
        </button>
        <button className="btn-secondary w-full">
          Compartir
        </button>
        <hr className="divider w-full" />
        <span className="back-results" onClick={onBack}>
          ← Volver a resultados
        </span>
      </div>
    </div>
  )
}
