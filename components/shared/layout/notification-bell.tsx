'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/services/notifications/use-notifications'
import { useAuthStore } from '@/store/auth-store'
import { ROUTES } from '@/lib/constants'
import { formatRelative } from '@/utils/format'

export function NotificationBell() {
  const { user } = useAuthStore()
  const { data: notifications = [] } = useGetNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  if (!user) return null

  const unread = notifications.filter((n) => !n.read_at)
  const basePath = user.role === 'Admin' ? ROUTES.admin.features : ROUTES.member.features

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring relative inline-flex h-9 w-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2">
        <Bell className="h-4 w-4" />
        {unread.length > 0 && (
          <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          {unread.length > 0 && (
            <button
              type="button"
              className="text-primary text-xs font-medium"
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            You&apos;re all caught up.
          </p>
        ) : (
          notifications.slice(0, 12).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-0.5 py-2"
              onClick={() => {
                if (!n.read_at) markRead.mutate(n.id)
              }}
            >
              {n.feature_id ? (
                <Link href={`${basePath}/${n.feature_id}`} className="w-full">
                  <p className={`text-sm ${n.read_at ? 'text-muted-foreground' : 'font-medium'}`}>
                    {n.title}
                  </p>
                  {n.body && <p className="text-muted-foreground truncate text-xs">{n.body}</p>}
                  <p className="text-muted-foreground text-[10px]">{formatRelative(n.created_at)}</p>
                </Link>
              ) : (
                <>
                  <p className={`text-sm ${n.read_at ? 'text-muted-foreground' : 'font-medium'}`}>
                    {n.title}
                  </p>
                  <p className="text-muted-foreground text-[10px]">{formatRelative(n.created_at)}</p>
                </>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
