import BalanceInput from '../components/BalanceInput'
import InvestmentList from '../components/InvestmentList'
import RiskSelector from '../components/RiskSelector'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 rounded-3xl border border-emerald-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
          Fin Smart App Baslangici
          </h1>
          <p className="text-slate-300">
            Vite + React + Tailwind + Lucide + React Hook Form kurulumu hazir.
          </p>
        </div>
        <BalanceInput />
        <RiskSelector />
        <InvestmentList />
      </div>
    </main>
  )
}
