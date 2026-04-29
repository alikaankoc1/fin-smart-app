import { ArrowLeft, Bitcoin, Building2, Coins, Gem, Landmark, TrendingUp } from 'lucide-react'
import useFinance from '../hooks/useFinance'

const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

const allocationByRiskProfile = {
  Muhafazakar: [
    { key: 'gold', name: 'Altin', ratio: 0.6, Icon: Coins },
    { key: 'deposit', name: 'Mevduat', ratio: 0.3, Icon: Landmark },
    { key: 'silver', name: 'Gumus', ratio: 0.1, Icon: Gem },
  ],
  Dengeli: [
    { key: 'stock', name: 'Hisse Senedi', ratio: 0.4, Icon: TrendingUp },
    { key: 'usd', name: 'Dolar', ratio: 0.4, Icon: Building2 },
    { key: 'gold', name: 'Altin', ratio: 0.2, Icon: Coins },
  ],
  Agresif: [
    { key: 'crypto', name: 'Kripto', ratio: 0.5, Icon: Bitcoin },
    { key: 'foreign-stock', name: 'Yabanci Hisse', ratio: 0.4, Icon: TrendingUp },
    { key: 'gold', name: 'Altin', ratio: 0.1, Icon: Coins },
  ],
}

export default function RecommendationResult({ onBack }) {
  const { riskProfile, totalBalance } = useFinance()
  const selectedProfile = allocationByRiskProfile[riskProfile]
    ? riskProfile
    : 'Dengeli'
  const allocation = allocationByRiskProfile[selectedProfile]

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <section className="w-full max-w-5xl rounded-3xl border border-emerald-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Piyasa Ekranina Don
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-white md:text-3xl">Oneri Sonucu</h1>
            <p className="text-sm text-slate-400">
              Risk profili: <span className="font-semibold text-emerald-300">{selectedProfile}</span>
            </p>
            <p className="text-sm text-slate-400">
              Toplam bakiye: <span className="font-semibold text-white">{moneyFormatter.format(totalBalance)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {allocation.map(({ key, name, ratio, Icon }) => (
            <article
              key={key}
              className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/30"
            >
              <div className="mb-3 inline-flex rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                <Icon size={20} />
              </div>
              <p className="text-sm text-slate-400">{name}</p>
              <p className="mt-1 text-lg font-bold text-white">
                {moneyFormatter.format(totalBalance * ratio)}
              </p>
              <p className="mt-1 text-sm text-emerald-300">%{Math.round(ratio * 100)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
