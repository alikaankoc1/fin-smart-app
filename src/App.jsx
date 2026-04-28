import { useState } from 'react'
import { AppProvider } from './context/AppContext.jsx'
import { FinanceProvider } from './context/FinanceContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <FinanceProvider>
      <AppProvider>
        {isAuthenticated ? (
          <HomePage />
        ) : (
          <LoginPage onLogin={() => setIsAuthenticated(true)} />
        )}
      </AppProvider>
    </FinanceProvider>
  )
}

export default App
