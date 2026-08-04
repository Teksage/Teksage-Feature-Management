'use client'

import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { UserRole } from '@/types/supabase.types'

export interface ITeamMember {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export function useGetTeam() {
  return useQuery({
    queryKey: [QUERY_KEYS.team],
    queryFn: async (): Promise<ITeamMember[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: STALE_TIME.medium,
  })
}
