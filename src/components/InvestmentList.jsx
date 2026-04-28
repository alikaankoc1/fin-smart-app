import useFinance from '../hooks/useFinance'

const allocationRules = [
  { id: 'deposit', name: 'Mevduat', ratio: 0.4 },
  { id: 'gold', name: 'Altin', ratio: 0.3 },
  { id: 'stock', name: 'Hisse Senedi', ratio: 0.2 },
  { id: 'crypto', name: 'Kripto', ratio: 0.1 },
]

const currencyFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

export default function InvestmentList() {
  const { totalBalance } = useFinance()

  const plans = allocationRules.map((rule) => ({
    ...rule,
    amount: totalBalance * rule.ratio,
  }))

  return (
    <section className="w-full max-w-4xl space-y-3">
      <h2 className="text-center text-xl font-semibold text-slate-900">
        Akilli Yatirim Dagilimi
      </h2>
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
