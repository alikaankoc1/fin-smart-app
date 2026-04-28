import { useMemo, useState } from 'react'
import { FinanceContext } from './finance-context'

export function FinanceProvider({ children }) {
  const [totalBalance, setTotalBalance] = useState(0)
  const [investmentPreferences, setInvestmentPreferences] = useState({
    riskLevel: 'Orta',
    investmentHorizon: 'medium-term',
    preferredSectors: [],
  })

  const updateTotalBalance = (newBalance) => {
    setTotalBalance(Number(newBalance) || 0)
  }

  const updateRiskLevel = (riskLevel) => {
    setInvestmentPreferences((prev) => ({
      ...prev,
      riskLevel,
    }))
  }

  const value = useMemo(
    () => ({
      totalBalance,
      investmentPreferences,
      updateTotalBalance,
      updateRiskLevel,
      setInvestmentPreferences,
    }),
    [totalBalance, investmentPreferences],
  )

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}
