import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { AppLogo } from '@/components/shared/layout/app-logo'
import { AuthHero } from '@/features/auth/components/auth-hero'
import { APP_DESCRIPTION } from '@/lib/constants'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-auth-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${outfit.variable} page-mesh flex min-h-screen`}>
      <AuthHero />

      <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div
          className="from-primary/8 pointer-events-none absolute inset-0 bg-gradient-to-bl via-transparent to-brand-secondary/10"
          aria-hidden
        />

        <div className="auth-form-enter relative z-10 mb-8 flex flex-col items-center gap-3 lg:hidden">
          <AppLogo size="lg" className="h-12 w-auto" priority />
          <p className="text-muted-foreground max-w-xs text-center text-sm">{APP_DESCRIPTION}</p>
        </div>

        <div className="auth-form-enter relative z-10 w-full max-w-[420px]">
          <div className="glass-panel border-border/70 ring-primary/10 overflow-hidden rounded-2xl border p-6 shadow-modal ring-1 sm:p-8">
            <div className="from-primary via-primary to-brand-secondary mb-6 h-1 w-full rounded-full bg-gradient-to-r" />
            <div className="space-y-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
