import { LockKeyhole, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'

export default function LoginPage({ onLogin }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const submitForm = () => {
    onLogin()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 rounded-3xl border border-emerald-200/20 bg-slate-900/70 p-6 shadow-2xl shadow-black/40 backdrop-blur md:grid-cols-2 md:p-10">
        <section className="flex flex-col justify-center space-y-4">
          <span className="inline-flex w-fit rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Fin Smart App
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Akilli yatirim planlamaya hos geldiniz
          </h1>
          <p className="text-slate-300">
            Fin Smart App, bakiyenizi risk seviyenize gore dagitmaniza yardimci
            olur. Giris yaptiktan sonra tutarinizi girin, risk tercihinizi secin ve
            size ozel dagilimi aninda gorun.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/30">
          <h2 className="mb-1 text-xl font-semibold text-white">Giris Yap</h2>
          <p className="mb-5 text-sm text-slate-400">
            E-posta ve sifreniz ile devam edin.
          </p>

          <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-200"
              >
                E-posta
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="ornek@mail.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30"
                  {...register('email', {
                    required: 'E-posta zorunludur.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Gecerli bir e-posta girin.',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-200"
              >
                Sifre
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30"
                  {...register('password', {
                    required: 'Sifre zorunludur.',
                    minLength: {
                      value: 6,
                      message: 'Sifre en az 6 karakter olmali.',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Giris Yap
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
