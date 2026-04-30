import {
  ArrowLeft,
  BadgeDollarSign,
  CircleDollarSign,
  Coins,
  Gem,
  Landmark,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import useFinance from '../hooks/useFinance'
import { fetchInstrumentHistory } from '../services/marketHistory'
import { calculateScenarioProjection } from '../services/scenarioProjection'

const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

const allocationByRiskProfile = {
  'Cok Muhafazakar': [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.12, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.08, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Pound', ratio: 0.05, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altin', ratio: 0.6, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gumus', ratio: 0.15, Icon: Gem },
  ],
  Muhafazakar: [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.18, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.12, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Pound', ratio: 0.1, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altin', ratio: 0.45, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gumus', ratio: 0.15, Icon: Gem },
  ],
  Dengeli: [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.25, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.15, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Pound', ratio: 0.15, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altin', ratio: 0.3, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gumus', ratio: 0.15, Icon: Gem },
  ],
  'Buyume Odakli': [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.28, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.18, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Pound', ratio: 0.17, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altin', ratio: 0.25, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gumus', ratio: 0.12, Icon: Gem },
  ],
  Agresif: [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.32, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.2, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Pound', ratio: 0.18, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altin', ratio: 0.2, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gumus', ratio: 0.1, Icon: Gem },
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

const modeOptions = [
  { id: 'mixed', label: 'Otomatik Sepet' },
  { id: 'single', label: 'Tek Varlik' },
]

const singleAssetOptions = [
  { id: 'usd', label: 'Dolar' },
  { id: 'eur', label: 'Euro' },
  { id: 'gbp', label: 'Pound' },
  { id: 'gram', label: 'Gram Altin' },
  { id: 'silver', label: 'Gram Gumus' },
]

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

function getAutoTrendComment(series, annualVolatility) {
  if (!series || series.length < 2) {
    return 'Son veriler sinirli, yorum guven seviyesi dusuk.'
  }

  const first = Number(series[0]?.close) || 0
  const last = Number(series[series.length - 1]?.close) || 0
  if (first <= 0 || last <= 0) {
    return 'Veri kalite sorunu nedeniyle trend yorumu sinirli.'
  }

  const changePct = ((last - first) / first) * 100
  const trendText =
    changePct > 6
      ? 'yukselis'
      : changePct < -6
        ? 'gerileme'
        : 'yatay-seyir'
  const volText =
    annualVolatility > 0.28
      ? 'yuksek oynaklik'
      : annualVolatility > 0.16
        ? 'orta oynaklik'
        : 'dusuk oynaklik'

  return `Son donemde ${trendText} ve ${volText} izleniyor.`
}

export default function RecommendationResult({ onBack }) {
  const { riskProfile, totalBalance } = useFinance()
  const [investmentMode, setInvestmentMode] = useState('mixed')
  const [singleAssetId, setSingleAssetId] = useState('usd')
  const selectedProfile = allocationByRiskProfile[riskProfile]
    ? riskProfile
    : 'Dengeli'
  const allocation = allocationByRiskProfile[selectedProfile]
  const [scenarioByAsset, setScenarioByAsset] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadScenarios = async () => {
      setLoading(true)
      const next = {}
      const horizonYears = horizonByProfile[selectedProfile] || 2
      const volatilityMultiplier = volatilityByProfile[selectedProfile] || 1

      await Promise.all(
        allocation.map(async (item) => {
          const principal = totalBalance * item.ratio
          try {
            const series = await fetchInstrumentHistory(item.instrumentId, '6m', '1wk')
            const scenario = calculateScenarioProjection({
              principal,
              series,
              horizonYears,
              volatilityMultiplier,
            })
            next[item.key] = {
              ...scenario,
              comment: getAutoTrendComment(series, scenario.annualVolatility),
            }
          } catch {
            const fallbackSeries = buildSyntheticSeries(principal)
            const scenario = calculateScenarioProjection({
              principal,
              series: fallbackSeries,
              horizonYears,
              volatilityMultiplier,
            })
            next[item.key] = {
              ...scenario,
              comment: 'Canli gecmis veriye erisimde kesinti oldugu icin tahmini yorum kullaniliyor.',
            }
          }
        }),
      )

      if (active) {
        setScenarioByAsset(next)
        setLoading(false)
      }
    }

    loadScenarios()

    return () => {
      active = false
    }
  }, [allocation, selectedProfile, totalBalance])

  const portfolioBand = useMemo(() => {
    if (allocation.length === 0) {
      return { pessimistic: 0, base: 0, optimistic: 0 }
    }

    return allocation.reduce(
      (totals, item) => {
        const scenario = scenarioByAsset[item.key]
        if (!scenario) {
          return totals
        }
        return {
          pessimistic: totals.pessimistic + scenario.pessimistic,
          base: totals.base + scenario.base,
          optimistic: totals.optimistic + scenario.optimistic,
        }
      },
      { pessimistic: 0, base: 0, optimistic: 0 },
    )
  }, [allocation, scenarioByAsset])

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

        <div className="mb-6 rounded-2xl border border-emerald-300/20 bg-emerald-400/5 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-300">Yatirim modu secimi</p>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/60 p-1">
              {modeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setInvestmentMode(option.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    investmentMode === option.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mb-2 text-xs text-slate-400">
            {investmentMode === 'mixed'
              ? 'Otomatik Sepet secili: risk profiline gore dagilim gosteriliyor.'
              : 'Tek Varlik secili: bir sonraki adimda tek varlik secim arayuzu eklenecek.'}
          </p>

          {investmentMode === 'single' && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <label htmlFor="single-asset" className="text-xs text-slate-400">
                Tek varlik secimi
              </label>
              <select
                id="single-asset"
                value={singleAssetId}
                onChange={(event) => setSingleAssetId(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 outline-none transition focus:border-emerald-400"
              >
                {singleAssetOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <p className="text-sm text-slate-300">Toplam Portfoy Projeksiyonu (Ust Bant)</p>
          <div className="mt-2 grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <p className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
              Kotumser: <span className="font-semibold text-rose-300">{moneyFormatter.format(portfolioBand.pessimistic)}</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
              Baz: <span className="font-semibold text-emerald-300">{moneyFormatter.format(portfolioBand.base)}</span>
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-300">
              Iyimser: <span className="font-semibold text-cyan-300">{moneyFormatter.format(portfolioBand.optimistic)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {allocation.map(({ key, name, ratio, Icon }) => {
            const allocatedAmount = totalBalance * ratio
            const scenario = scenarioByAsset[key]

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
                  {scenario ? (
                    <>
                      <p className="text-slate-400">
                        Kotumser: <span className="font-semibold text-rose-300">{moneyFormatter.format(scenario.pessimistic)}</span>
                      </p>
                      <p className="text-slate-400">
                        Baz: <span className="font-semibold text-emerald-300">{moneyFormatter.format(scenario.base)}</span>
                      </p>
                      <p className="text-slate-400">
                        Iyimser: <span className="font-semibold text-cyan-300">{moneyFormatter.format(scenario.optimistic)}</span>
                      </p>
                      <p className="pt-1 text-slate-500">{scenario.comment}</p>
                    </>
                  ) : (
                    <p className="text-slate-500">{loading ? 'Senaryo hesaplanıyor...' : 'Senaryo hesaplanamadi.'}</p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
