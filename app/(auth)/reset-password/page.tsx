import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'
import { AUTH_COPY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Set New Password' }

export default function ResetPasswordPage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{AUTH_COPY.resetTitle}</h1>
        <p className="text-muted-foreground text-sm">{AUTH_COPY.resetSubtitle}</p>
      </div>
      <ResetPasswordForm />
    </FeatureCard>
  )
}
