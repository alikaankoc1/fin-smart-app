import useFinance from '../hooks/useFinance'

const allocationByRisk = {
  Dusuk: [
    { id: 'deposit', name: 'Mevduat', ratio: 0.4 },
    { id: 'gold', name: 'Altin', ratio: 0.22 },
    { id: 'stock', name: 'Hisse Senedi', ratio: 0.15 },
    { id: 'crypto', name: 'Kripto', ratio: 0.08 },
    { id: 'usd', name: 'Dolar', ratio: 0.08 },
    { id: 'eur', name: 'Euro', ratio: 0.07 },
  ],
  Orta: [
    { id: 'deposit', name: 'Mevduat', ratio: 0.25 },
    { id: 'gold', name: 'Altin', ratio: 0.2 },
    { id: 'stock', name: 'Hisse Senedi', ratio: 0.2 },
    { id: 'crypto', name: 'Kripto', ratio: 0.15 },
    { id: 'usd', name: 'Dolar', ratio: 0.1 },
    { id: 'eur', name: 'Euro', ratio: 0.1 },
  ],
  Yuksek: [
    { id: 'deposit', name: 'Mevduat', ratio: 0.12 },
    { id: 'gold', name: 'Altin', ratio: 0.15 },
    { id: 'stock', name: 'Hisse Senedi', ratio: 0.3 },
    { id: 'crypto', name: 'Kripto', ratio: 0.25 },
    { id: 'usd', name: 'Dolar', ratio: 0.1 },
    { id: 'eur', name: 'Euro', ratio: 0.08 },
  ],
}

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

export default function InvestmentList() {
  const { totalBalance, investmentPreferences } = useFinance()
  const riskLevel = investmentPreferences.riskLevel
  const allocationRules = allocationByRisk[riskLevel] ?? allocationByRisk.Orta

  const plans = allocationRules.map((rule) => ({
    ...rule,
    amount: totalBalance * rule.ratio,
  }))

  return (
    <section className="w-full max-w-4xl space-y-3">
      <h2 className="text-center text-xl font-semibold text-slate-900">
        Akilli Yatirim Dagilimi
      </h2>
      <p className="text-center text-sm text-slate-600">
        Secili risk seviyesi: <span className="font-semibold">{riskLevel}</span>
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/60"
          >
            <p className="text-sm text-slate-500">{plan.name}</p>
            <p className="mt-2 text-lg font-bold text-slate-900">
              {currencyFormatter.format(plan.amount)}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
