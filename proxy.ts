import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
]
const ADMIN_ROUTES = ['/admin']
const MEMBER_ROUTES = ['/member']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

function dashboardForRole(role?: string | null) {
  return role === 'Admin' ? '/admin/dashboard' : '/member/dashboard'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && pathname.startsWith('/reset-password')) {
    return response
  }

  if (user && isPublicRoute(pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return NextResponse.redirect(new URL(dashboardForRole(profile?.role), request.url))
  }

  if (!user && !isPublicRoute(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (
    user &&
    (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) ||
      MEMBER_ROUTES.some((r) => pathname.startsWith(r)))
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
    const isMemberRoute = MEMBER_ROUTES.some((r) => pathname.startsWith(r))

    if (isAdminRoute && profile?.role !== 'Admin') {
      return NextResponse.redirect(new URL('/member/dashboard', request.url))
    }

    if (isMemberRoute && profile?.role !== 'Member') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  if (pathname === '/') {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    return NextResponse.redirect(new URL(dashboardForRole(profile?.role), request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
