import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { fetchMarketBoardData } from '../services/marketData'

const moneyFormatter = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export default function MarketBoardPage() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const data = await fetchMarketBoardData()
      setError('')
      setRows(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Veri alinirken bir hata olustu.')
    }
  }, [])

  const handleRefresh = async () => {
    setIsLoading(true)
    await loadData()
    setIsLoading(false)
  }

  useEffect(() => {
    let isMounted = true

    const initialLoad = async () => {
      await loadData()
      if (isMounted) {
        setIsLoading(false)
      }
    }

    initialLoad()

    const intervalId = setInterval(() => {
      loadData()
    }, 60000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [loadData])

  const lastUpdatedText = useMemo(() => {
    if (!lastUpdated) {
      return '-'
    }
    return lastUpdated.toLocaleTimeString('tr-TR')
  }, [lastUpdated])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <section className="w-full max-w-5xl rounded-3xl border border-emerald-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Canli Alis / Satis Ekrani
            </h1>
            <p className="text-sm text-slate-400">
              Ucretsiz kaynaklardan dakikalik guncellenen piyasa gorunumu
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            <RefreshCw size={16} />
            Yenile
          </button>
        </div>

        <div className="mb-4 text-sm text-slate-400">
          Son guncelleme: <span className="font-semibold text-emerald-300">{lastUpdatedText}</span>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-700">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Varlik
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Alis (TL)
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-rose-300">
                  Satis (TL)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-800 bg-slate-900/70">
                  <td className="px-4 py-3 text-sm font-medium text-slate-200">{row.name}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-300">
                    {moneyFormatter.format(row.buy)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-rose-300">
                    {moneyFormatter.format(row.sell)}
                  </td>
                </tr>
              ))}
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                    Gosterilecek veri bulunamadi.
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-400">
                    Piyasa verileri yukleniyor...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
