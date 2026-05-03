import { LogOut } from 'lucide-react'
import useLanguage from '../hooks/useLanguage'
import { useAuthUser } from '../hooks/useAuthUser'

export default function AuthUserBar({ onLogout }) {
  const { language } = useLanguage()
  const isEn = language === 'en'
  const { user, loading } = useAuthUser()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/90 bg-slate-950/95 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <div className="min-h-[1.25rem] text-sm text-slate-300">
          {loading ? (
            <span className="text-slate-500">…</span>
          ) : user ? (
            <span>
              {isEn ? 'Hello,' : 'Merhaba,'}{' '}
              <span className="font-medium text-emerald-300">{user.fullName}</span>
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          <LogOut className="size-4" aria-hidden />
          {isEn ? 'Log out' : 'Çıkış'}
        </button>
      </div>
    </header>
  )
}
