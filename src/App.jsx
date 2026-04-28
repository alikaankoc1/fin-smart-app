import { AppProvider } from './context/AppContext.jsx'
import { FinanceProvider } from './context/FinanceContext'
import HomePage from './pages/HomePage'

function App() {
  return (
    <FinanceProvider>
      <AppProvider>
        <HomePage />
      </AppProvider>
    </FinanceProvider>
  )
}

export default App
