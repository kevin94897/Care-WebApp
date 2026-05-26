import { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Header, Stepper, DateInput, FieldError, useSticky, bottomBarCls } from './UI'

const DIAS_MAX = 3

// Opciones para las 3 preguntas opcionales de "Te pagaron X en estos periodos"
const CTS_PERIODOS = [
  { id: 'mayo2026', label: 'Mayo 2026' },
  { id: 'nov2026',  label: 'Nov. 2026' },
]
const GRATI_PERIODOS = [
  { id: 'julio2026', label: 'Julio 2026' },
  { id: 'dic2026',   label: 'Dic. 2026' },
]
const VACA_ANIOS = [
  { id: 'a2026', label: 'Año 2026' },
  { id: 'a2025', label: 'Año 2025' },
]

// Mini-componente: tarjeta tipo period-card pero con selección múltiple (array)
function CheckCard({ id, label, value, onChange }) {
  const checked = value.includes(id)
  return (
    <div
      className={`period-card bg-grey-50 ${checked ? 'active' : ''}`}
      onClick={() => onChange(checked ? value.filter(x => x !== id) : [...value, id])}
    >
      <div
        className={`w-4 h-4 rounded flex items-center justify-center text-[11px] border-2 border-lila flex-shrink-0 ${
          checked ? 'bg-white text-blue-brand border-white' : 'border-current'
        }`}
      >
        {checked ? '✓' : ''}
      </div>
      {label}
    </div>
  )
}

export default function Step2Liq({ onNext, onBack, savedData, onSave }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: savedData || {
      fechaInicioTrabajo: '',
      sueldo: '',
      fechaFinTrabajo: '',
      yaSalido: null,
      diasSalido: '',
      trabaja4Horas: null,
      eps: null,
      ctsPagados: [],
      gratiPagados: [],
      vacacionesPagadas: [],
    },
  })

  const refs = {
    sueldo: useRef(),
    fechaFin: useRef(),
    yaSalido: useRef(),
    dias: useRef(),
    trabaja4: useRef(),
    eps: useRef(),
    optionals: useRef(),
    bottom: useRef(),
  }

  const { sentinelRef, isAtBottom } = useSticky()

  const scrollTo = (ref) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
  }

  const watchInicio = watch('fechaInicioTrabajo')
  const watchSueldo = watch('sueldo')
  const watchFin = watch('fechaFinTrabajo')
  const watchYaSalido = watch('yaSalido')
  const watchDias = watch('diasSalido')
  const watchTrabaja4 = watch('trabaja4Horas')
  const watchEps = watch('eps')

  const diasValid =
    watchYaSalido !== true ||
    (watchDias !== '' && watchDias !== null && !isNaN(parseInt(watchDias, 10)))

  const canNext =
    watchInicio &&
    watchSueldo &&
    parseFloat(watchSueldo) > 0 &&
    watchFin &&
    watchYaSalido !== null &&
    diasValid &&
    watchTrabaja4 !== null &&
    watchEps !== null

  function onSubmit(data) {
    onSave(data)
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Header onBack={onBack} />
      <div className="px-5 pt-5 pb-12 overflow-y-auto lg:dt-shell lg:pb-0 lg:overflow-visible">
        <Stepper current={2} />
        <div className="h-4" />
        <div className="lg:max-w-2xl lg:mx-auto">

        {/* Reminder */}
        <div className="mb-5 text-[15px] leading-[22px] font-medium text-dark animate-fade-up">
          <span className="text-lila font-medium">Recordatorio:</span> En esta sección vas a poder calcular los beneficios que te deben al culminar tu relación laboral con tu jefe/a, las vacaciones que te deben, las gratificaciones y CTS. Ten en cuenta que estos montos pueden variar dependiendo de lo que te hayan pagado antes.
        </div>

        <div className="w-full h-px bg-grey-100 my-4" />

        {/* Fecha inicio de trabajo */}
        <div className="mb-4 animate-fade-up">
          <label className="block text-[15px] leading-[22px] font-medium text-dark mb-2">
            Fecha de inicio de trabajo
          </label>
          <Controller
            name="fechaInicioTrabajo"
            control={control}
            rules={{
              required: 'Ingresa la fecha de inicio',
              validate: v => v?.length === 10 || 'Ingresa una fecha válida',
            }}
            render={({ field }) => (
              <DateInput
                {...field}
                error={!!errors.fechaInicioTrabajo}
                onChange={e => {
                  field.onChange(e)
                  if (e.target.value) scrollTo(refs.sueldo)
                }}
              />
            )}
          />
          <FieldError message={errors.fechaInicioTrabajo?.message} />
        </div>

        {/* Sueldo */}
        <div ref={refs.sueldo} className={`mb-4 animate-fade-up transition-opacity ${watchInicio ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchInicio ? 'text-grey-500' : 'text-dark'}`}>
            ¿Cuánto es tu sueldo mensual?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] leading-[22px] font-medium text-grey-500">s/.</span>
            <input
              type="number"
              disabled={!watchInicio}
              placeholder="0.00"
              min="0"
              className={`input-base pl-12 ${errors.sueldo ? 'error' : ''}`}
              {...register('sueldo', {
                required: 'Ingresa un sueldo válido',
                validate: v => parseFloat(v) > 0 || 'El sueldo debe ser mayor a 0',
                onChange: e => {
                  if (parseFloat(e.target.value) > 0) scrollTo(refs.fechaFin)
                },
              })}
            />
          </div>
          <FieldError message={errors.sueldo?.message} />
        </div>

        {/* Fecha fin de trabajo */}
        <div ref={refs.fechaFin} className={`mb-4 animate-fade-up transition-opacity ${watchSueldo && parseFloat(watchSueldo) > 0 ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchSueldo ? 'text-grey-500' : 'text-dark'}`}>
            Fecha de fin de trabajo
          </label>
          <Controller
            name="fechaFinTrabajo"
            control={control}
            rules={{
              required: 'Ingresa la fecha de fin',
              validate: v =>
                v?.length !== 10
                  ? 'Ingresa una fecha válida'
                  : !watchInicio || v >= watchInicio || 'La fecha de fin debe ser posterior a la de inicio',
            }}
            render={({ field }) => (
              <DateInput
                {...field}
                disabled={!watchSueldo || parseFloat(watchSueldo) <= 0}
                min={watchInicio}
                error={!!errors.fechaFinTrabajo}
                onChange={e => {
                  field.onChange(e)
                  if (e.target.value) scrollTo(refs.yaSalido)
                }}
              />
            )}
          />
          <FieldError message={errors.fechaFinTrabajo?.message} />
        </div>

        {/* ¿Ya saliste de vacaciones? */}
        <div ref={refs.yaSalido} className={`mb-4 animate-fade-up transition-opacity ${watchFin ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchFin ? 'text-grey-500' : 'text-dark'}`}>
            ¿Ya saliste de vacaciones?
          </label>
          <Controller
            name="yaSalido"
            control={control}
            rules={{ validate: v => v !== null || 'Selecciona una opción' }}
            render={({ field }) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`toggle-btn ${field.value === true ? 'active' : ''}`}
                  disabled={!watchFin}
                  onClick={() => {
                    field.onChange(true)
                    scrollTo(refs.dias)
                  }}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${field.value === false ? 'active' : ''}`}
                  disabled={!watchFin}
                  onClick={() => {
                    field.onChange(false)
                    setValue('diasSalido', '')
                    scrollTo(refs.trabaja4)
                  }}
                >
                  No
                </button>
              </div>
            )}
          />
          <FieldError message={errors.yaSalido?.message} />
        </div>

        {/* Días salido — solo si Sí */}
        {watchYaSalido === true && (
          <div ref={refs.dias} className="mb-4 animate-fade-up">
            <label className="block text-[15px] leading-[22px] font-medium text-dark mb-2">
              ¿Cuántos días has salido de vacaciones?
            </label>
            <Controller
              name="diasSalido"
              control={control}
              rules={{
                required: 'Ingresa los días',
                validate: v => parseInt(v, 10) >= 0 || 'Debe ser un número válido',
              }}
              render={({ field }) => (
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  min="0"
                  maxLength={DIAS_MAX}
                  className={`input-base ${errors.diasSalido ? 'error' : ''}`}
                  value={field.value}
                  onChange={e => {
                    const v = e.target.value.replace(/\D+/g, '').slice(0, DIAS_MAX)
                    field.onChange(v)
                    if (v) scrollTo(refs.trabaja4)
                  }}
                />
              )}
            />
            <div className="flex justify-between mt-1">
              <FieldError message={errors.diasSalido?.message} />
              <p className="text-[12px] leading-[18px] font-medium text-grey-500 text-right ml-auto">
                {(watchDias || '').length}/{DIAS_MAX}
              </p>
            </div>
          </div>
        )}

        {/* ¿Trabajas 4 horas o más diarias? */}
        <div ref={refs.trabaja4} className={`mb-4 animate-fade-up transition-opacity ${watchYaSalido !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchYaSalido === null ? 'text-grey-500' : 'text-dark'}`}>
            ¿Trabajas 4 horas o más diarias?
          </label>
          <Controller
            name="trabaja4Horas"
            control={control}
            rules={{ validate: v => v !== null || 'Selecciona una opción' }}
            render={({ field }) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`toggle-btn ${field.value === true ? 'active' : ''}`}
                  disabled={watchYaSalido === null}
                  onClick={() => {
                    field.onChange(true)
                    scrollTo(refs.eps)
                  }}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${field.value === false ? 'active' : ''}`}
                  disabled={watchYaSalido === null}
                  onClick={() => {
                    field.onChange(false)
                    scrollTo(refs.eps)
                  }}
                >
                  No
                </button>
              </div>
            )}
          />
          <FieldError message={errors.trabaja4Horas?.message} />
        </div>

        {/* EPS */}
        <div ref={refs.eps} className={`mb-4 animate-fade-up transition-opacity ${watchTrabaja4 !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchTrabaja4 === null ? 'text-grey-500' : 'text-dark'}`}>
            El empleador te asigno una EPS aparte de EsSalud? (Rímac, Mapfre, La Positiva, Sanitas, Pacífico, etc...)
          </label>
          <Controller
            name="eps"
            control={control}
            rules={{ validate: v => v !== null || 'Selecciona una opción' }}
            render={({ field }) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`toggle-btn ${field.value === true ? 'active' : ''}`}
                  disabled={watchTrabaja4 === null}
                  onClick={() => {
                    field.onChange(true)
                    scrollTo(refs.optionals)
                  }}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${field.value === false ? 'active' : ''}`}
                  disabled={watchTrabaja4 === null}
                  onClick={() => {
                    field.onChange(false)
                    scrollTo(refs.optionals)
                  }}
                >
                  No
                </button>
              </div>
            )}
          />
          <FieldError message={errors.eps?.message} />
        </div>

        <div ref={refs.optionals} />

        {/* ¿Te pagaron CTS? (Opcional) */}
        <div className={`mb-4 animate-fade-up transition-opacity ${watchEps !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchEps === null ? 'text-grey-500' : 'text-dark'}`}>
            ¿Te pagaron CTS en los siguientes periodos? <span className="text-grey-300 font-medium">(Opcional)</span>
          </label>
          <Controller
            name="ctsPagados"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                {CTS_PERIODOS.map(p => (
                  <CheckCard key={p.id} id={p.id} label={p.label} value={field.value || []} onChange={field.onChange} />
                ))}
              </div>
            )}
          />
        </div>

        {/* ¿Te pagaron gratificaciones? (Opcional) */}
        <div className={`mb-4 animate-fade-up transition-opacity ${watchEps !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchEps === null ? 'text-grey-500' : 'text-dark'}`}>
            ¿Te pagaron gratificaciones en los siguientes periodos? <span className="text-grey-300 font-medium">(Opcional)</span>
          </label>
          <Controller
            name="gratiPagados"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                {GRATI_PERIODOS.map(p => (
                  <CheckCard key={p.id} id={p.id} label={p.label} value={field.value || []} onChange={field.onChange} />
                ))}
              </div>
            )}
          />
        </div>

        {/* ¿Te pagaron vacaciones? (Opcional) */}
        <div className={`mb-4 animate-fade-up transition-opacity ${watchEps !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchEps === null ? 'text-grey-500' : 'text-dark'}`}>
            ¿Te pagaron vacaciones en los siguientes años? <span className="text-grey-300 font-medium">(Opcional)</span>
          </label>
          <Controller
            name="vacacionesPagadas"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                {VACA_ANIOS.map(a => (
                  <CheckCard key={a.id} id={a.id} label={a.label} value={field.value || []} onChange={field.onChange} />
                ))}
              </div>
            )}
          />
        </div>

        <div ref={refs.bottom} className="h-1" />
        </div>
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />

      <div className={bottomBarCls(isAtBottom)}>
        <button type="submit" className="btn-primary lg:w-auto lg:min-w-[240px]" disabled={!canNext}>
          Siguiente
        </button>
      </div>
    </form>
  )
}
