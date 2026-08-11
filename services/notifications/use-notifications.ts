'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { invalidateNotifications } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'

export interface INotification {
  id: string
  user_id: string
  feature_id: string | null
  type: string
  title: string
  body: string | null
  read_at: string | null
  created_at: string
}

export function useGetNotifications() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: [QUERY_KEYS.notifications, user?.id],
    queryFn: async (): Promise<INotification[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(30)
      if (error) throw error
      return data ?? []
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME.short,
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateNotifications(queryClient),
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('read_at', null)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('All caught up.')
      invalidateNotifications(queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
