'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  useGetNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  type INotification,
} from '@/services/notifications/use-notifications'
import { useAuthStore } from '@/store/auth-store'
import { ROUTES } from '@/lib/constants'
import { formatRelative } from '@/utils/format'
import { cn } from '@/utils/cn'

export function NotificationBell() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const { data: notifications = [], isLoading, isError, error } = useGetNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  if (!user) return null

  const unread = notifications.filter((n) => !n.read_at)
  const basePath = user.role === 'Admin' ? ROUTES.admin.features : ROUTES.member.features

  function openItem(n: INotification) {
    if (!n.read_at) markRead.mutate(n.id)
    setOpen(false)
    if (n.feature_id) router.push(`${basePath}/${n.feature_id}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" />
        }
      >
        <Bell className="h-4 w-4" />
        {unread.length > 0 && (
          <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="z-[60] w-80 max-w-[calc(100vw-2rem)] gap-0 p-0"
      >
        <PopoverHeader className="flex flex-row items-center justify-between gap-2 border-b px-3 py-2.5">
          <PopoverTitle className="text-sm font-semibold">Notifications</PopoverTitle>
          {unread.length > 0 && (
            <button
              type="button"
              className="text-primary text-xs font-medium hover:underline"
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </button>
          )}
        </PopoverHeader>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">Loading…</p>
          ) : isError ? (
            <p className="text-destructive px-3 py-8 text-center text-sm">
              {error instanceof Error ? error.message : 'Could not load notifications.'}
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-muted-foreground px-3 py-8 text-center text-sm">
              No notifications yet. You&apos;ll see updates when you&apos;re assigned a feature or
              someone comments.
            </p>
          ) : (
            <ul className="p-1">
              {notifications.slice(0, 12).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={cn(
                      'hover:bg-muted w-full rounded-md px-2.5 py-2 text-left',
                      !n.read_at && 'bg-primary/5'
                    )}
                  >
                    <p
                      className={cn(
                        'text-sm',
                        n.read_at ? 'text-muted-foreground' : 'font-medium'
                      )}
                    >
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-muted-foreground truncate text-xs">{n.body}</p>
                    )}
                    <p className="text-muted-foreground text-[10px]">
                      {formatRelative(n.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
