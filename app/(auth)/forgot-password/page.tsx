import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { AUTH_COPY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{AUTH_COPY.forgotTitle}</h1>
        <p className="text-muted-foreground text-sm">{AUTH_COPY.forgotSubtitle}</p>
      </div>
      <ForgotPasswordForm />
    </>
  )
}
