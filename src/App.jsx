import { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { FinanceProvider } from './context/FinanceContext'
import LoginPage from './pages/LoginPage'
import MarketBoardPage from './pages/MarketBoardPage'
import MarketTrendPage from './pages/MarketTrendPage'
import TestCommandPage from './pages/TestCommandPage'
import HomePage from './pages/HomePage'

const AUTH_STORAGE_KEY = 'fin-smart-authenticated'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  })
  const [selectedInstrument, setSelectedInstrument] = useState(null)
  const [activePage, setActivePage] = useState('board')

  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  }

  return (
    <FinanceProvider>
      <AppProvider>
        {isAuthenticated ? (
          activePage === 'dashboard' ? (
            <HomePage />
          ) : activePage === 'test' ? (
            <TestCommandPage
              onBack={() => setActivePage('board')}
              onComplete={() => setActivePage('dashboard')}
            />
          ) : selectedInstrument ? (
            <MarketTrendPage
              instrument={selectedInstrument}
              onBack={() => setSelectedInstrument(null)}
            />
          ) : (
            <MarketBoardPage
              onSelectInstrument={setSelectedInstrument}
              onGoTestPage={() => setActivePage('test')}
            />
          )
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </AppProvider>
    </FinanceProvider>
  )
}

export default App
