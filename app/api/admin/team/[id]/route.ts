import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api/require-admin'
import { getSupabaseAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { USER_ROLES } from '@/lib/constants'

const patchSchema = z.object({ role: z.enum(USER_ROLES) })

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const adminClient = await getSupabaseAdminClient()
  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const adminClient = await getSupabaseAdminClient()

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(id)
  if (deleteError) {
    return NextResponse.json({ message: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
