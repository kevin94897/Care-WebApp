import { useState } from 'react'
import Step1 from './Step1'
import Step2 from './Step2'
import Step2Grati from './Step2Grati'
import Step2Vaca from './Step2Vaca'
import Step2Liq from './Step2Liq'
import Step3 from './Step3'
import { LoadingScreen, EmployerForm, WorkerForm, DownloadScreen } from './screens'
import { calculateCTS, calculateGratificacion, calculateVacaciones, calculateLiquidacion } from './calc'

export default function App() {
  const [screen, setScreen] = useState('step1')
  const [step1Data, setStep1Data] = useState({ role: null, benefit: null })
  const [step2Data, setStep2Data] = useState(null)
  const [result, setResult] = useState(null)

  function goToStep3(data) {
    setScreen('loading')
    let res
    if (step1Data.benefit === 'vacaciones') {
      res = calculateVacaciones(data)
    } else if (step1Data.benefit === 'gratificacion') {
      res = calculateGratificacion({
        sueldo: data.sueldo,
        period: data.period,
        fechaInicio: data.fechaInicio,
        cesada: data.cesada,
        fechaCese: data.fechaCese,
        eps: data.eps,
        horasExtra: data.horasExtra ? data.horasExtraData : null,
        asignacionFamiliar: data.hijos,
      })
    } else if (step1Data.benefit === 'liquidacion') {
      res = calculateLiquidacion(data)
    } else {
      res = calculateCTS({
        sueldo: data.sueldo,
        fechaInicio: data.fechaInicio,
        cesada: data.cesada,
        fechaCese: data.fechaCese,
        horasExtra: data.horasExtra ? data.horasExtraData : null,
        asignacionFamiliar: data.hijos,
      })
    }
    setResult(res)
    setTimeout(() => setScreen('step3'), 1600)
  }

  const screens = {
    step1: (
      <Step1
        data={step1Data}
        setData={setStep1Data}
        onNext={() => setScreen('step2')}
      />
    ),
    step2:
      step1Data.benefit === 'gratificacion' ? (
        <Step2Grati
          savedData={step2Data}
          onSave={setStep2Data}
          onNext={goToStep3}
          onBack={() => setScreen('step1')}
        />
      ) : step1Data.benefit === 'vacaciones' ? (
        <Step2Vaca
          savedData={step2Data}
          onSave={setStep2Data}
          onNext={goToStep3}
          onBack={() => setScreen('step1')}
        />
      ) : step1Data.benefit === 'liquidacion' ? (
        <Step2Liq
          savedData={step2Data}
          onSave={setStep2Data}
          onNext={goToStep3}
          onBack={() => setScreen('step1')}
        />
      ) : (
        <Step2
          savedData={step2Data}
          onSave={setStep2Data}
          onNext={goToStep3}
          onBack={() => setScreen('step1')}
        />
      ),
    loading: <LoadingScreen />,
    step3: result && (
      <Step3
        data={step2Data}
        result={result}
        benefit={step1Data.benefit}
        onBack={() => setScreen('step2')}
        onDownload={() => setScreen('employer')}
      />
    ),
    employer: (
      <EmployerForm
        onBack={() => setScreen('step3')}
        onNext={() => setScreen('worker')}
      />
    ),
    worker: (
      <WorkerForm
        onBack={() => setScreen('employer')}
        onNext={() => setScreen('download')}
      />
    ),
    download: <DownloadScreen onBack={() => setScreen('step3')} />,
  }

  return <div>{screens[screen] || screens.step1}</div>
}
