import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import MarketBoardPage from './pages/MarketBoardPage'
import MarketTrendPage from './pages/MarketTrendPage'
import TestCommandPage from './pages/TestCommandPage'

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
    isAuthenticated ? (
      activePage === 'test' ? (
        <TestCommandPage
          onBack={() => setActivePage('board')}
          onComplete={() => setActivePage('board')}
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
    )
  )
}

export default App
