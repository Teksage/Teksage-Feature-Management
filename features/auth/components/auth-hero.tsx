'use client'

import { AppLogo } from '@/components/shared/layout/app-logo'
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants'

const HIGHLIGHTS = [
  { title: 'Prioritize', detail: 'Rank ideas by impact and urgency' },
  { title: 'Assign', detail: 'Clear ownership across the team' },
  { title: 'Ship', detail: 'Track delivery from idea to done' },
] as const

export function AuthHero() {
  return (
    <aside className="auth-hero relative hidden w-[48%] overflow-hidden lg:flex lg:flex-col">
      <div className="auth-hero-orb auth-hero-orb-a" aria-hidden />
      <div className="auth-hero-orb auth-hero-orb-b" aria-hidden />
      <div className="auth-hero-grid" aria-hidden />

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <AppLogo size="lg" className="h-12 w-auto brightness-0 invert" priority />

        <div className="auth-hero-enter max-w-lg space-y-8">
          <div className="space-y-4">
            <p className="text-primary-foreground/70 text-xs font-semibold tracking-[0.22em] uppercase">
              Product roadmap
            </p>
            <h1 className="font-heading text-primary-foreground text-5xl leading-[1.05] font-bold tracking-tight xl:text-6xl">
              Teksage
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              {APP_DESCRIPTION}. Plan features, assign owners, and track delivery in one place.
            </p>
          </div>

          <ul className="grid gap-3">
            {HIGHLIGHTS.map((item, i) => (
              <li
                key={item.title}
                className="auth-hero-chip border-primary-foreground/15 bg-primary-foreground/8 flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm"
                style={{ animationDelay: `${180 + i * 90}ms` }}
              >
                <span className="bg-primary-foreground/90 text-primary mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="text-primary-foreground text-sm font-semibold">{item.title}</p>
                  <p className="text-primary-foreground/65 text-xs leading-relaxed">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-primary-foreground/50 relative text-xs">© {APP_NAME}</p>
      </div>
    </aside>
  )
}
