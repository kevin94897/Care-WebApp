import { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Header, Stepper, DateInput, FieldError } from './UI'

// Periodos de Gratificación: Julio (Ene-Jun) y Diciembre (Jul-Dic).
// Cada uno trae sus 6 meses para la tabla de horas extra y el rango
// de fechas que se muestra en la pregunta de cesada / max de fecha inicio.
const PERIODS = {
  2026: [
    {
      id: 'julio2026',
      label: 'Julio 2026',
      months: ['01/2026', '02/2026', '03/2026', '04/2026', '05/2026', '06/2026'],
      rangeLabel: '(01/01/2026 - 30/06/2026)',
      maxDate: '2026-06-30',
    },
    {
      id: 'dic2026',
      label: 'Dic. 2026',
      months: ['07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026'],
      rangeLabel: '(01/07/2026 - 31/12/2026)',
      maxDate: '2026-12-31',
    },
  ],
  2025: [
    {
      id: 'julio2025',
      label: 'Julio 2025',
      months: ['01/2025', '02/2025', '03/2025', '04/2025', '05/2025', '06/2025'],
      rangeLabel: '(01/01/2025 - 30/06/2025)',
      maxDate: '2025-06-30',
    },
    {
      id: 'dic2025',
      label: 'Dic. 2025',
      months: ['07/2025', '08/2025', '09/2025', '10/2025', '11/2025', '12/2025'],
      rangeLabel: '(01/07/2025 - 31/12/2025)',
      maxDate: '2025-12-31',
    },
  ],
}

export default function Step2Grati({ onNext, onBack, savedData, onSave }) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: savedData || {
      year: '',
      period: '',
      fechaInicio: '',
      cesada: null,
      fechaCese: '',
      sueldo: '',
      eps: null,
      horasExtra: null,
      horasExtraData: {},
      hijos: null,
    },
  })

  const refs = {
    period: useRef(),
    fechaInicio: useRef(),
    cesada: useRef(),
    sueldo: useRef(),
    eps: useRef(),
    horas: useRef(),
    horasTable: useRef(),
    hijos: useRef(),
    bottom: useRef(),
  }

  const scrollTo = (ref) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
  }

  const watchYear = watch('year')
  const watchPeriod = watch('period')
  const watchFechaInicio = watch('fechaInicio')
  const watchCesada = watch('cesada')
  const watchSueldo = watch('sueldo')
  const watchEps = watch('eps')
  const watchHorasExtra = watch('horasExtra')
  const watchHijos = watch('hijos')
  const watchHorasExtraData = watch('horasExtraData')

  // Resuelvo el periodo seleccionado para sacar months/rangeLabel/maxDate
  const currentPeriods = PERIODS[watchYear] || PERIODS[2026]
  const selectedPeriod = currentPeriods.find(p => p.id === watchPeriod)
  const months = selectedPeriod?.months || []
  const rangeLabel = selectedPeriod?.rangeLabel || ''
  const periodMaxDate = selectedPeriod?.maxDate || '2026-12-31'

  // Si activó "Sí" en horas extra, todas las filas agregadas deben estar llenas
  const horasExtraValid =
    watchHorasExtra !== true ||
    Object.values(watchHorasExtraData || {}).every(
      v => v !== '' && v !== null && v !== undefined
    )

  const canNext =
    watchYear &&
    watchPeriod &&
    watchFechaInicio &&
    watchCesada !== null &&
    watchSueldo &&
    parseFloat(watchSueldo) > 0 &&
    watchEps !== null &&
    watchHorasExtra !== null &&
    horasExtraValid &&
    watchHijos !== null

  function onSubmit(data) {
    onSave(data)
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Header onBack={onBack} />
      <div className="px-5 pt-5 pb-28 overflow-y-auto lg:dt-shell lg:pb-0 lg:overflow-visible">
        <Stepper current={2} />
        <div className="h-4" />
        <div className="lg:max-w-2xl lg:mx-auto">

        {/* Reminder */}
        <div className="mb-5 text-[15px] leading-[22px] font-medium text-dark animate-fade-up">
          <span className="text-lila font-medium">Recordatorio:</span> Recuerda que la gratificacion la reciben todas las trabajadoras del hogar, independientemente de si laboran a tiempo completo o parcial. El requisito es haber trabajado un mes entero antes de la fecha de pago.
        </div>

        <div className="w-full h-px bg-grey-100 my-4" />

        {/* Año */}
        <div className="mb-4 animate-fade-up">
          <label className="block text-[15px] leading-[22px] font-medium text-dark mb-2">
            De que año deseas calcular tu gratificacion?
          </label>
          <div className="relative">
            <select
              {...register('year', { required: 'Selecciona un año' })}
              className={`input-base appearance-none pr-10 ${errors.year ? 'error' : ''}`}
              onChange={e => {
                setValue('year', e.target.value)
                setValue('period', '')
                scrollTo(refs.period)
              }}
            >
              <option value="">Selecciona un año</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-grey-500">▾</span>
          </div>
          <FieldError message={errors.year?.message} />
        </div>

        {/* Período */}
        <div ref={refs.period} className={`mb-4 animate-fade-up transition-opacity ${watchYear ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchYear ? 'text-grey-500' : 'text-dark'}`}>
            ¿Qué periodo quieres calcular?
          </label>
          <Controller
            name="period"
            control={control}
            rules={{ required: 'Selecciona un periodo' }}
            render={({ field }) => (
              <div className="flex gap-3">
                {currentPeriods.map(p => (
                  <div
                    key={p.id}
                    className={`period-card bg-grey-50 ${field.value === p.id ? 'active' : ''}`}
                    onClick={() => {
                      if (!watchYear) return
                      field.onChange(p.id)
                      scrollTo(refs.fechaInicio)
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center text-[11px] border-2 border-lila flex-shrink-0 ${
                        field.value === p.id
                          ? 'bg-white text-blue-brand border-white'
                          : 'border-current'
                      }`}
                    >
                      {field.value === p.id ? '✓' : ''}
                    </div>
                    {p.label}
                  </div>
                ))}
              </div>
            )}
          />
          <FieldError message={errors.period?.message} />
        </div>

        {/* Fecha inicio de trabajo */}
        <div ref={refs.fechaInicio} className={`mb-4 animate-fade-up transition-opacity ${watchPeriod ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchPeriod ? 'text-grey-500' : 'text-dark'}`}>
            Fecha de inicio de trabajo
          </label>
          <Controller
            name="fechaInicio"
            control={control}
            rules={{
              required: 'Ingresa la fecha de inicio',
              validate: v => v?.length === 10 || 'Ingresa una fecha válida',
            }}
            render={({ field }) => (
              <DateInput
                {...field}
                disabled={!watchPeriod}
                max={periodMaxDate}
                error={!!errors.fechaInicio}
                onChange={e => {
                  field.onChange(e)
                  if (e.target.value) scrollTo(refs.cesada)
                }}
              />
            )}
          />
          <FieldError message={errors.fechaInicio?.message} />
        </div>

        {/* Cesada */}
        <div ref={refs.cesada} className={`mb-4 animate-fade-up transition-opacity ${watchFechaInicio ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-1 ${!watchFechaInicio ? 'text-grey-500' : 'text-dark'}`}>
            ¿Dejaste de trabajar en estos meses por renuncia o despido?
          </label>
          <p className="text-[12px] leading-[18px] font-medium text-grey-500 mb-2">{rangeLabel}</p>
          <Controller
            name="cesada"
            control={control}
            rules={{ validate: v => v !== null || 'Selecciona una opción' }}
            render={({ field }) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`toggle-btn ${field.value === true ? 'active' : ''}`}
                  disabled={!watchFechaInicio}
                  onClick={() => {
                    field.onChange(true)
                    scrollTo(refs.sueldo)
                  }}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${field.value === false ? 'active' : ''}`}
                  disabled={!watchFechaInicio}
                  onClick={() => {
                    field.onChange(false)
                    setValue('fechaCese', '')
                    scrollTo(refs.sueldo)
                  }}
                >
                  No
                </button>
              </div>
            )}
          />
          <FieldError message={errors.cesada?.message} />
        </div>

        {/* Fecha cese */}
        {watchCesada === true && (
          <div className="mb-4 animate-fade-up">
            <label className="block text-[15px] leading-[22px] font-medium text-dark mb-2">Indícanos la fecha de cese</label>
            <Controller
              name="fechaCese"
              control={control}
              rules={{
                required: 'Ingresa la fecha de cese',
                validate: v =>
                  v?.length !== 10
                    ? 'Ingresa una fecha válida'
                    : !watchFechaInicio || v >= watchFechaInicio || 'La fecha de cese debe ser posterior a la de inicio',
              }}
              render={({ field }) => (
                <DateInput
                  {...field}
                  min={watchFechaInicio}
                  max={periodMaxDate}
                  error={!!errors.fechaCese}
                  onChange={e => {
                    field.onChange(e)
                    if (e.target.value) scrollTo(refs.sueldo)
                  }}
                />
              )}
            />
            <FieldError message={errors.fechaCese?.message} />
          </div>
        )}

        {/* Sueldo */}
        <div ref={refs.sueldo} className={`mb-4 animate-fade-up transition-opacity ${watchCesada !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchCesada === null ? 'text-grey-500' : 'text-dark'}`}>
            ¿Cuánto es tu sueldo mensual?
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] leading-[22px] font-medium text-grey-500">s/.</span>
            <input
              type="number"
              disabled={watchCesada === null}
              placeholder="0.00"
              min="0"
              className={`input-base pl-12 ${errors.sueldo ? 'error' : ''}`}
              {...register('sueldo', {
                required: 'Ingresa un sueldo válido',
                validate: v => parseFloat(v) > 0 || 'El sueldo debe ser mayor a 0',
                onChange: e => {
                  if (parseFloat(e.target.value) > 0) scrollTo(refs.eps)
                },
              })}
            />
          </div>
          <FieldError message={errors.sueldo?.message} />
        </div>

        {/* EPS — exclusivo de Gratificación */}
        <div ref={refs.eps} className={`mb-4 animate-fade-up transition-opacity ${watchSueldo && parseFloat(watchSueldo) > 0 ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchSueldo ? 'text-grey-500' : 'text-dark'}`}>
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
                  disabled={!watchSueldo || parseFloat(watchSueldo) <= 0}
                  onClick={() => {
                    field.onChange(true)
                    scrollTo(refs.horas)
                  }}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${field.value === false ? 'active' : ''}`}
                  disabled={!watchSueldo || parseFloat(watchSueldo) <= 0}
                  onClick={() => {
                    field.onChange(false)
                    scrollTo(refs.horas)
                  }}
                >
                  No
                </button>
              </div>
            )}
          />
          <FieldError message={errors.eps?.message} />
        </div>

        {/* Horas extra */}
        <div ref={refs.horas} className={`mb-4 animate-fade-up transition-opacity ${watchEps !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchEps === null ? 'text-grey-500' : 'text-dark'}`}>
            ¿Te han pagado horas extra en los últimos 6 meses?
          </label>
          <Controller
            name="horasExtra"
            control={control}
            rules={{ validate: v => v !== null || 'Selecciona una opción' }}
            render={({ field }) => (
              <>
                <div className={`flex gap-3 ${field.value === true ? 'mb-3' : ''}`}>
                  <button
                    type="button"
                    className={`toggle-btn ${field.value === true ? 'active' : ''}`}
                    disabled={watchEps === null}
                    onClick={() => {
                      field.onChange(true)
                      setValue('horasExtraData', {})
                      scrollTo(refs.horasTable)
                    }}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${field.value === false ? 'active' : ''}`}
                    disabled={watchEps === null}
                    onClick={() => {
                      field.onChange(false)
                      setValue('horasExtraData', {})
                      scrollTo(refs.hijos)
                    }}
                  >
                    No
                  </button>
                </div>

                {field.value === true && (
                  <div ref={refs.horasTable} className="border border-grey-100 rounded-ds-sm overflow-hidden animate-fade-up">
                    <div className="bg-lila px-4 py-4 flex justify-between">
                      <span className="text-white text-[15px]">Período</span>
                      <span className="text-white text-[15px]">Pago (S/.)</span>
                    </div>
                    {months.map(m => {
                      const hasInput =
                        watchHorasExtraData != null && m in watchHorasExtraData
                      return (
                        <div key={m} className="flex items-center justify-between px-4 py-3 border-b border-grey-100 last:border-b-0 odd:bg-grey-100">
                          <span className="text-[15px] leading-[22px] font-medium text-dark">{m}</span>
                          {hasInput ? (
                            <div className="flex items-center gap-2">
                              <Controller
                                name={`horasExtraData.${m}`}
                                control={control}
                                defaultValue=""
                                render={({ field: hf }) => (
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    autoFocus
                                    className="w-24 px-2.5 py-1.5 border border-blue-200 rounded-ds-sm text-[15px] leading-[22px] font-medium text-right outline-none focus:border-2 focus:border-lila"
                                    value={hf.value}
                                    onChange={hf.onChange}
                                  />
                                )}
                              />
                              <button
                                type="button"
                                aria-label={`Quitar pago de ${m}`}
                                onClick={() => {
                                  const next = { ...watchHorasExtraData }
                                  delete next[m]
                                  setValue('horasExtraData', next, { shouldValidate: true })
                                }}
                                className="w-6 h-6 flex items-center justify-center rounded-ds-pill text-grey-500 hover:text-dark hover:bg-grey-100 bg-transparent border-none cursor-pointer transition-colors"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setValue(`horasExtraData.${m}`, '', { shouldValidate: true })}
                              className="text-[15px] leading-[22px] font-medium text-grey-300 bg-transparent border-none cursor-pointer px-2 py-1"
                            >
                              Agregar
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          />
          <FieldError message={errors.horasExtra?.message} />
        </div>

        {/* Hijos */}
        <div ref={refs.hijos} className={`mb-4 animate-fade-up transition-opacity ${watchHorasExtra !== null ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${watchHorasExtra === null ? 'text-grey-500' : 'text-dark'}`}>
            ¿Tienes hijos/as menores de 18 años o mayores cursando estudios superiores?
          </label>
          <Controller
            name="hijos"
            control={control}
            rules={{ validate: v => v !== null || 'Selecciona una opción' }}
            render={({ field }) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`toggle-btn ${field.value === true ? 'active' : ''}`}
                  disabled={watchHorasExtra === null}
                  onClick={() => {
                    field.onChange(true)
                    scrollTo(refs.bottom)
                  }}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${field.value === false ? 'active' : ''}`}
                  disabled={watchHorasExtra === null}
                  onClick={() => {
                    field.onChange(false)
                    scrollTo(refs.bottom)
                  }}
                >
                  No
                </button>
              </div>
            )}
          />
          <FieldError message={errors.hijos?.message} />
        </div>

        {/* Sentinel: scroll target tras completar el formulario */}
        <div ref={refs.bottom} className="h-1" />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-5 py-4 z-20 lg:static lg:translate-x-0 lg:max-w-2xl lg:mx-auto lg:px-0 lg:py-8 lg:bg-transparent lg:flex lg:justify-end">
        <button type="submit" className="btn-primary lg:w-auto lg:min-w-[240px]" disabled={!canNext}>
          Siguiente →
        </button>
      </div>
    </form>
  )
}
