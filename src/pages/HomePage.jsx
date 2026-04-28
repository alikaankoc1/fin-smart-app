import BalanceInput from '../components/BalanceInput'
import InvestmentList from '../components/InvestmentList'
import RiskSelector from '../components/RiskSelector'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-6 px-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Fin Smart App Baslangici
        </h1>
        <p className="text-slate-600">
          Vite + React + Tailwind + Lucide + React Hook Form kurulumu hazir.
        </p>
      </div>
      <BalanceInput />
      <RiskSelector />
      <InvestmentList />
    </main>
  )
}
