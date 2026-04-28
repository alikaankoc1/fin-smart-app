import { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { FinanceProvider } from './context/FinanceContext'
import LoginPage from './pages/LoginPage'
import MarketBoardPage from './pages/MarketBoardPage'
import MarketTrendPage from './pages/MarketTrendPage'

const AUTH_STORAGE_KEY = 'fin-smart-authenticated'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  })
  const [selectedInstrument, setSelectedInstrument] = useState(null)

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  }

  return (
    <FinanceProvider>
      <AppProvider>
        {isAuthenticated ? (
          selectedInstrument ? (
            <MarketTrendPage
              instrument={selectedInstrument}
              onBack={() => setSelectedInstrument(null)}
            />
          ) : (
            <MarketBoardPage onSelectInstrument={setSelectedInstrument} />
          )
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </AppProvider>
    </FinanceProvider>
  )
}

export default App
