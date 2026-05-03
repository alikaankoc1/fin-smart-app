import { useCallback, useMemo, useState } from 'react'
import { FinanceContext } from './finance-context'

export function FinanceProvider({ children }) {
  const [totalBalance, setTotalBalance] = useState(0)
  const [riskProfile, setRiskProfile] = useState('Dengeli')

  const resetFinance = useCallback(() => {
    setTotalBalance(0)
    setRiskProfile('Dengeli')
  }, [])

  const value = useMemo(
    () => ({
      totalBalance,
      riskProfile,
      setTotalBalance,
      setRiskProfile,
      resetFinance,
    }),
    [riskProfile, totalBalance, resetFinance],
  )

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}
