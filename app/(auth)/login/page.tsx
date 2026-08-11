import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/login-form'
import { AUTH_COPY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-auth-heading), var(--font-sans), sans-serif' }}
        >
          {AUTH_COPY.loginTitle}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{AUTH_COPY.loginSubtitle}</p>
      </div>
      <LoginForm />
    </>
  )
}
