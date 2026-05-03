import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import LanguageSwitcher from '../components/LanguageSwitcher'
import useFinance from '../hooks/useFinance'
import useLanguage from '../hooks/useLanguage'
import { parseAmountInput } from '../utils/parseAmountInput'

const questionsByLanguage = {
  tr: [
    {
      id: 'investmentHorizon',
      text: 'Yatırım süreniz ne kadar?',
      options: [
        { label: '0–1 yıl', score: 1 },
        { label: '1–3 yıl', score: 2 },
        { label: '3–7 yıl', score: 3 },
        { label: '7+ yıl', score: 4 },
      ],
    },
    {
      id: 'drawdownTolerance',
      text: 'Ana paranızın %10 değer kaybetmesi sizi ne kadar endişelendirir?',
      options: [
        { label: 'Çok endişelendirir', score: 1 },
        { label: 'Endişelendirir', score: 2 },
        { label: 'Biraz endişelendirir', score: 3 },
        { label: 'Hiç endişe duymam', score: 4 },
      ],
    },
    {
      id: 'incomeStability',
      text: 'Gelirinizin düzenliliği nasıl?',
      options: [
        { label: 'Çok değişken / belirsiz', score: 1 },
        { label: 'Değişken', score: 2 },
        { label: 'Kısmen düzenli', score: 3 },
        { label: 'Çok düzenli', score: 4 },
      ],
    },
    {
      id: 'liquidityNeed',
      text: 'Yakında bu birikime ihtiyaç duyma olasılığınız nedir?',
      options: [
        { label: 'Çok yüksek', score: 1 },
        { label: 'Yüksek', score: 2 },
        { label: 'Orta', score: 3 },
        { label: 'Düşük', score: 4 },
      ],
    },
    {
      id: 'volatilityReaction',
      text: 'Portföyünüz bir ayda %15 düşerse ne yaparsınız?',
      options: [
        { label: 'Hemen satarım', score: 1 },
        { label: 'Önemli kısmını satarım', score: 2 },
        { label: 'Biraz satar, çoğunu beklerim', score: 3 },
        { label: 'Beklerim / ek alım yaparım', score: 4 },
      ],
    },
    {
      id: 'experience',
      text: 'Yatırım tecrübenizi nasıl tanımlarsınız?',
      options: [
        { label: 'Yeni başlıyorum', score: 1 },
        { label: 'Temel bilgim var', score: 2 },
        { label: 'Orta seviye', score: 3 },
        { label: 'Deneyimliyim', score: 4 },
      ],
    },
    {
      id: 'tracking',
      text: 'Portföyünüzü ne sıklıkla takip edebilirsiniz?',
      options: [
        { label: 'Nadiren', score: 1 },
        { label: 'Ayda bir', score: 2 },
        { label: 'Haftalık', score: 3 },
        { label: 'Günlük', score: 4 },
      ],
    },
    {
      id: 'returnPriority',
      text: 'Sizin için hangisi daha öncelikli?',
      options: [
        { label: 'Anapara güvenliği', score: 1 },
        { label: 'Önce güvenlik, sınırlı risk', score: 2 },
        { label: 'Denge (risk/getiri)', score: 3 },
        { label: 'Yüksek getiri potansiyeli', score: 4 },
      ],
    },
    {
      id: 'goal',
      text: 'Amacınız nedir?',
      options: [
        { label: 'Birikimimi korumak', score: 1 },
        { label: 'Enflasyonun üzerinde koruma', score: 2 },
        { label: 'Düzenli gelir + birikim', score: 3 },
        { label: 'Uzun vadede maksimum kazanç', score: 4 },
      ],
    },
  ],
  en: [
    {
      id: 'investmentHorizon',
      text: 'What is your investment horizon?',
      options: [
        { label: '0–1 year', score: 1 },
        { label: '1–3 years', score: 2 },
        { label: '3–7 years', score: 3 },
        { label: '7+ years', score: 4 },
      ],
    },
    {
      id: 'drawdownTolerance',
      text: 'How concerned would you be if your principal drops by 10%?',
      options: [
        { label: 'Very concerned', score: 1 },
        { label: 'Concerned', score: 2 },
        { label: 'Somewhat concerned', score: 3 },
        { label: 'Not concerned', score: 4 },
      ],
    },
    {
      id: 'incomeStability',
      text: 'How stable is your income?',
      options: [
        { label: 'Highly unstable', score: 1 },
        { label: 'Unstable', score: 2 },
        { label: 'Partially stable', score: 3 },
        { label: 'Very stable', score: 4 },
      ],
    },
    {
      id: 'liquidityNeed',
      text: 'How likely are you to need this money soon?',
      options: [
        { label: 'Very high', score: 1 },
        { label: 'High', score: 2 },
        { label: 'Medium', score: 3 },
        { label: 'Low', score: 4 },
      ],
    },
    {
      id: 'volatilityReaction',
      text: 'What would you do if your portfolio drops 15% in one month?',
      options: [
        { label: 'Sell immediately', score: 1 },
        { label: 'Sell a large portion', score: 2 },
        { label: 'Sell a little, hold the rest', score: 3 },
        { label: 'Hold / add more', score: 4 },
      ],
    },
    {
      id: 'experience',
      text: 'How would you describe your investment experience?',
      options: [
        { label: 'Beginner', score: 1 },
        { label: 'Basic knowledge', score: 2 },
        { label: 'Intermediate', score: 3 },
        { label: 'Experienced', score: 4 },
      ],
    },
    {
      id: 'tracking',
      text: 'How often can you monitor your portfolio?',
      options: [
        { label: 'Rarely', score: 1 },
        { label: 'Monthly', score: 2 },
        { label: 'Weekly', score: 3 },
        { label: 'Daily', score: 4 },
      ],
    },
    {
      id: 'returnPriority',
      text: 'Which is your priority?',
      options: [
        { label: 'Capital safety first', score: 1 },
        { label: 'Safety first, limited risk', score: 2 },
        { label: 'Balance (risk / return)', score: 3 },
        { label: 'High return potential', score: 4 },
      ],
    },
    {
      id: 'goal',
      text: 'What is your primary goal?',
      options: [
        { label: 'Protect my savings', score: 1 },
        { label: 'Beat inflation cautiously', score: 2 },
        { label: 'Income plus growth', score: 3 },
        { label: 'Maximum long-term growth', score: 4 },
      ],
    },
  ],
}

/** 9 soru × 4 puan = 36 max; eşit genişlikte 7 kademe (9–12 … 33–36). */
function calculateRiskProfile(totalScore) {
  const s = Math.min(36, Math.max(9, Number(totalScore) || 18))
  if (s <= 12) return 'Çok Muhafazakar'
  if (s <= 16) return 'Muhafazakar'
  if (s <= 20) return 'İhtiyatlı'
  if (s <= 24) return 'Dengeli'
  if (s <= 28) return 'Dinamik'
  if (s <= 32) return 'Büyüme Odaklı'
  return 'Agresif'
}

export default function TestCommandPage({ onBack, onComplete }) {
  const { language } = useLanguage()
  const isEn = language === 'en'
  const { setRiskProfile, setTotalBalance } = useFinance()
  const questions = useMemo(
    () => questionsByLanguage[language] || questionsByLanguage.tr,
    [language],
  )
  const [currentStep, setCurrentStep] = useState(-1)
  const [savingsAmount, setSavingsAmount] = useState('')
  const [answers, setAnswers] = useState({})

  const currentQuestion = currentStep >= 0 ? questions[currentStep] : null
  const selectedScore = currentQuestion ? answers[currentQuestion.id] : null
  const isLastStep = currentStep === questions.length - 1
  const parsedSavingsAmount = parseAmountInput(savingsAmount)
  const hasValidAmount = parsedSavingsAmount > 0
  const progressText = useMemo(
    () =>
      currentStep < 0
        ? isEn
          ? 'Setup'
          : 'Hazırlık'
        : `${currentStep + 1} / ${questions.length}`,
    [currentStep, isEn, questions.length],
  )
  const progressPercent = useMemo(() => {
    if (currentStep < 0) {
      return 0
    }
    return ((currentStep + 1) / questions.length) * 100
  }, [currentStep, questions.length])

  const handleSelectOption = (score) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: score,
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

    if (!selectedScore) {
      return
    }

    if (isLastStep) {
      const merged = { ...answers }
      if (currentQuestion && selectedScore != null) {
        merged[currentQuestion.id] = selectedScore
      }
      const totalScore = Object.values(merged).reduce(
        (sum, value) => sum + Number(value || 0),
        0,
      )
      const profile = calculateRiskProfile(totalScore)
      setRiskProfile(profile)
      setTotalBalance(parsedSavingsAmount)
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
            {isEn ? 'Back To Market' : 'Piyasa Ekranına Dön'}
          </button>
          <LanguageSwitcher />
        </div>

        <h1 className="text-2xl font-bold text-white md:text-3xl">
          {isEn ? 'Investment Profile Test' : 'Yatırım Profili Testi'}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {isEn ? 'Question' : 'Soru'} {progressText}
        </p>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>{isEn ? 'Progress' : 'İlerleme'}</span>
            <span>%{Math.round(progressPercent)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4 md:p-6">
          {currentStep < 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-white md:text-xl">
                {isEn
                  ? 'What is the amount you want to invest?'
                  : 'Birikim yapılacak tutar nedir?'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {isEn
                  ? 'Enter your target amount before starting the test.'
                  : 'Teste başlamadan önce hedef tutarı giriniz.'}
              </p>
              <div className="mt-4">
                <input
                  type="text"
                  inputMode="decimal"
                  value={savingsAmount}
                  onChange={(event) => setSavingsAmount(event.target.value)}
                  placeholder={isEn ? 'Ex: 100000' : 'Örn: 100000'}
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
                {currentQuestion.options.map((option, optIdx) => (
                  <button
                    key={`${currentQuestion.id}-${optIdx}`}
                    type="button"
                    onClick={() => handleSelectOption(option.score)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition md:text-base ${
                      selectedScore === option.score
                      ? 'border-emerald-400 bg-emerald-400/15 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                      : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(52,211,153,0.25)]'
                    }`}
                  >
                    {option.label}
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
                currentStep < 0 ? !hasValidAmount : !selectedScore
              }
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition enabled:hover:bg-emerald-400 enabled:hover:shadow-[0_0_22px_rgba(52,211,153,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLastStep ? (isEn ? 'Finish' : 'Bitir') : isEn ? 'Next' : 'Sonraki'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
