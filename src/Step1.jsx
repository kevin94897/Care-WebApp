import { Header, Stepper } from './UI'
import { IconWorker, IconHome, IconCTS, IconGift, IconUmbrella, IconList } from './Icons'

const ROLES = [
  { key: 'worker', label: 'Trabajadora/o', Icon: IconWorker },
  { key: 'employer', label: 'Empleador/a', Icon: IconHome },
]

const BENEFITS = [
  { key: 'cts', label: 'CTS', sub: 'Tiempo de servicio', Icon: IconCTS },
  { key: 'gratificacion', label: 'Gratificación', sub: 'Julio y diciembre', Icon: IconGift },
  { key: 'vacaciones', label: 'Vacaciones', sub: 'Días y monto', Icon: IconUmbrella },
  { key: 'liquidacion', label: 'Liquidación', sub: 'Al terminar el trabajo', Icon: IconList },
]

export default function Step1({ data, setData, onNext, onBack }) {
  const canNext = data.role && data.benefit

  return (
    <div>
      <Header onBack={onBack} />
      <div className="px-5 pt-5 pb-28 lg:dt-shell lg:pb-0">
        <Stepper current={1} />
        <div className="h-6" />

        <div className="lg:max-w-3xl lg:mx-auto">
          <p className="text-[15px] leading-[22px] font-medium text-dark mb-3 animate-fade-up lg:text-[18px] lg:leading-[26px]">¿Eres trabajadora/o o empleador/a?</p>
          <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-up-2 lg:gap-5 lg:mb-10 lg:max-w-md">
            {ROLES.map(({ key, label, Icon }) => (
              <div
                key={key}
                className={`type-card ${data.role === key ? 'active' : ''} lg:p-6`}
                onClick={() => setData(d => ({ ...d, role: key }))}
              >
                <div className="w-12 flex items-center justify-center">
                  <Icon />
                </div>
                <div className="text-[15px] leading-[22px] font-medium text-blue-brand text-center">{label}</div>
              </div>
            ))}
          </div>

          <p className="text-[15px] leading-[22px] font-medium text-dark mb-3 animate-fade-up-2 lg:text-[18px] lg:leading-[26px]">¿Qué beneficio quieres calcular?</p>
          <div className="grid grid-cols-2 gap-3 animate-fade-up-3 lg:grid-cols-4 lg:gap-5">
            {BENEFITS.map(({ key, label, sub, Icon, disabled }) => (
              <div
                key={key}
                className={`benefit-card ${data.benefit === key ? 'active' : ''} ${disabled ? 'disabled' : ''} lg:p-5`}
                onClick={() => !disabled && setData(d => ({ ...d, benefit: key }))}
              >
                <Icon />
                <div className="text-[15px] leading-[22px] font-medium text-blue-brand">{label}</div>
                <div className="text-[11px] leading-[16px] font-medium text-grey-500 text-center">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white px-5 py-4 z-20 lg:static lg:translate-x-0 lg:max-w-2xl lg:mx-auto lg:px-0 lg:py-8 lg:bg-transparent lg:flex lg:justify-end">
        <button className="btn-primary lg:w-auto lg:min-w-[240px]" disabled={!canNext} onClick={onNext}>
          Siguiente →
        </button>
      </div>
    </div>
  )
}
