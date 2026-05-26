import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header, FieldError, DateInput, useSticky } from './UI'
import { IconCheck, IconCalendar } from './Icons'

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Limpia el valor dejando sólo dígitos (para DNI/RUC).
const onlyDigits = (s) => (s || '').replace(/\D+/g, '')

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
    fechaNac: z
      .string()
      .min(1, 'Ingresa tu fecha de nacimiento')
      .refine(v => v.length === 10, 'Ingresa una fecha válida')
      .refine(v => new Date(v) <= new Date(), 'La fecha de nacimiento no puede ser futura'),
    genero: z.enum(['f', 'm', 'otro'], {
      errorMap: () => ({ message: 'Selecciona tu género' }),
    }),
    terms: z.boolean().refine(val => val === true, {
      message: 'Marca la casilla de términos para continuar.'
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
    formState: { errors, isValid },
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

  const watchRazonSocial = watch('razonSocial') || ''
  const watchRuc = watch('ruc') || ''
  const watchDomicilio = watch('domicilio') || ''
  const tipoDoc = watch('tipoDoc')
  const numDoc = watch('numDoc') || ''
  const numDocMax = tipoDoc === 'dni' ? 8 : 20
  const isNumericDoc = tipoDoc === 'dni'

  const rucComplete = watchRuc.length === 11
  const razonSocialComplete = watchRazonSocial.trim().length > 0
  const domicilioComplete = watchDomicilio.trim().length > 0
  const tipoDocComplete = !!tipoDoc

  const refs = {
    ruc: useRef(),
    domicilio: useRef(),
    tipoDoc: useRef(),
    numDoc: useRef(),
    bottom: useRef(),
  }

  const scrollTo = (ref) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
  }

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
Para continuar, necesitamos algunos datos del empleador. Si los conoces, completa los campos.<br/><span className="text-lila font-semibold">Si no tienes la información, puedes saltar este paso.</span></p>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-6">
        <div className="field fade-up lg:col-span-2">
          <label>Nombre o razón social</label>
          <input
            type="text"
            className={`input-base ${errors.razonSocial ? 'error' : ''}`}
            placeholder="Ingresa el nombre o razón social"
            {...register('razonSocial', {
              onBlur: e => {
                if (e.target.value.trim()) scrollTo(refs.ruc)
              },
            })}
          />
          <FieldError message={errors.razonSocial?.message} />
        </div>

        <div ref={refs.ruc} className={`field fade-up-2 transition-opacity ${razonSocialComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!razonSocialComplete ? 'text-grey-500' : ''}>RUC</label>
          <Controller
            name="ruc"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={!razonSocialComplete}
                className={`input-base ${errors.ruc ? 'error' : ''}`}
                placeholder="Ingresa el RUC"
                maxLength={11}
                value={field.value}
                onChange={e => {
                  const v = onlyDigits(e.target.value)
                  field.onChange(v)
                  if (v.length === 11) scrollTo(refs.domicilio)
                }}
                onPaste={e => {
                  e.preventDefault()
                  const text = e.clipboardData.getData('text')
                  const v = onlyDigits(text).slice(0, 11)
                  field.onChange(v)
                  if (v.length === 11) scrollTo(refs.domicilio)
                }}
              />
            )}
          />
          <FieldError message={errors.ruc?.message} />
        </div>

        <div ref={refs.domicilio} className={`field fade-up-2 lg:col-span-2 transition-opacity ${rucComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!rucComplete ? 'text-grey-500' : ''}>Domicilio</label>
          <input
            type="text"
            disabled={!rucComplete}
            className={`input-base ${errors.domicilio ? 'error' : ''}`}
            placeholder="Ingresa el domicilio"
            {...register('domicilio', {
              onBlur: e => {
                if (e.target.value.trim()) scrollTo(refs.tipoDoc)
              },
            })}
          />
          <FieldError message={errors.domicilio?.message} />
        </div>

        <div ref={refs.tipoDoc} className={`field fade-up-3 transition-opacity ${domicilioComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!domicilioComplete ? 'text-grey-500' : ''}>Tipo de documento</label>
          <div className="relative">
            <select
              disabled={!domicilioComplete}
              className={`input-base appearance-none pr-10 ${errors.tipoDoc ? 'error' : ''}`}
              {...register('tipoDoc', {
                onChange: e => {
                  if (e.target.value) scrollTo(refs.numDoc)
                },
              })}
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

        <div ref={refs.numDoc} className={`field fade-up-3 transition-opacity ${tipoDocComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!tipoDocComplete ? 'text-grey-500' : ''}>Número de documento</label>
          <Controller
            name="numDoc"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                inputMode={isNumericDoc ? 'numeric' : 'text'}
                pattern={isNumericDoc ? '[0-9]*' : undefined}
                disabled={!tipoDocComplete}
                className={`input-base ${errors.numDoc ? 'error' : ''}`}
                placeholder="Digita el número de documento"
                maxLength={numDocMax}
                value={field.value}
                onChange={e => {
                  const v = isNumericDoc ? onlyDigits(e.target.value) : e.target.value
                  const trimmed = v.slice(0, numDocMax)
                  field.onChange(trimmed)
                  if (trimmed.length === numDocMax) scrollTo(refs.bottom)
                }}
                onPaste={e => {
                  if (!isNumericDoc) return
                  e.preventDefault()
                  const text = e.clipboardData.getData('text')
                  const v = onlyDigits(text).slice(0, numDocMax)
                  field.onChange(v)
                  if (v.length === numDocMax) scrollTo(refs.bottom)
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

        <div ref={refs.bottom} className="h-1" />
      </div>

      {/* Sentinel: cuando es visible el bottom-bar deja de flotar */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      <div className={isAtBottom ? 'bottom-bar bottom-bar--static' : 'bottom-bar'}>
        <button type="submit" className="btn-primary" disabled={!isValid}>Siguiente →</button>
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
    trigger,
    formState: { errors, isValid },
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

  const watchNombres = watch('nombres') || ''
  const tipoDoc = watch('tipoDoc')
  const watchNumDoc = watch('numDoc') || ''
  const watchFechaNac = watch('fechaNac') || ''
  const watchGenero = watch('genero')
  const isNumericDoc = tipoDoc === 'dni'
  const numDocMax = tipoDoc === 'dni' ? 8 : 20

  const nombresComplete = watchNombres.trim().length > 0
  const tipoDocComplete = !!tipoDoc
  const numDocComplete = watchNumDoc.length === numDocMax
  const fechaNacComplete = watchFechaNac.length === 10
  const generoComplete = !!watchGenero

  const refs = {
    tipoDoc: useRef(),
    numDoc: useRef(),
    fechaNac: useRef(),
    genero: useRef(),
    terms: useRef(),
    bottom: useRef(),
  }

  const scrollTo = (ref) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
  }

  const onValid = (data) => onNext(data)

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate>
      <Header onBack={onBack} />
      <div className="content">
        <p className="section-title fade-up">Datos de la trabajadora/o del hogar</p>
        <p className="section-sub fade-up">
          Completa estos datos para descargar un documento personalizado. <br /><span className="text-lila font-semibold">Son opcionales.</span>
        </p>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-6">
        <div className="field fade-up lg:col-span-2">
          <label>Nombres y apellidos</label>
          <input
            type="text"
            className={`input-base ${errors.nombres ? 'error' : ''}`}
            placeholder="Ingresa tus nombres y apellidos"
            {...register('nombres', {
              onBlur: e => {
                if (e.target.value.trim()) scrollTo(refs.tipoDoc)
              },
            })}
          />
          <FieldError message={errors.nombres?.message} />
        </div>

        <div ref={refs.tipoDoc} className={`field fade-up-2 transition-opacity ${nombresComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!nombresComplete ? 'text-grey-500' : ''}>Tipo de documento</label>
          <div className="relative">
            <select
              disabled={!nombresComplete}
              className={`input-base appearance-none pr-10 ${errors.tipoDoc ? 'error' : ''}`}
              {...register('tipoDoc', {
                onChange: e => {
                  if (e.target.value) scrollTo(refs.numDoc)
                },
              })}
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

        <div ref={refs.numDoc} className={`field fade-up-2 transition-opacity ${tipoDocComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!tipoDocComplete ? 'text-grey-500' : ''}>Número de documento</label>
          <Controller
            name="numDoc"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                inputMode={isNumericDoc ? 'numeric' : 'text'}
                pattern={isNumericDoc ? '[0-9]*' : undefined}
                disabled={!tipoDocComplete}
                className={`input-base ${errors.numDoc ? 'error' : ''}`}
                placeholder="Digita tu número de documento"
                maxLength={numDocMax}
                value={field.value}
                onChange={e => {
                  const v = isNumericDoc ? onlyDigits(e.target.value) : e.target.value
                  const trimmed = v.slice(0, numDocMax)
                  field.onChange(trimmed)
                  if (trimmed.length === numDocMax) scrollTo(refs.fechaNac)
                }}
                onPaste={e => {
                  if (!isNumericDoc) return
                  e.preventDefault()
                  const text = e.clipboardData.getData('text')
                  const v = onlyDigits(text).slice(0, numDocMax)
                  field.onChange(v)
                  if (v.length === numDocMax) scrollTo(refs.fechaNac)
                }}
              />
            )}
          />
          <FieldError message={errors.numDoc?.message} />
        </div>

        <div ref={refs.fechaNac} className={`field fade-up-2 transition-opacity ${numDocComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!numDocComplete ? 'text-grey-500' : ''}>Fecha de nacimiento</label>
          <DateInput
            error={!!errors.fechaNac}
            disabled={!numDocComplete}
            {...register('fechaNac', {
              onChange: e => {
                if (e.target.value?.length === 10) scrollTo(refs.genero)
              },
            })}
          />
          <FieldError message={errors.fechaNac?.message} />
        </div>

        <div ref={refs.genero} className={`field fade-up-3 transition-opacity ${fechaNacComplete ? 'opacity-100' : 'opacity-40'}`}>
          <label className={!fechaNacComplete ? 'text-grey-500' : ''}>Género</label>
          <div className="relative">
            <select
              disabled={!fechaNacComplete}
              className={`input-base appearance-none pr-10 ${errors.genero ? 'error' : ''}`}
              {...register('genero', {
                onChange: e => {
                  if (e.target.value) scrollTo(refs.terms)
                },
              })}
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

        <div ref={refs.terms} className="fade-up-3 lg:col-span-2">
          <div className="checkbox-row">
            <input
              type="checkbox"
              id="terms"
              {...register('terms', {
                onChange: e => {
                  if (e.target.checked) scrollTo(refs.bottom)
                },
              })}
            />
            <label htmlFor="terms">He leído y acepto los Términos y Condiciones</label>
          </div>
          <FieldError message={errors.terms?.message} />
        </div>
        </div>

        <div ref={refs.bottom} className="h-1" />
      </div>

      {/* Sentinel: cuando es visible el bottom-bar deja de flotar */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      <div className={isAtBottom ? 'bottom-bar bottom-bar--static' : 'bottom-bar'}>
        <button type="submit" className="btn-primary" disabled={!isValid}>Siguiente →</button>
        <button type="button" className="btn-secondary" onClick={async () => {
          const termsOk = await trigger('terms')
          if (termsOk) {
            onNext({})
          } else {
            scrollTo(refs.terms)
          }
        }}>
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
