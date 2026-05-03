import { useEffect, useRef, useState } from 'react'
import { LogOut, Settings, UserRound } from 'lucide-react'
import AccountSettingsModal from './AccountSettingsModal'
import useLanguage from '../hooks/useLanguage'
import { useAuthUser } from '../hooks/useAuthUser'

const logoutCopy = {
  tr: {
    logoutTitle: 'Çıkış yap?',
    logoutBody: 'Oturumunuzu sonlandırmak istediğinize emin misiniz?',
    logoutCancel: 'İptal',
    logoutConfirm: 'Çıkış yap',
  },
  en: {
    logoutTitle: 'Sign out?',
    logoutBody: 'Are you sure you want to end your session?',
    logoutCancel: 'Cancel',
    logoutConfirm: 'Sign out',
  },
}

export default function AuthUserBar({ onLogout }) {
  const { language } = useLanguage()
  const isEn = language === 'en'
  const lc = logoutCopy[language] || logoutCopy.tr
  const { user, loading, refetch } = useAuthUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [logoutPromptOpen, setLogoutPromptOpen] = useState(false)
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

  useEffect(() => {
    if (!logoutPromptOpen) {
      return
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setLogoutPromptOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [logoutPromptOpen])

  const requestLogout = () => {
    setMenuOpen(false)
    setLogoutPromptOpen(true)
  }

  const cancelLogout = () => setLogoutPromptOpen(false)

  const performLogout = () => {
    setLogoutPromptOpen(false)
    window.setTimeout(() => {
      onLogout()
    }, 220)
  }

  const openSettings = () => {
    setMenuOpen(false)
    setSettingsOpen(true)
  }

  const menuLabel = isEn ? 'Account menu' : 'Hesap menüsü'

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-sm">
        <div className="flex w-full justify-end pr-3 sm:pr-8 md:pr-12 lg:pr-16">
          <div ref={wrapRef} className="relative py-2">
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
                className="absolute right-0 mt-2 min-w-[220px] rounded-xl border border-slate-700 bg-slate-900 py-2 shadow-xl shadow-black/40 ring-1 ring-white/5"
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
                  onClick={openSettings}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  <Settings className="size-4 shrink-0 text-slate-400" aria-hidden />
                  {isEn ? 'Account settings' : 'Hesap ayarları'}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={requestLogout}
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

      <AccountSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onPasswordSuccess={refetch}
      />

      {logoutPromptOpen ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm transition-opacity duration-200"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          aria-describedby="logout-confirm-desc"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelLogout()
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl ring-1 ring-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-confirm-title" className="text-lg font-semibold text-white">
              {lc.logoutTitle}
            </h2>
            <p id="logout-confirm-desc" className="mt-2 text-sm leading-relaxed text-slate-400">
              {lc.logoutBody}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelLogout}
                className="rounded-xl border border-slate-600 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                {lc.logoutCancel}
              </button>
              <button
                type="button"
                onClick={performLogout}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                {lc.logoutConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
