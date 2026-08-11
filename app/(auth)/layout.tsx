import type { Metadata } from 'next'
import { AppLogo } from '@/components/shared/layout/app-logo'
import { FeatureCard } from '@/components/shared/data-display/feature-card'
import { APP_DESCRIPTION } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-mesh flex min-h-screen">
      <aside className="from-primary/10 via-brand-secondary/5 relative hidden w-[42%] flex-col justify-between overflow-hidden border-r bg-gradient-to-br to-transparent p-10 lg:flex">
        <div
          className="from-primary/20 pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br to-transparent blur-3xl"
          aria-hidden
        />
        <div
          className="from-brand-secondary/20 pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tl to-transparent blur-3xl"
          aria-hidden
        />
        <AppLogo size="lg" className="relative h-14 w-auto" priority />
        <div className="relative space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Ship ideas with clarity</h2>
          <p className="text-muted-foreground max-w-sm text-base leading-relaxed">
            {APP_DESCRIPTION}. Plan features, assign owners, and track delivery in one place.
          </p>
        </div>
        <p className="text-muted-foreground relative text-xs">© Teksage</p>
      </aside>

      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <AppLogo size="lg" className="h-14 w-auto" priority />
          <p className="text-muted-foreground text-center text-sm">{APP_DESCRIPTION}</p>
        </div>
        <FeatureCard className="w-full max-w-md shadow-dropdown" contentClassName="space-y-5 p-1">
          {children}
        </FeatureCard>
      </div>
    </div>
  )
}
