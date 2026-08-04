'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthStore, type AuthUser } from '@/store/auth-store'
import { ROUTES } from '@/lib/constants'

export function useAuth() {
  const { user, isLoading, setUser, clearUser } = useAuthStore()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        if (mounted) clearUser()
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (mounted && profile) {
        const authUser: AuthUser = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
          avatarUrl: profile.avatar_url,
        }
        setUser(authUser)
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        if (mounted) clearUser()
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (mounted) loadUser()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [clearUser, setUser, supabase])

  async function signOut() {
    await supabase.auth.signOut()
    clearUser()
    router.push(ROUTES.login)
  }

  return { user, isLoading, signOut }
}
