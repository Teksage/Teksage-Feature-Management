'use client'

import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { getNavByRole } from './sidebar-nav-items'
import { SidebarNavItem } from './sidebar-nav-item'
import { BrandMark } from './brand-mark'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  const navSections = user ? getNavByRole(user.role) : []

  return (
    <aside
      className={cn(
        'bg-sidebar relative flex h-full flex-col border-r transition-all duration-300',
        sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        <BrandMark collapsed={sidebarCollapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {navSections.map((section, i) => (
          <div key={i} className="mb-4">
            {section.title && !sidebarCollapsed && (
              <p className="text-muted-foreground mb-1 px-2 text-[10px] font-semibold tracking-wider uppercase">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
                  collapsed={sidebarCollapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User info */}
      {!sidebarCollapsed && user && (
        <div className="border-t p-3">
          <p className="truncate text-xs font-medium">{user.fullName}</p>
          <p className="text-muted-foreground truncate text-xs">{user.role}</p>
        </div>
      )}

      {/* Collapse toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="absolute top-6 -right-3 h-6 w-6 rounded-full border shadow-sm"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  )
}
