import type { Metadata } from 'next'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { RegisterForm } from '@/features/auth/components/register-form'
import { AUTH_COPY } from '@/lib/constants'

export const metadata: Metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return (
    <FeatureCard className="w-full max-w-sm" contentClassName="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{AUTH_COPY.registerTitle}</h1>
        <p className="text-muted-foreground text-sm">{AUTH_COPY.registerSubtitle}</p>
      </div>
      <RegisterForm />
    </FeatureCard>
  )
}
