import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { getStatusMessages } from '../copy/statusMessages'
import LanguageSwitcher from '../components/LanguageSwitcher'
import useLanguage from '../hooks/useLanguage'
import {
  buildFallbackHistory,
  fetchInstrumentHistory,
} from '../services/marketHistory'

const periodOptions = [
  { id: '3m', label: 'Son 3 Ay' },
  { id: '6m', label: 'Son 6 Ay' },
]

const intervalOptions = [
  { id: '1d', label: 'Günlük' },
  { id: '1wk', label: 'Haftalık' },
]

const formatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const chartWidth = 920
const chartHeight = 360
const chartPadding = { top: 20, right: 20, bottom: 44, left: 80 }
const yTickCount = 5
const xTickCount = 5
const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: '2-digit',
})

function buildPath(points) {
  if (points.length < 2) {
    return ''
  }

  return points
    .map((point) => `${point.x},${point.y}`)
    .join(' ')
}

function getTrendText(first, last, isEn = false) {
  const change = ((last - first) / first) * 100

  if (change > 6) {
    return isEn
      ? `Strong upward momentum in recent period (${change.toFixed(2)}%).`
      : `Son dönemde güçlü bir yükseliş eğilimi var (${change.toFixed(2)}%).`
  }
  if (change > 0) {
    return isEn
      ? `Positive but balanced movement in recent period (${change.toFixed(2)}%).`
      : `Son dönemde pozitif ama dengeli bir hareket var (${change.toFixed(2)}%).`
  }
  if (change > -6) {
    return isEn
      ? `Limited pullback observed in recent period (${change.toFixed(2)}%).`
      : `Son dönemde sınırlı bir geri çekilme görülüyor (${change.toFixed(2)}%).`
  }
  return isEn
    ? `Notable downtrend in recent period (${change.toFixed(2)}%).`
    : `Son dönemde belirgin bir düşüş trendi dikkat çekiyor (${change.toFixed(2)}%).`
}

function buildChartModel(series) {
  if (series.length < 2) {
    return null
  }

  const values = series.map((point) => point.close)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const diff = rawMax - rawMin
  const margin = diff > 0 ? diff * 0.12 : Math.max(rawMax * 0.02, 0.5)
  const min = Math.max(0, rawMin - margin)
  const max = rawMax + margin
  const valueRange = max - min || 1
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom

  const points = series.map((point, index) => {
    const x = chartPadding.left + (index / (series.length - 1)) * plotWidth
    const normalized = (point.close - min) / valueRange
    const y = chartHeight - chartPadding.bottom - normalized * plotHeight
    return { ...point, x, y }
  })

  const yTicks = Array.from({ length: yTickCount }, (_, index) => {
    const ratio = index / (yTickCount - 1)
    const value = max - ratio * valueRange
    const y = chartPadding.top + ratio * plotHeight
    return { value, y }
  })

  const xTicks = Array.from({ length: xTickCount }, (_, index) => {
    const pointIndex = Math.round((index / (xTickCount - 1)) * (series.length - 1))
    const point = points[pointIndex]
    return {
      x: point.x,
      label: dateFormatter.format(new Date(point.timestamp * 1000)),
    }
  })

  return { points, yTicks, xTicks, min, max }
}

export default function MarketTrendPage({ instrument, onBack }) {
  const { language } = useLanguage()
  const isEn = language === 'en'
  const messages = useMemo(() => getStatusMessages(language), [language])
  const [range, setRange] = useState('3m')
  const [interval, setInterval] = useState('1d')
  const [activeFilter, setActiveFilter] = useState('range:3m')
  const [series, setSeries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setIsLoading(true)
      try {
        const history = await fetchInstrumentHistory(instrument.id, range, interval)
        if (mounted) {
          setSeries(history)
          setError('')
          setIsFallbackMode(false)
        }
      } catch {
        if (mounted) {
          const basePrice = (instrument.buy + instrument.sell) / 2
          const fallbackSeries = buildFallbackHistory(range, interval, basePrice)
          setSeries(fallbackSeries)
          setIsFallbackMode(true)
          setError('')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [instrument.id, instrument.buy, instrument.sell, range, interval])

  const chartModel = useMemo(() => buildChartModel(series), [series])
  const path = useMemo(
    () => (chartModel ? buildPath(chartModel.points) : ''),
    [chartModel],
  )
  const areaPath = useMemo(() => {
    if (!chartModel || chartModel.points.length < 2) {
      return ''
    }
    const firstPoint = chartModel.points[0]
    const lastPoint = chartModel.points[chartModel.points.length - 1]
    return `${path} ${lastPoint.x},${chartHeight - chartPadding.bottom} ${firstPoint.x},${chartHeight - chartPadding.bottom}`
  }, [chartModel, path])
  const first = series[0]?.close ?? 0
  const last = series[series.length - 1]?.close ?? 0
  const trendText = series.length > 1 ? getTrendText(first, last, isEn) : ''
  const activePoint = chartModel
    ? chartModel.points[hoverIndex ?? chartModel.points.length - 1]
    : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <section className="w-full max-w-6xl rounded-3xl border border-emerald-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            {isEn ? 'Back To Market' : 'Piyasa Ekranına Dön'}
          </button>
          <LanguageSwitcher />

          <div className="text-right">
            <h1 className="text-2xl font-bold text-white">{instrument.name} Trendi</h1>
            <p className="text-sm text-slate-400">
              {isEn
                ? 'Price movement analysis across selected ranges'
                : 'Belirli aralıklarda fiyat hareketi analizi'}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setRange(option.id)
                setActiveFilter(`range:${option.id}`)
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                activeFilter === `range:${option.id}`
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isEn
                ? option.id === '3m'
                  ? 'Last 3 Months'
                  : 'Last 6 Months'
                : option.label}
            </button>
          ))}
          {intervalOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setInterval(option.id)
                setActiveFilter(`interval:${option.id}`)
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                activeFilter === `interval:${option.id}`
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isEn
                ? option.id === '1d'
                  ? 'Daily'
                  : 'Weekly'
                : option.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
          {isLoading && (
            <p className="text-sm text-slate-400">{messages.loadingChart}</p>
          )}
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {!isLoading && !error && chartModel && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm">
                <span className="text-slate-400">{isEn ? 'Selected Point' : 'Seçili Nokta'}</span>
                <span className="font-semibold text-emerald-300">
                  {dateFormatter.format(new Date(activePoint.timestamp * 1000))}
                </span>
                <span className="font-semibold text-white">
                  {formatter.format(activePoint.close)} TL
                </span>
              </div>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-auto w-full"
                onMouseLeave={() => setHoverIndex(null)}
              >
                {chartModel.yTicks.map((tick) => (
                  <g key={`y-${tick.y}`}>
                    <line
                      x1={chartPadding.left}
                      y1={tick.y}
                      x2={chartWidth - chartPadding.right}
                      y2={tick.y}
                      stroke="#1f2937"
                      strokeWidth="1"
                    />
                    <text
                      x={chartPadding.left - 10}
                      y={tick.y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[11px]"
                    >
                      {formatter.format(tick.value)}
                    </text>
                  </g>
                ))}

                {chartModel.xTicks.map((tick) => (
                  <g key={`x-${tick.x}`}>
                    <line
                      x1={tick.x}
                      y1={chartPadding.top}
                      x2={tick.x}
                      y2={chartHeight - chartPadding.bottom}
                      stroke="#111827"
                      strokeWidth="1"
                    />
                    <text
                      x={tick.x}
                      y={chartHeight - chartPadding.bottom + 20}
                      textAnchor="middle"
                      className="fill-slate-400 text-[11px]"
                    >
                      {tick.label}
                    </text>
                  </g>
                ))}

                <path d={areaPath} fill="url(#trend-area)" opacity="0.35" />
                <polyline fill="none" stroke="#34d399" strokeWidth="3" points={path} />

                {chartModel.points.map((point, index) => {
                  const isActive = activePoint.timestamp === point.timestamp
                  return (
                    <circle
                      key={point.timestamp}
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 4.5 : 3}
                      fill={isActive ? '#86efac' : '#34d399'}
                      stroke={isActive ? '#064e3b' : 'none'}
                      strokeWidth={isActive ? 2 : 0}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverIndex(index)}
                    />
                  )
                })}

                <defs>
                  <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}

          {!isLoading && !error && !chartModel && (
            <p className="text-sm text-slate-400">{messages.chartInsufficient}</p>
          )}
        </div>

        {isFallbackMode && (
          <p className="mt-3 text-xs text-amber-300/90">{messages.historyFallback}</p>
        )}

        {!isLoading && !error && series.length > 1 && (
          <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            <p className="mb-1">
              {isEn ? 'Start' : 'Baslangic'}:{' '}
              <span className="font-semibold">{formatter.format(first)} TL</span> |{' '}
              {isEn ? 'End' : 'Son'}:{' '}
              <span className="font-semibold">{formatter.format(last)} TL</span>
            </p>
            <p>{trendText}</p>
          </div>
        )}
      </section>
    </main>
  )
}
