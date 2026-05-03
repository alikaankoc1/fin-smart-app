import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { LanguageProvider } from '../context/LanguageContext'
import LoginPage from './LoginPage'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderLogin(props = {}) {
  return render(
    <LanguageProvider>
      <LoginPage onLogin={props.onLogin ?? (() => {})} />
    </LanguageProvider>,
  )
}

describe('LoginPage', () => {
  it('opens on sign-up by default and shows register fields (TR)', () => {
    const { container } = renderLogin()

    expect(screen.getByRole('heading', { name: 'Üye Ol' })).toBeInTheDocument()
    expect(screen.getByLabelText('Ad Soyad')).toBeInTheDocument()
    expect(container.querySelector('#signup-email')).toBeTruthy()
    expect(container.querySelector('#signup-password')).toBeTruthy()
  })

  it('switches to sign-in panel when clicking go to login from gradient', async () => {
    const user = userEvent.setup()
    const { container } = renderLogin()

    await user.click(screen.getByTestId('promo-go-login'))

    expect(screen.getByRole('heading', { name: 'Giriş Yap', level: 2 })).toBeInTheDocument()
    // Kayıt formu hâlâ DOM’da (kaydırma); giriş alanlarının hazır olduğunu id ile doğrula
    expect(container.querySelector('#signin-email')).toBeTruthy()
  })

  it('switches language to EN via toggle', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: 'EN' }))

    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
  })
})
