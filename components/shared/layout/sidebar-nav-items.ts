import {
  LayoutDashboard,
  Lightbulb,
  Users,
  User,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import type { UserRole } from '@/types/supabase.types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const ADMIN_NAV: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: ROUTES.admin.dashboard, icon: LayoutDashboard }],
  },
  {
    title: 'Product',
    items: [{ label: 'Features', href: ROUTES.admin.features, icon: Lightbulb }],
  },
  {
    title: 'Team',
    items: [
      { label: 'Members', href: ROUTES.admin.team, icon: Users },
      { label: 'Profile', href: ROUTES.admin.profile, icon: User },
    ],
  },
]

export const MEMBER_NAV: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: ROUTES.member.dashboard, icon: LayoutDashboard }],
  },
  {
    title: 'Product',
    items: [{ label: 'Features', href: ROUTES.member.features, icon: Lightbulb }],
  },
  {
    title: 'Account',
    items: [{ label: 'Profile', href: ROUTES.member.profile, icon: User }],
  },
]

export function getNavByRole(role: UserRole): NavSection[] {
  return role === 'Admin' ? ADMIN_NAV : MEMBER_NAV
}
