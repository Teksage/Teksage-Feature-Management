import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (next === ROUTES.resetPassword || next.startsWith(`${ROUTES.resetPassword}?`)) {
        return NextResponse.redirect(`${origin}${ROUTES.resetPassword}`)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const role = (profile as { role?: string } | null)?.role
        const redirect = role === 'Admin' ? ROUTES.admin.dashboard : ROUTES.member.dashboard
        return NextResponse.redirect(new URL(redirect, origin))
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback_error`)
}
