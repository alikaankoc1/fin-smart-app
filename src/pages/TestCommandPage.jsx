import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import useFinance from '../hooks/useFinance'

const questions = [
  {
    id: 'investmentHorizon',
    text: 'Yatirim sureniz ne kadar?',
    options: ['Kisa Vadeli', 'Orta Vadeli', 'Uzun Vadeli'],
  },
  {
    id: 'drawdownTolerance',
    text: 'Ana paranizin %10 deger kaybetmesi sizi ne kadar endiselendirir?',
    options: ['Cok', 'Biraz', 'Hic'],
  },
  {
    id: 'goal',
    text: 'Amaciniz nedir?',
    options: ['Birikimimi korumak', 'Duzenli gelir elde etmek', 'Maksimum kazanc'],
  },
]

function calculateProfileResult(investmentHorizon, drawdownTolerance) {
  if (investmentHorizon === 'Kisa Vadeli' && drawdownTolerance === 'Cok') {
    return 'Muhafazakar'
  }
  if (investmentHorizon === 'Uzun Vadeli' && drawdownTolerance === 'Hic') {
    return 'Agresif'
  }
  return 'Dengeli'
}

function mapProfileToRiskLevel(profileResult) {
  if (profileResult === 'Muhafazakar') {
    return 'Dusuk'
  }
  if (profileResult === 'Agresif') {
    return 'Yuksek'
  }
  return 'Orta'
}

export default function TestCommandPage({ onBack, onComplete }) {
  const { updateTotalBalance, setInvestmentPreferences } = useFinance()
  const [currentStep, setCurrentStep] = useState(-1)
  const [savingsAmount, setSavingsAmount] = useState('')
  const [answers, setAnswers] = useState({})

  const currentQuestion = currentStep >= 0 ? questions[currentStep] : null
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : null
  const isLastStep = currentStep === questions.length - 1
  const hasValidAmount = Number(savingsAmount) > 0
  const progressText = useMemo(
    () => (currentStep < 0 ? 'Hazirlik' : `${currentStep + 1} / ${questions.length}`),
    [currentStep],
  )

  const handleSelectOption = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }))
  }

  const handleNext = () => {
    if (currentStep < 0) {
      if (!hasValidAmount) {
        return
      }
      setCurrentStep(0)
      return
    }

    if (!selectedOption) {
      return
    }

    if (isLastStep) {
      const profileResult = calculateProfileResult(
        answers.investmentHorizon,
        answers.drawdownTolerance,
      )
      const riskLevel = mapProfileToRiskLevel(profileResult)
      const total = Number(savingsAmount) || 0

      updateTotalBalance(total)
      setInvestmentPreferences((prev) => ({
        ...prev,
        riskLevel,
        investmentHorizon: answers.investmentHorizon,
        profileResult,
        drawdownTolerance: answers.drawdownTolerance,
        goal: answers.goal,
      }))
      onComplete?.()
      return
    }

    setCurrentStep((prev) => prev + 1)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <section className="w-full max-w-4xl rounded-3xl border border-emerald-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Piyasa Ekranina Don
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white md:text-3xl">Yatirim Profili Testi</h1>
        <p className="mt-2 text-sm text-slate-400">Soru {progressText}</p>

        <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4 md:p-6">
          {currentStep < 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-white md:text-xl">
                Birikim yapilacak tutar nedir?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Teste baslamadan once hedef tutari giriniz.
              </p>
              <div className="mt-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={savingsAmount}
                  onChange={(event) => setSavingsAmount(event.target.value)}
                  placeholder="Orn: 100000"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white md:text-xl">
                {currentQuestion.text}
              </h2>

              <div className="mt-4 space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition md:text-base ${
                      selectedOption === option
                        ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200'
                        : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={
                currentStep < 0 ? !hasValidAmount : !selectedOption
              }
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition enabled:hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastStep ? 'Bitir' : 'Sonraki'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
