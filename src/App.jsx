import { useEffect, useState } from 'react'
import AuthUserBar from './components/AuthUserBar'
import { AUTH_TOKEN_KEY } from './constants/auth'
import { FinanceProvider } from './context/FinanceContext'
import { LanguageProvider } from './context/LanguageContext'
import LoginPage from './pages/LoginPage'
import MarketBoardPage from './pages/MarketBoardPage'
import MarketTrendPage from './pages/MarketTrendPage'
import RecommendationResult from './pages/RecommendationResult'
import TestCommandPage from './pages/TestCommandPage'

const PAGE_HASH = {
  login: '#/login',
  board: '#/board',
  trend: '#/trend',
  test: '#/test',
  recommendation: '#/recommendation',
}

function getPageFromHash() {
  const hash = window.location.hash
  return (
    Object.keys(PAGE_HASH).find((key) => PAGE_HASH[key] === hash) || 'login'
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedInstrument, setSelectedInstrument] = useState(null)
  const [activePage, setActivePage] = useState('login')

  useEffect(() => {
    window.history.replaceState({ page: 'login' }, '', PAGE_HASH.login)

    const handlePopState = (event) => {
      const targetPage = event.state?.page || getPageFromHash()
      setActivePage(targetPage)

      if (targetPage === 'login') {
        setIsAuthenticated(false)
        setSelectedInstrument(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateTo = (page) => {
    const safePage = PAGE_HASH[page] ? page : 'login'
    window.history.pushState({ page: safePage }, '', PAGE_HASH[safePage])
    setActivePage(safePage)
  }

  const handleLogin = () => {
    setIsAuthenticated(true)
    navigateTo('board')
  }

  const handleLogout = async () => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        /* ignore network errors; still clear client session */
      }
    }
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    setIsAuthenticated(false)
    setSelectedInstrument(null)
    window.history.replaceState({ page: 'login' }, '', PAGE_HASH.login)
    setActivePage('login')
  }

  const handleOpenTrend = (instrument) => {
    setSelectedInstrument(instrument)
    navigateTo('trend')
  }

  const handleBackToBoard = () => {
    setSelectedInstrument(null)
    navigateTo('board')
  }

  return (
    <LanguageProvider>
      <FinanceProvider>
        {!isAuthenticated ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            <AuthUserBar onLogout={handleLogout} />
            {activePage === 'test' ? (
              <TestCommandPage
                onBack={handleBackToBoard}
                onComplete={() => navigateTo('recommendation')}
              />
            ) : activePage === 'recommendation' ? (
              <RecommendationResult onBack={handleBackToBoard} />
            ) : activePage === 'trend' && selectedInstrument ? (
              <MarketTrendPage
                instrument={selectedInstrument}
                onBack={handleBackToBoard}
              />
            ) : (
              <MarketBoardPage
                onSelectInstrument={handleOpenTrend}
                onGoTestPage={() => navigateTo('test')}
              />
            )}
          </>
        )}
      </FinanceProvider>
    </LanguageProvider>
  )
}

export default App
