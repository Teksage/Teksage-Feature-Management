import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'
import { AUTH_COPY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ForgotPasswordPage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{AUTH_COPY.forgotTitle}</h1>
        <p className="text-muted-foreground text-sm">{AUTH_COPY.forgotSubtitle}</p>
      </div>
      <ForgotPasswordForm />
    </FeatureCard>
  )
}
