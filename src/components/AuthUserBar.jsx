import { useEffect, useRef, useState } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import useLanguage from '../hooks/useLanguage'
import { useAuthUser } from '../hooks/useAuthUser'

export default function AuthUserBar({ onLogout }) {
  const { language } = useLanguage()
  const isEn = language === 'en'
  const { user, loading } = useAuthUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) {
      return
    }
    const onDocPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDocPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    onLogout()
  }

  const menuLabel = isEn ? 'Account menu' : 'Hesap menüsü'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl justify-end px-4 py-2">
        <div ref={wrapRef} className="relative">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={menuLabel}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-10 items-center justify-center rounded-full border border-slate-600 bg-slate-900 text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="size-4 animate-pulse rounded-full bg-slate-600" aria-hidden />
            ) : (
              <UserRound className="size-5" aria-hidden />
            )}
          </button>

          {menuOpen ? (
            <div
              role="menu"
              aria-label={menuLabel}
              className="absolute right-0 mt-2 min-w-[200px] rounded-xl border border-slate-700 bg-slate-900 py-2 shadow-xl shadow-black/40 ring-1 ring-white/5"
            >
              {user ? (
                <div className="border-b border-slate-800 px-3 pb-2 pt-1">
                  <p className="truncate text-sm font-medium text-slate-100">{user.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
              >
                <LogOut className="size-4 shrink-0 text-slate-400" aria-hidden />
                {isEn ? 'Log out' : 'Çıkış yap'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
