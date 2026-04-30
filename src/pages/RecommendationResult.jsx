import {
  ArrowLeft,
  BadgeDollarSign,
  CircleDollarSign,
  Coins,
  Gem,
  Landmark,
} from 'lucide-react'
import useFinance from '../hooks/useFinance'
import { calculateScenarioProjection } from '../services/scenarioProjection'

const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

const allocationByRiskProfile = {
  'Cok Muhafazakar': [
    { key: 'usd', name: 'Dolar', ratio: 0.12, Icon: BadgeDollarSign },
    { key: 'eur', name: 'Euro', ratio: 0.08, Icon: CircleDollarSign },
    { key: 'gbp', name: 'Pound', ratio: 0.05, Icon: Landmark },
    { key: 'gram', name: 'Gram Altin', ratio: 0.6, Icon: Coins },
    { key: 'silver', name: 'Gram Gumus', ratio: 0.15, Icon: Gem },
  ],
  Muhafazakar: [
    { key: 'usd', name: 'Dolar', ratio: 0.18, Icon: BadgeDollarSign },
    { key: 'eur', name: 'Euro', ratio: 0.12, Icon: CircleDollarSign },
    { key: 'gbp', name: 'Pound', ratio: 0.1, Icon: Landmark },
    { key: 'gram', name: 'Gram Altin', ratio: 0.45, Icon: Coins },
    { key: 'silver', name: 'Gram Gumus', ratio: 0.15, Icon: Gem },
  ],
  Dengeli: [
    { key: 'usd', name: 'Dolar', ratio: 0.25, Icon: BadgeDollarSign },
    { key: 'eur', name: 'Euro', ratio: 0.15, Icon: CircleDollarSign },
    { key: 'gbp', name: 'Pound', ratio: 0.15, Icon: Landmark },
    { key: 'gram', name: 'Gram Altin', ratio: 0.3, Icon: Coins },
    { key: 'silver', name: 'Gram Gumus', ratio: 0.15, Icon: Gem },
  ],
  'Buyume Odakli': [
    { key: 'usd', name: 'Dolar', ratio: 0.28, Icon: BadgeDollarSign },
    { key: 'eur', name: 'Euro', ratio: 0.18, Icon: CircleDollarSign },
    { key: 'gbp', name: 'Pound', ratio: 0.17, Icon: Landmark },
    { key: 'gram', name: 'Gram Altin', ratio: 0.25, Icon: Coins },
    { key: 'silver', name: 'Gram Gumus', ratio: 0.12, Icon: Gem },
  ],
  Agresif: [
    { key: 'usd', name: 'Dolar', ratio: 0.32, Icon: BadgeDollarSign },
    { key: 'eur', name: 'Euro', ratio: 0.2, Icon: CircleDollarSign },
    { key: 'gbp', name: 'Pound', ratio: 0.18, Icon: Landmark },
    { key: 'gram', name: 'Gram Altin', ratio: 0.2, Icon: Coins },
    { key: 'silver', name: 'Gram Gumus', ratio: 0.1, Icon: Gem },
  ],
}

const volatilityByProfile = {
  'Cok Muhafazakar': 0.8,
  Muhafazakar: 0.9,
  Dengeli: 1,
  'Buyume Odakli': 1.1,
  Agresif: 1.2,
}

const horizonByProfile = {
  'Cok Muhafazakar': 1,
  Muhafazakar: 1.5,
  Dengeli: 2,
  'Buyume Odakli': 2.5,
  Agresif: 3,
}

function buildSyntheticSeries(baseAmount) {
  const anchor = Number(baseAmount) || 0
  const safeAnchor = Math.max(anchor, 1)
  const factors = [0.95, 0.98, 1.01, 1.03, 1.02, 1.05, 1.04, 1.07, 1.06, 1.08]
  const now = Date.now()

  return factors.map((factor, index) => ({
    timestamp: Math.floor((now - (factors.length - index) * 7 * 24 * 60 * 60 * 1000) / 1000),
    close: safeAnchor * factor,
  }))
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
          {allocation.map(({ key, name, ratio, Icon }) => {
            const allocatedAmount = totalBalance * ratio
            const scenario = calculateScenarioProjection({
              principal: allocatedAmount,
              series: buildSyntheticSeries(allocatedAmount),
              horizonYears: horizonByProfile[selectedProfile] || 2,
              volatilityMultiplier: volatilityByProfile[selectedProfile] || 1,
            })

            return (
              <article
                key={key}
                className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/30"
              >
                <div className="mb-3 inline-flex rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                  <Icon size={20} />
                </div>
                <p className="text-sm text-slate-400">{name}</p>
                <p className="mt-1 text-lg font-bold text-white">
                  {moneyFormatter.format(allocatedAmount)}
                </p>
                <p className="mt-1 text-sm text-emerald-300">%{Math.round(ratio * 100)}</p>

                <div className="mt-4 space-y-1 rounded-xl border border-slate-700/80 bg-slate-950/40 p-3 text-xs">
                  <p className="text-slate-400">
                    Kotumser: <span className="font-semibold text-rose-300">{moneyFormatter.format(scenario.pessimistic)}</span>
                  </p>
                  <p className="text-slate-400">
                    Baz: <span className="font-semibold text-emerald-300">{moneyFormatter.format(scenario.base)}</span>
                  </p>
                  <p className="text-slate-400">
                    Iyimser: <span className="font-semibold text-cyan-300">{moneyFormatter.format(scenario.optimistic)}</span>
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
