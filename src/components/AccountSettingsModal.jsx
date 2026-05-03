import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import useLanguage from '../hooks/useLanguage'
import { AUTH_TOKEN_KEY } from '../constants/auth'

const copyByLang = {
  tr: {
    title: 'Hesap ayarları',
    accountSection: 'Hesap bilgileri',
    emailLabel: 'E-posta',
    nameLabel: 'Ad Soyad',
    memberSince: 'Üyelik tarihi',
    unknownDate: '—',
    passwordSection: 'Şifre değiştir',
    currentPassword: 'Mevcut şifre',
    newPassword: 'Yeni şifre',
    confirmPassword: 'Yeni şifre (tekrar)',
    savePassword: 'Şifreyi güncelle',
    saving: 'Kaydediliyor…',
    passwordSuccess: 'Şifreniz güncellendi.',
    passwordMismatch: 'Yeni şifreler eşleşmiyor.',
    passwordTooShort: 'Yeni şifre en az 6 karakter olmalıdır.',
    wrongCurrent: 'Mevcut şifre hatalı.',
    genericError: 'İşlem tamamlanamadı.',
    close: 'Kapat',
  },
  en: {
    title: 'Account settings',
    accountSection: 'Account details',
    emailLabel: 'Email',
    nameLabel: 'Full name',
    memberSince: 'Member since',
    unknownDate: '—',
    passwordSection: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    savePassword: 'Update password',
    saving: 'Saving…',
    passwordSuccess: 'Your password was updated.',
    passwordMismatch: 'New passwords do not match.',
    passwordTooShort: 'New password must be at least 6 characters.',
    wrongCurrent: 'Current password is incorrect.',
    genericError: 'Something went wrong.',
    close: 'Close',
  },
}

export default function AccountSettingsModal({ open, onClose, user, onPasswordSuccess }) {
  const { language } = useLanguage()
  const c = copyByLang[language] || copyByLang.tr

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const handleClose = useCallback(() => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setFormError('')
    setFormSuccess('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) {
      return
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  if (!open) {
    return null
  }

  const locale = language === 'en' ? 'en-US' : 'tr-TR'
  const memberSinceText =
    user?.createdAt != null
      ? new Date(user.createdAt).toLocaleString(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : c.unknownDate

  const handleSubmitPassword = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (newPassword.length < 6) {
      setFormError(c.passwordTooShort)
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError(c.passwordMismatch)
      return
    }

    const token = sessionStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      setFormError(c.genericError)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const body = await res.json().catch(() => ({}))

      if (res.status === 401 && body?.error === 'INVALID_CURRENT_PASSWORD') {
        setFormError(c.wrongCurrent)
        return
      }
      if (!res.ok) {
        setFormError(c.genericError)
        return
      }

      setFormSuccess(c.passwordSuccess)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onPasswordSuccess?.()
    } catch {
      setFormError(c.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-settings-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900/95 px-5 py-4 backdrop-blur">
          <h2 id="account-settings-title" className="text-lg font-semibold text-white">
            {c.title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label={c.close}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-8 px-5 py-6">
          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-400/90">
              {c.accountSection}
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">{c.nameLabel}</dt>
                <dd className="font-medium text-slate-100">{user?.fullName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{c.emailLabel}</dt>
                <dd className="break-all font-medium text-slate-100">{user?.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{c.memberSince}</dt>
                <dd className="font-medium text-slate-200">{memberSinceText}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-400/90">
              {c.passwordSection}
            </h3>
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="settings-current-password"
                  className="mb-1 block text-xs font-medium text-slate-400"
                >
                  {c.currentPassword}
                </label>
                <input
                  id="settings-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="settings-new-password"
                  className="mb-1 block text-xs font-medium text-slate-400"
                >
                  {c.newPassword}
                </label>
                <input
                  id="settings-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="settings-confirm-password"
                  className="mb-1 block text-xs font-medium text-slate-400"
                >
                  {c.confirmPassword}
                </label>
                <input
                  id="settings-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>

              {formError ? (
                <p className="text-sm text-rose-400" role="alert">
                  {formError}
                </p>
              ) : null}
              {formSuccess ? (
                <p className="text-sm text-emerald-400" role="status">
                  {formSuccess}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {submitting ? c.saving : c.savePassword}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
