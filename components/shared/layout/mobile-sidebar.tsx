'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { getNavByRole } from './sidebar-nav-items'
import { SidebarNavItem } from './sidebar-nav-item'
import { BrandMark } from './brand-mark'

export function MobileSidebar() {
  const pathname = usePathname()
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore()
  const { user } = useAuthStore()

  const navSections = user ? getNavByRole(user.role) : []

  useEffect(() => {
    setSidebarMobileOpen(false)
  }, [pathname, setSidebarMobileOpen])

  return (
    <Sheet open={sidebarMobileOpen} onOpenChange={setSidebarMobileOpen}>
      <SheetContent side="left" className="w-[220px] p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left">
            <BrandMark />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {navSections.map((section, i) => (
            <div key={i} className="mb-4">
              {section.title && (
                <p className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold tracking-wider uppercase">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    collapsed={false}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
