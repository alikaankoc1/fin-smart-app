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
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="balance"
          className="block text-sm font-medium text-slate-700"
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
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-500"
        >
          Hesapla
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Global bakiye: <span className="font-semibold text-slate-900">{totalBalance}</span>
      </p>
    </div>
  )
}
