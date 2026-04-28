import { useState } from 'react'
import useFinance from '../hooks/useFinance'

export default function BalanceInput() {
  const [amount, setAmount] = useState('')
  const { totalBalance, updateTotalBalance } = useFinance()

  const handleSubmit = (event) => {
    event.preventDefault()
    updateTotalBalance(amount)
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/30">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="balance"
          className="block text-sm font-medium text-slate-200"
        >
          Yatirim Icin Ayirdiginiz Miktar
        </label>
        <input
          id="balance"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Orn. 15000"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Hesapla
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-400">
        Global bakiye: <span className="font-semibold text-emerald-300">{totalBalance}</span>
      </p>
    </div>
  )
}
