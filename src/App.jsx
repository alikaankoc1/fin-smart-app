import { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { FinanceProvider } from './context/FinanceContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MarketBoardPage from './pages/MarketBoardPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activePage, setActivePage] = useState('dashboard')

  return (
    <FinanceProvider>
      <AppProvider>
        {isAuthenticated ? (
          <div className="relative">
            <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-900/90 p-1 shadow-lg shadow-black/40 backdrop-blur">
              <button
                type="button"
                onClick={() => setActivePage('dashboard')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activePage === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setActivePage('market')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activePage === 'market'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                Piyasa Ekrani
              </button>
            </div>
            {activePage === 'dashboard' ? <HomePage /> : <MarketBoardPage />}
          </div>
        ) : (
          <LoginPage onLogin={() => setIsAuthenticated(true)} />
        )}
      </AppProvider>
    </FinanceProvider>
  )
}

export default App
