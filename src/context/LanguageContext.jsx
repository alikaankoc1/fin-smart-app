import { useMemo, useState } from 'react'
import { LanguageContext } from './language-context'

const LANGUAGE_KEY = 'fin-smart-language'

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    return saved === 'en' ? 'en' : 'tr'
  })

  const setLanguage = (nextLanguage) => {
    const safe = nextLanguage === 'en' ? 'en' : 'tr'
    setLanguageState(safe)
    localStorage.setItem(LANGUAGE_KEY, safe)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
