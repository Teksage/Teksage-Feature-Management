import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/login-form'
import { AUTH_COPY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{AUTH_COPY.loginTitle}</h1>
        <p className="text-muted-foreground text-sm">{AUTH_COPY.loginSubtitle}</p>
      </div>
      <LoginForm />
    </>
  )
}
