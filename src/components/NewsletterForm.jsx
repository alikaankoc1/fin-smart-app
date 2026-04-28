import { Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'

export default function NewsletterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data) => {
    console.log('Form submitted:', data)
    reset()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
        E-posta
      </label>
      <div className="relative">
        <Mail
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          id="email"
          type="email"
          placeholder="ornek@mail.com"
          className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          {...register('email', {
            required: 'E-posta zorunludur.',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Gecerli bir e-posta girin.',
            },
          })}
        />
      </div>

      {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}

      {isSubmitSuccessful && (
        <p className="text-sm text-emerald-600">Basariyla kaydoldunuz.</p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Kaydol
      </button>
    </form>
  )
}
