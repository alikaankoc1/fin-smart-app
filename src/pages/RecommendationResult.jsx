import {
  ArrowLeft,
  BadgeDollarSign,
  CircleDollarSign,
  Coins,
  Gem,
  Landmark,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getStatusMessages } from '../copy/statusMessages'
import LanguageSwitcher from '../components/LanguageSwitcher'
import useLanguage from '../hooks/useLanguage'
import useFinance from '../hooks/useFinance'
import { fetchInstrumentHistory } from '../services/marketHistory'
import { calculateScenarioProjection } from '../services/scenarioProjection'

const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

const allocationByRiskProfile = {
  'Çok Muhafazakar': [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.12, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.08, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Sterlin', ratio: 0.05, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altın', ratio: 0.6, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gümüş', ratio: 0.15, Icon: Gem },
  ],
  Muhafazakar: [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.18, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.12, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Sterlin', ratio: 0.1, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altın', ratio: 0.45, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gümüş', ratio: 0.15, Icon: Gem },
  ],
  Dengeli: [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.25, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.15, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Sterlin', ratio: 0.15, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altın', ratio: 0.3, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gümüş', ratio: 0.15, Icon: Gem },
  ],
  'Büyüme Odaklı': [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.28, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.18, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Sterlin', ratio: 0.17, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altın', ratio: 0.25, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gümüş', ratio: 0.12, Icon: Gem },
  ],
  Agresif: [
    { key: 'usd', instrumentId: 'usd', name: 'Dolar', ratio: 0.32, Icon: BadgeDollarSign },
    { key: 'eur', instrumentId: 'eur', name: 'Euro', ratio: 0.2, Icon: CircleDollarSign },
    { key: 'gbp', instrumentId: 'gbp', name: 'Sterlin', ratio: 0.18, Icon: Landmark },
    { key: 'gram', instrumentId: 'gram', name: 'Gram Altın', ratio: 0.2, Icon: Coins },
    { key: 'silver', instrumentId: 'silver', name: 'Gram Gümüş', ratio: 0.1, Icon: Gem },
  ],
}

const volatilityByProfile = {
  'Çok Muhafazakar': 0.8,
  Muhafazakar: 0.9,
  Dengeli: 1,
  'Büyüme Odaklı': 1.1,
  Agresif: 1.2,
}

const horizonByProfile = {
  'Çok Muhafazakar': 1,
  Muhafazakar: 1.5,
  Dengeli: 2,
  'Büyüme Odaklı': 2.5,
  Agresif: 3,
}

const modeOptions = [
  { id: 'mixed', label: 'Otomatik Sepet' },
  { id: 'single', label: 'Tek Varlık' },
]

const singleAssetOptions = [
  { id: 'usd', label: 'Dolar' },
  { id: 'eur', label: 'Euro' },
  { id: 'gbp', label: 'Sterlin' },
  { id: 'gram', label: 'Gram Altın' },
  { id: 'silver', label: 'Gram Gümüş' },
]

const singleAssetCatalog = allocationByRiskProfile.Dengeli.reduce((acc, item) => {
  acc[item.key] = { ...item, ratio: 1 }
  return acc
}, {})

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

function getAutoTrendComment(series, annualVolatility, isEnglish = false) {
  if (!series || series.length < 2) {
    return isEnglish
      ? 'Recent data is limited, confidence is low.'
      : 'Son veriler sınırlı, yorum güven seviyesi düşük.'
  }

  const first = Number(series[0]?.close) || 0
  const last = Number(series[series.length - 1]?.close) || 0
  if (first <= 0 || last <= 0) {
    return isEnglish
      ? 'Trend comment is limited due to data quality.'
      : 'Veri kalite sorunu nedeniyle trend yorumu sınırlı.'
  }

  const changePct = ((last - first) / first) * 100
  const trendText = isEnglish
    ? changePct > 6
      ? 'uptrend'
      : changePct < -6
        ? 'pullback'
        : 'sideways movement'
      : changePct > 6
      ? 'yükseliş'
      : changePct < -6
        ? 'gerileme'
        : 'yatay seyir'
  const volText = isEnglish
    ? annualVolatility > 0.28
      ? 'high volatility'
      : annualVolatility > 0.16
        ? 'moderate volatility'
        : 'low volatility'
    : annualVolatility > 0.28
      ? 'yüksek oynaklık'
      : annualVolatility > 0.16
        ? 'orta oynaklık'
        : 'düşük oynaklık'

  return isEnglish
    ? `Recent data suggests ${trendText} with ${volText}.`
    : `Son dönemde ${trendText} ve ${volText} izleniyor.`
}

function getVolatilityAlert(annualVolatility, isEnglish = false) {
  if (!Number.isFinite(annualVolatility)) {
    return null
  }

  if (annualVolatility >= 0.28) {
    return {
      level: 'high',
      label: isEnglish ? 'High volatility risk' : 'Yüksek volatilite riski',
      detail: isEnglish
        ? 'Sharp price swings are likely in this asset.'
        : 'Bu varlıkta sert fiyat hareketleri görülebilir.',
      className: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
    }
  }

  if (annualVolatility >= 0.16) {
    return {
      level: 'medium',
      label: isEnglish ? 'Medium volatility' : 'Orta volatilite',
      detail: isEnglish
        ? 'Moderate fluctuations are expected; monitor regularly.'
        : 'Orta düzey dalgalanma beklenir; düzenli takip edin.',
      className: 'border-amber-400/40 bg-amber-400/10 text-amber-200',
    }
  }

  return {
    level: 'low',
    label: isEnglish ? 'Low volatility' : 'Düşük volatilite',
    detail: isEnglish
      ? 'Price movements are relatively stable for now.'
      : 'Fiyat hareketleri şu an görece daha stabil.',
    className: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200',
  }
}

export default function RecommendationResult({ onBack }) {
  const { language } = useLanguage()
  const isEn = language === 'en'
  const messages = useMemo(() => getStatusMessages(language), [language])
  const { riskProfile, totalBalance } = useFinance()
  const [investmentMode, setInvestmentMode] = useState('mixed')
  const [singleAssetId, setSingleAssetId] = useState('usd')
  const selectedProfile = allocationByRiskProfile[riskProfile]
    ? riskProfile
    : 'Dengeli'
  const allocation = allocationByRiskProfile[selectedProfile]
  const activeAllocation = useMemo(() => {
    if (investmentMode === 'single') {
      const selectedAsset = singleAssetCatalog[singleAssetId]
      return selectedAsset ? [selectedAsset] : []
    }
    return allocation
  }, [allocation, investmentMode, singleAssetId])
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
        activeAllocation.map(async (item) => {
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
              comment: getAutoTrendComment(series, scenario.annualVolatility, isEn),
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
              comment: isEn
                ? 'Live history unavailable, using fallback estimate.'
                : 'Canlı geçmiş veriye erişimde kesinti olduğu için tahmini yorum kullanılıyor.',
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
  }, [activeAllocation, isEn, selectedProfile, totalBalance])

  const portfolioBand = useMemo(() => {
    if (activeAllocation.length === 0) {
      return { pessimistic: 0, base: 0, optimistic: 0 }
    }

    return activeAllocation.reduce(
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
  }, [activeAllocation, scenarioByAsset])

  return (
    <main className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <section className="w-full max-w-5xl rounded-3xl border border-emerald-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/80 hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden />
            {isEn ? 'Back to market' : 'Piyasa ekranına dön'}
          </button>
          <LanguageSwitcher />
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {isEn ? 'Recommendation' : 'Öneri sonucu'}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-400">
            {isEn
              ? 'Projection bands are illustrative only—not investment advice.'
              : 'Bantlar yalnızca gösterim amaçlıdır; yatırım tavsiyesi değildir.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-700/90 bg-slate-900/80 px-4 py-1.5 text-sm text-slate-300">
              {isEn ? 'Risk' : 'Risk'}:{' '}
              <span className="ml-1.5 font-medium text-emerald-400">{selectedProfile}</span>
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-700/90 bg-slate-900/80 px-4 py-1.5 text-sm text-slate-300">
              {isEn ? 'Balance' : 'Bakiye'}:{' '}
              <span className="ml-1.5 font-medium tabular-nums text-white">
                {moneyFormatter.format(totalBalance)}
              </span>
            </span>
          </div>
        </header>

        <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isEn ? 'Investment mode' : 'Yatırım modu'}
          </p>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg border border-slate-700/80 bg-slate-950/60 p-1">
              {modeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setInvestmentMode(option.id)}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                    investmentMode === option.id
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isEn
                    ? option.id === 'mixed'
                      ? 'Auto basket'
                      : 'Single asset'
                    : option.label}
                </button>
              ))}
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              {investmentMode === 'mixed'
                ? isEn
                  ? 'Weights follow your risk profile.'
                  : 'Ağırlıklar risk profilinize göre hesaplanır.'
                : isEn
                  ? 'All capital is allocated to one instrument.'
                  : 'Tüm tutar tek bir varlıkta gösterilir.'}
            </p>
          </div>

          {investmentMode === 'single' && (
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-6">
              <label htmlFor="single-asset" className="text-sm text-slate-400">
                {isEn ? 'Instrument' : 'Varlık'}
              </label>
              <select
                id="single-asset"
                value={singleAssetId}
                onChange={(event) => setSingleAssetId(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              >
                {singleAssetOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        <section className="mb-12 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {isEn ? 'Total portfolio projection' : 'Toplam portföy projeksiyonu'}
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-3 md:gap-6">
            <div>
              <p className="text-xs text-slate-500">{isEn ? 'Pessimistic' : 'Kötümser'}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-300 md:text-xl">
                {moneyFormatter.format(portfolioBand.pessimistic)}
              </p>
            </div>
            <div className="md:border-x md:border-slate-800 md:px-6">
              <p className="text-xs text-slate-500">{isEn ? 'Base' : 'Baz'}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300 md:text-xl">
                {moneyFormatter.format(portfolioBand.base)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{isEn ? 'Optimistic' : 'İyimser'}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300 md:text-xl">
                {moneyFormatter.format(portfolioBand.optimistic)}
              </p>
            </div>
          </div>
        </section>

        <section
          className={
            investmentMode === 'single'
              ? 'mx-auto grid max-w-lg grid-cols-1 gap-8'
              : 'grid grid-cols-1 gap-8 md:grid-cols-3'
          }
        >
          {activeAllocation.map(({ key, name, ratio, Icon }) => {
            const allocatedAmount = totalBalance * ratio
            const scenario = scenarioByAsset[key]
            const volatilityAlert = scenario
              ? getVolatilityAlert(scenario.annualVolatility, isEn)
              : null

            return (
              <article
                key={key}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 shadow-lg shadow-black/20"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Icon size={22} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-medium text-white">{name}</h2>
                      <p className="mt-0.5 text-sm text-slate-500">
                        %{Math.round(ratio * 100)}
                        {investmentMode === 'single'
                          ? isEn
                            ? ' · full portfolio'
                            : ' · tüm portföy'
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">
                      {isEn ? 'Amount' : 'Tutar'}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">
                      {moneyFormatter.format(allocatedAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 pt-4">
                  {scenario ? (
                    <>
                      {volatilityAlert ? (
                        <div
                          className={`mb-5 rounded-lg border px-3 py-2.5 text-xs leading-snug ${volatilityAlert.className}`}
                        >
                          <p className="font-semibold">{volatilityAlert.label}</p>
                          <p className="mt-1 opacity-90">{volatilityAlert.detail}</p>
                        </div>
                      ) : null}
                      <dl className="space-y-3 text-sm">
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-slate-500">{isEn ? 'Pessimistic' : 'Kötümser'}</dt>
                          <dd className="font-medium tabular-nums text-rose-300">
                            {moneyFormatter.format(scenario.pessimistic)}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-slate-500">{isEn ? 'Base' : 'Baz'}</dt>
                          <dd className="font-medium tabular-nums text-emerald-300">
                            {moneyFormatter.format(scenario.base)}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-slate-500">{isEn ? 'Optimistic' : 'İyimser'}</dt>
                          <dd className="font-medium tabular-nums text-cyan-300">
                            {moneyFormatter.format(scenario.optimistic)}
                          </dd>
                        </div>
                      </dl>
                      <p className="mt-5 border-t border-slate-800 pt-4 text-sm leading-relaxed text-slate-500">
                        {scenario.comment}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {loading ? messages.scenarioCalculating : messages.scenarioFailed}
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      </section>
    </main>
  )
}
