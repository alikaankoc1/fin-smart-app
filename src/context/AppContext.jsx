import { useMemo, useState } from 'react'
import { AppContext } from './appContext'

export function AppProvider({ children }) {
  const [appName] = useState('Fin Smart App')

  const value = useMemo(() => ({ appName }), [appName])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
