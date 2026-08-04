import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { teamMemberSchema } from '@/lib/validations/feature'

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const parsed = teamMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { fullName, email, password, role } = parsed.data
  const adminClient = await getSupabaseAdminClient()

  const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (createError) {
    return NextResponse.json({ message: createError.message }, { status: 400 })
  }

  const userId = authUser.user.id

  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert({ id: userId, full_name: fullName, email, role })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId)
    return NextResponse.json({ message: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ id: userId }, { status: 201 })
}
