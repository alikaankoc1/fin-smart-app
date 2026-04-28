import { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { FinanceProvider } from './context/FinanceContext'
import LoginPage from './pages/LoginPage'
import MarketBoardPage from './pages/MarketBoardPage'

const AUTH_STORAGE_KEY = 'fin-smart-authenticated'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  })

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  }

  return (
    <FinanceProvider>
      <AppProvider>
        {isAuthenticated ? (
          <MarketBoardPage />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </AppProvider>
    </FinanceProvider>
  )
}

export default App
