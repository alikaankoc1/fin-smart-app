import useLanguage from '../hooks/useLanguage'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900/70 p-1">
      <button
        type="button"
        onClick={() => setLanguage('tr')}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
          language === 'tr'
            ? 'bg-emerald-500 text-slate-950'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
      >
        TR
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
          language === 'en'
            ? 'bg-emerald-500 text-slate-950'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
      >
        EN
      </button>
    </div>
  )
}
