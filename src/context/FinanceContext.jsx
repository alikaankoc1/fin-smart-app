import { useMemo, useState } from 'react'
import { FinanceContext } from './finance-context'

export function FinanceProvider({ children }) {
  const [totalBalance, setTotalBalance] = useState(0)
  const [riskProfile, setRiskProfile] = useState('Dengeli')

  const value = useMemo(
    () => ({
      totalBalance,
      riskProfile,
      setTotalBalance,
      setRiskProfile,
    }),
    [riskProfile, totalBalance],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
