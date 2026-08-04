import type { Metadata } from 'next'
import { AppLogo } from '@/components/shared/layout/app-logo'
import { APP_DESCRIPTION } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-background via-background to-accent/30 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <AppLogo size="lg" className="h-16 w-auto" priority />
        <p className="text-muted-foreground text-sm">{APP_DESCRIPTION}</p>
      </div>
      {children}
    </div>
  )
}
