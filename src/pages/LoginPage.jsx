import { useState } from 'react'
import { Info, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import LanguageSwitcher from '../components/LanguageSwitcher'
import useLanguage from '../hooks/useLanguage'

const copyByLanguage = {
  tr: {
    welcomeTitle: 'Akıllı yatırım planlamaya hoş geldiniz',
    welcomeBody:
      'Fin Smart App, bakiyenizi risk seviyenize göre dağıtmanıza yardımcı olur. Giriş yapın veya üye olun; ardından tutarınızı girin, risk tercihinizi seçin.',
    login: 'Giriş Yap',
    register: 'Üye Ol',
    continueSignIn: 'E-posta ve şifreniz ile devam edin.',
    continueSignUp: 'Ücretsiz hesap oluşturun; birkaç saniye sürer.',
    email: 'E-posta',
    password: 'Şifre',
    fullName: 'Ad Soyad',
    submitSignIn: 'Giriş Yap',
    submitSignUp: 'Kayıt Ol',
    emailRequired: 'E-posta zorunludur.',
    emailInvalid: 'Geçerli bir e-posta girin.',
    passwordRequired: 'Şifre zorunludur.',
    passwordLength: 'Şifre en az 6 karakter olmalıdır.',
    nameRequired: 'Ad soyad zorunludur.',
    emailPlaceholder: 'ornek@mail.com',
    namePlaceholder: 'Adınız Soyadınız',
    panelNewTitle: 'Yeni misiniz?',
    panelNewBody:
      'Hesap oluşturarak risk profili testine ve kişisel önerilere hemen başlayın.',
    panelExistingTitle: 'Zaten üye misiniz?',
    panelExistingBody: 'Mevcut hesabınızla giriş yaparak kaldığınız yerden devam edin.',
    goRegister: 'Üye Ol',
    goLogin: 'Giriş Yap',
    mobileTabLogin: 'Giriş',
    mobileTabRegister: 'Üye Ol',
    disclaimerBadge: 'Akademik demo',
    disclaimerText:
      'Bu uygulama Dumlupınar Üniversitesi Bilgisayar Mühendisliği bitirme projesi kapsamında geliştirilmiştir. Gösterilen veriler ve öneriler yalnızca öğrenme ve sunum amaçlıdır; gerçek yatırım tavsiyesi değildir ve ticari karar için kullanılmamalıdır.',
  },
  en: {
    welcomeTitle: 'Welcome to smart investment planning',
    welcomeBody:
      'Fin Smart App helps you distribute your balance by risk profile. Sign in or create an account, then enter your amount and choose your risk profile.',
    login: 'Sign In',
    register: 'Sign Up',
    continueSignIn: 'Continue with your email and password.',
    continueSignUp: 'Create a free account—it only takes a moment.',
    email: 'Email',
    password: 'Password',
    fullName: 'Full name',
    submitSignIn: 'Sign In',
    submitSignUp: 'Sign Up',
    emailRequired: 'Email is required.',
    emailInvalid: 'Enter a valid email address.',
    passwordRequired: 'Password is required.',
    passwordLength: 'Password must be at least 6 characters.',
    nameRequired: 'Full name is required.',
    emailPlaceholder: 'example@mail.com',
    namePlaceholder: 'Your name',
    panelNewTitle: 'New here?',
    panelNewBody:
      'Create an account to start the risk profile test and get personalized guidance.',
    panelExistingTitle: 'Already a member?',
    panelExistingBody: 'Sign in with your email and password to continue.',
    goRegister: 'Sign Up',
    goLogin: 'Sign In',
    mobileTabLogin: 'Sign In',
    mobileTabRegister: 'Sign Up',
    disclaimerBadge: 'Academic demo',
    disclaimerText:
      'Built as a graduation project for the Computer Engineering program at Dumlupınar University. All content is for demonstration and educational purposes only; it is not investment advice and must not be used for trading or commercial decisions.',
  },
}

const inputClass =
  'w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30'

export default function LoginPage({ onLogin }) {
  const { language } = useLanguage()
  const copy = copyByLanguage[language] || copyByLanguage.tr
  const [panel, setPanel] = useState('register')

  const signInForm = useForm({
    defaultValues: { email: '', password: '' },
  })

  const signUpForm = useForm({
    defaultValues: { fullName: '', email: '', password: '' },
  })

  const submitSignIn = () => {
    onLogin()
  }

  const submitSignUp = () => {
    onLogin()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex w-fit rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Fin Smart App
          </span>
          <LanguageSwitcher />
        </div>

        <aside
          role="note"
          aria-label={copy.disclaimerBadge}
          className="rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 to-amber-600/10 px-4 py-3.5 shadow-lg shadow-amber-950/20 md:px-5 md:py-4"
        >
          <div className="flex gap-3 md:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/25">
              <Info className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-200/95 md:text-xs">
                {copy.disclaimerBadge}
              </p>
              <p className="text-sm leading-relaxed text-amber-50/95 md:text-[15px]">
                {copy.disclaimerText}
              </p>
            </div>
          </div>
        </aside>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,640px)] lg:items-start">
          <section className="flex flex-col justify-center space-y-4 lg:pr-4">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              {copy.welcomeTitle}
            </h1>
            <p className="text-slate-300">{copy.welcomeBody}</p>
          </section>

          <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
            <div className="grid min-h-[min(560px,85vh)] md:grid-cols-2">
              {/* Karşı panel — videodaki CTA; sabit sütun, metin moda göre değişir */}
              <div className="relative flex min-h-[200px] flex-col justify-center bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 p-8 text-white md:min-h-full">
                <div
                  key={panel}
                  className="relative z-10 mx-auto max-w-xs space-y-4 text-center transition-opacity duration-500"
                >
                  {panel === 'login' ? (
                    <>
                      <h2 className="text-2xl font-bold">{copy.panelNewTitle}</h2>
                      <p className="text-sm leading-relaxed text-emerald-100/90">
                        {copy.panelNewBody}
                      </p>
                      <button
                        type="button"
                        data-testid="promo-go-register"
                        onClick={() => setPanel('register')}
                        className="w-full rounded-xl border-2 border-white/90 bg-transparent px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                      >
                        {copy.goRegister}
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{copy.panelExistingTitle}</h2>
                      <p className="text-sm leading-relaxed text-emerald-100/90">
                        {copy.panelExistingBody}
                      </p>
                      <button
                        type="button"
                        data-testid="promo-go-login"
                        onClick={() => setPanel('login')}
                        className="w-full rounded-xl border-2 border-white/90 bg-transparent px-4 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                      >
                        {copy.goLogin}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Form kolonu — yatay kaydırmalı geçiş */}
              <div className="relative flex flex-col justify-center overflow-hidden bg-slate-900 p-7 md:p-8">
                <div className="mb-4 flex gap-2 md:hidden">
                  <button
                    type="button"
                    onClick={() => setPanel('login')}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                      panel === 'login'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {copy.mobileTabLogin}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanel('register')}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                      panel === 'register'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {copy.mobileTabRegister}
                  </button>
                </div>

                <div className="relative min-h-[380px] overflow-hidden">
                  <div
                    className={`flex h-full w-[200%] transition-transform duration-500 ease-out motion-reduce:transition-none ${
                      panel === 'register' ? '-translate-x-1/2' : 'translate-x-0'
                    }`}
                  >
                    {/* Giriş */}
                    <div className="w-1/2 shrink-0 pr-3">
                      <h2 className="mb-1.5 text-2xl font-semibold text-white">{copy.login}</h2>
                      <p className="mb-6 text-base leading-relaxed text-slate-300">
                        {copy.continueSignIn}
                      </p>
                      <form
                        onSubmit={signInForm.handleSubmit(submitSignIn)}
                        className="space-y-5"
                      >
                        <div>
                          <label
                            htmlFor="signin-email"
                            className="mb-1.5 block text-[15px] font-medium text-slate-100"
                          >
                            {copy.email}
                          </label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                            <input
                              id="signin-email"
                              type="email"
                              autoComplete="email"
                              placeholder={copy.emailPlaceholder}
                              className={inputClass}
                              {...signInForm.register('email', {
                                required: copy.emailRequired,
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: copy.emailInvalid,
                                },
                              })}
                            />
                          </div>
                          {signInForm.formState.errors.email && (
                            <p className="mt-1 text-xs text-rose-400">
                              {signInForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="signin-password"
                            className="mb-1.5 block text-[15px] font-medium text-slate-100"
                          >
                            {copy.password}
                          </label>
                          <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                            <input
                              id="signin-password"
                              type="password"
                              autoComplete="current-password"
                              placeholder="••••••••"
                              className={inputClass}
                              {...signInForm.register('password', {
                                required: copy.passwordRequired,
                                minLength: {
                                  value: 6,
                                  message: copy.passwordLength,
                                },
                              })}
                            />
                          </div>
                          {signInForm.formState.errors.password && (
                            <p className="mt-1 text-xs text-rose-400">
                              {signInForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400"
                        >
                          {copy.submitSignIn}
                        </button>
                      </form>
                    </div>

                    {/* Üye ol */}
                    <div className="w-1/2 shrink-0 pl-3">
                      <h2 className="mb-1.5 text-2xl font-semibold text-white">{copy.register}</h2>
                      <p className="mb-6 text-base leading-relaxed text-slate-300">
                        {copy.continueSignUp}
                      </p>
                      <form
                        onSubmit={signUpForm.handleSubmit(submitSignUp)}
                        className="space-y-5"
                      >
                        <div>
                          <label
                            htmlFor="signup-name"
                            className="mb-1.5 block text-[15px] font-medium text-slate-100"
                          >
                            {copy.fullName}
                          </label>
                          <div className="relative">
                            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                            <input
                              id="signup-name"
                              type="text"
                              autoComplete="name"
                              placeholder={copy.namePlaceholder}
                              className={inputClass}
                              {...signUpForm.register('fullName', {
                                required: copy.nameRequired,
                                minLength: { value: 2, message: copy.nameRequired },
                              })}
                            />
                          </div>
                          {signUpForm.formState.errors.fullName && (
                            <p className="mt-1 text-xs text-rose-400">
                              {signUpForm.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="signup-email"
                            className="mb-1.5 block text-[15px] font-medium text-slate-100"
                          >
                            {copy.email}
                          </label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                            <input
                              id="signup-email"
                              type="email"
                              autoComplete="email"
                              placeholder={copy.emailPlaceholder}
                              className={inputClass}
                              {...signUpForm.register('email', {
                                required: copy.emailRequired,
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: copy.emailInvalid,
                                },
                              })}
                            />
                          </div>
                          {signUpForm.formState.errors.email && (
                            <p className="mt-1 text-xs text-rose-400">
                              {signUpForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor="signup-password"
                            className="mb-1.5 block text-[15px] font-medium text-slate-100"
                          >
                            {copy.password}
                          </label>
                          <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                            <input
                              id="signup-password"
                              type="password"
                              autoComplete="new-password"
                              placeholder="••••••••"
                              className={inputClass}
                              {...signUpForm.register('password', {
                                required: copy.passwordRequired,
                                minLength: {
                                  value: 6,
                                  message: copy.passwordLength,
                                },
                              })}
                            />
                          </div>
                          {signUpForm.formState.errors.password && (
                            <p className="mt-1 text-xs text-rose-400">
                              {signUpForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400"
                        >
                          {copy.submitSignUp}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
