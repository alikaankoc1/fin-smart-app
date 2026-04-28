import { useEffect, useState } from 'react'

export default function useTheme(initialTheme = 'light') {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return { theme, setTheme }
}
