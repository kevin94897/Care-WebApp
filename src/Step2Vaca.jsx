import { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Header, Stepper, DateInput, FieldError } from './UI'

const DIAS_MAX = 3 // dígitos máximos en "¿Cuántos días has salido de vacaciones?"

export default function Step2Vaca({ onNext, onBack, savedData, onSave }) {
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
      fechaFinTrabajo: '',
      sueldo: '',
      yaSalido: null,
      diasSalido: '',
      trabaja4Horas: null,
    },
  })

  const refs = {
    fechaFin: useRef(),
    sueldo: useRef(),
    yaSalido: useRef(),
    dias: useRef(),
    trabaja4: useRef(),
    bottom: useRef(),
  }

  const scrollTo = (ref) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
  }

  const watchInicio = watch('fechaInicioTrabajo')
  const watchFin = watch('fechaFinTrabajo')
  const watchSueldo = watch('sueldo')
  const watchYaSalido = watch('yaSalido')
  const watchDias = watch('diasSalido')
  const watchTrabaja4 = watch('trabaja4Horas')

  // Si dijo "Sí" en yaSalido, los días deben tener un valor numérico válido (>= 0)
  const diasValid =
    watchYaSalido !== true ||
    (watchDias !== '' && watchDias !== null && !isNaN(parseInt(watchDias, 10)))

  const canNext =
    watchInicio &&
    watchFin &&
    watchSueldo &&
    parseFloat(watchSueldo) > 0 &&
    watchYaSalido !== null &&
    diasValid &&
    watchTrabaja4 !== null

  function onSubmit(data) {
    onSave(data)
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Header onBack={onBack} />
      <div className="px-5 pt-5 pb-28 overflow-y-auto">
        <Stepper current={2} />
        <div className="h-4" />

        {/* Reminder */}
        <div className="mb-5 text-[15px] leading-[22px] font-medium text-dark animate-fade-up">
          <span className="text-lila font-medium">Recordatorio:</span> Para gozar del descanso vacacional debes haber trabajado por lo menos un año completo para tu empleador/a.
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
                  if (e.target.value) scrollTo(refs.fechaFin)
                }}
              />
            )}
          />
          <FieldError message={errors.fechaInicioTrabajo?.message} />
        </div>

        {/* Fecha fin de trabajo */}
        <div ref={refs.fechaFin} className={`mb-4 animate-fade-up transition-opacity ${watchInicio ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchInicio ? 'text-grey-500' : 'text-dark'}`}>
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
                disabled={!watchInicio}
                min={watchInicio}
                error={!!errors.fechaFinTrabajo}
                onChange={e => {
                  field.onChange(e)
                  if (e.target.value) scrollTo(refs.sueldo)
                }}
              />
            )}
          />
          <FieldError message={errors.fechaFinTrabajo?.message} />
        </div>

        {/* Sueldo */}
        <div ref={refs.sueldo} className={`mb-4 animate-fade-up transition-opacity ${watchFin ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchFin ? 'text-grey-500' : 'text-dark'}`}>
            Sueldo mensual
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] leading-[22px] font-medium text-grey-500">s/.</span>
            <input
              type="number"
              disabled={!watchFin}
              placeholder="0.00"
              min="0"
              className={`input-base pl-12 ${errors.sueldo ? 'error' : ''}`}
              {...register('sueldo', {
                required: 'Ingresa un sueldo válido',
                validate: v => parseFloat(v) > 0 || 'El sueldo debe ser mayor a 0',
                onChange: e => {
                  if (parseFloat(e.target.value) > 0) scrollTo(refs.yaSalido)
                },
              })}
            />
          </div>
          <FieldError message={errors.sueldo?.message} />
        </div>

        {/* ¿Ya saliste antes de vacaciones? */}
        <div ref={refs.yaSalido} className={`mb-4 animate-fade-up transition-opacity ${watchSueldo && parseFloat(watchSueldo) > 0 ? 'opacity-100' : 'opacity-40'}`}>
          <label className={`block text-[15px] leading-[22px] font-medium mb-2 ${!watchSueldo ? 'text-grey-500' : 'text-dark'}`}>
            ¿Ya saliste antes de vacaciones?
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
                  disabled={!watchSueldo || parseFloat(watchSueldo) <= 0}
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
                  disabled={!watchSueldo || parseFloat(watchSueldo) <= 0}
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

        {/* ¿Cuántos días has salido de vacaciones? — sólo si yaSalido === true */}
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
                    // Limpio cualquier no-dígito y trunco al máximo
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
                    scrollTo(refs.bottom)
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
                    scrollTo(refs.bottom)
                  }}
                >
                  No
                </button>
              </div>
            )}
          />
          <FieldError message={errors.trabaja4Horas?.message} />
        </div>

        {/* Sentinel: scroll target tras completar el formulario */}
        <div ref={refs.bottom} className="h-1" />
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-5 py-4 z-20">
        <button type="submit" className="btn-primary" disabled={!canNext}>
          Calcular
        </button>
      </div>
    </form>
  )
}
