import useFinance from '../hooks/useFinance'

const riskOptions = ['Dusuk', 'Orta', 'Yuksek']

export default function RiskSelector() {
  const { investmentPreferences, updateRiskLevel } = useFinance()
  const selectedRisk = investmentPreferences.riskLevel

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/60">
      <h2 className="mb-4 text-center text-lg font-semibold text-slate-900">
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
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
