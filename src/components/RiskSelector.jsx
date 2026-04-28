import useFinance from '../hooks/useFinance'

const riskOptions = ['Dusuk', 'Orta', 'Yuksek']

export default function RiskSelector() {
  const { investmentPreferences, updateRiskLevel } = useFinance()
  const selectedRisk = investmentPreferences.riskLevel

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl shadow-black/30">
      <h2 className="mb-4 text-center text-lg font-semibold text-white">
        Risk Seviyesi
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {riskOptions.map((risk) => {
          const isActive = selectedRisk === risk
          return (
            <button
              key={risk}
              type="button"
              onClick={() => updateRiskLevel(risk)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {risk}
            </button>
          )
        })}
      </div>
    </section>
  )
}
