import type { Metadata } from 'next'
import { RegisterForm } from '@/features/auth/components/register-form'
import { AUTH_COPY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{AUTH_COPY.registerTitle}</h1>
        <p className="text-muted-foreground text-sm">{AUTH_COPY.registerSubtitle}</p>
      </div>
      <RegisterForm />
    </>
  )
}
