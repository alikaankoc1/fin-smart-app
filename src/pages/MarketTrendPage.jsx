import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import {
  buildFallbackHistory,
  fetchInstrumentHistory,
} from '../services/marketHistory'

const periodOptions = [
  { id: '3m', label: 'Son 3 Ay' },
  { id: '6m', label: 'Son 6 Ay' },
]

const intervalOptions = [
  { id: '1d', label: 'Gunluk' },
  { id: '1wk', label: 'Haftalik' },
]

const formatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function buildPath(points, width, height, padding) {
  if (points.length < 2) {
    return ''
  }

  const values = points.map((point) => point.close)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const valueRange = max - min || 1

  return points
    .map((point, index) => {
      const x =
        padding + (index / (points.length - 1)) * (width - padding * 2)
      const normalized = (point.close - min) / valueRange
      const y = height - padding - normalized * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

function getTrendText(first, last) {
  const change = ((last - first) / first) * 100

  if (change > 6) {
    return `Son donemde guclu bir yukselis egilimi var (${change.toFixed(2)}%).`
  }
  if (change > 0) {
    return `Son donemde pozitif ama dengeli bir hareket var (${change.toFixed(
      2,
    )}%).`
  }
  if (change > -6) {
    return `Son donemde sinirli bir geri cekilme goruluyor (${change.toFixed(
      2,
    )}%).`
  }
  return `Son donemde belirgin bir dusus trendi dikkat cekiyor (${change.toFixed(
    2,
  )}%).`
}

export default function MarketTrendPage({ instrument, onBack }) {
  const [range, setRange] = useState('3m')
  const [interval, setInterval] = useState('1d')
  const [series, setSeries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFallbackMode, setIsFallbackMode] = useState(false)

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

  const path = useMemo(() => buildPath(series, 920, 360, 24), [series])
  const first = series[0]?.close ?? 0
  const last = series[series.length - 1]?.close ?? 0
  const trendText = series.length > 1 ? getTrendText(first, last) : ''

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
            Piyasa Ekranina Don
          </button>

          <div className="text-right">
            <h1 className="text-2xl font-bold text-white">{instrument.name} Trendi</h1>
            <p className="text-sm text-slate-400">
              Belirli araliklarda fiyat hareketi analizi
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                range === option.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
          {intervalOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setInterval(option.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                interval === option.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
          {isLoading && <p className="text-sm text-slate-400">Grafik yukleniyor...</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}

          {!isLoading && !error && series.length > 1 && (
            <svg viewBox="0 0 920 360" className="h-auto w-full">
              <polyline
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
                points={path}
              />
            </svg>
          )}
        </div>

        {isFallbackMode && (
          <p className="mt-3 text-xs text-amber-300/90">
            Gecmis veri kaynagina erisim saglanamadigi icin grafik gecici olarak
            guncel fiyat etrafinda olusturulan trend ile gosteriliyor.
          </p>
        )}

        {!isLoading && !error && series.length > 1 && (
          <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
            <p className="mb-1">
              Baslangic: <span className="font-semibold">{formatter.format(first)} TL</span> | Son:{' '}
              <span className="font-semibold">{formatter.format(last)} TL</span>
            </p>
            <p>{trendText}</p>
          </div>
        )}
      </section>
    </main>
  )
}
