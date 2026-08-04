'use client'

import { useState } from 'react'
import { Users, Pencil, Trash2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { PageHeader } from '@/components/shared/layout/page-header'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { teamMemberSchema, type TeamMemberInput } from '@/lib/validations/feature'
import { useGetTeam } from '@/services/team/use-get-team'
import { invalidateTeam } from '@/lib/invalidate-queries'
import { useQueryClient } from '@tanstack/react-query'
import { USER_ROLES } from '@/lib/constants'
import type { ITeamMember } from '@/services/team/use-get-team'
import type { UserRole } from '@/types/supabase.types'

export function TeamList() {
  const { data: members = [], isLoading } = useGetTeam()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editMember, setEditMember] = useState<ITeamMember | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [roleEdit, setRoleEdit] = useState<UserRole>('Member')

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: { role: 'Member' },
  })

  async function onCreate(data: TeamMemberInput) {
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { toast.error((await res.json()).message ?? 'Failed'); return }
    toast.success('Member created.')
    invalidateTeam(queryClient)
    setCreateOpen(false)
    reset()
  }

  async function handleRoleSave() {
    if (!editMember) return
    const res = await fetch(`/api/admin/team/${editMember.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: roleEdit }),
    })
    if (!res.ok) { toast.error('Failed to update role'); return }
    toast.success('Role updated.')
    invalidateTeam(queryClient)
    setEditMember(null)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleteLoading(true)
    const res = await fetch(`/api/admin/team/${deleteId}`, { method: 'DELETE' })
    setDeleteLoading(false)
    if (!res.ok) { toast.error('Failed to delete user'); return }
    toast.success('Member removed.')
    invalidateTeam(queryClient)
    setDeleteId(null)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-4">
      <PageHeader title="Team" description="Manage team members and roles.">
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> Add Member</Button>
      </PageHeader>

      {members.length === 0 ? (
        <EmptyState icon={Users} title="No team members" action={{ label: 'Add Member', onClick: () => setCreateOpen(true) }} />
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id} className="bg-card flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="font-medium text-sm">{m.full_name}</p>
                <p className="text-muted-foreground text-xs">{m.email} · {m.role}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setRoleEdit(m.role); setEditMember(m) }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(m.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Add Team Member">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <FormFieldWrapper label="Full Name" htmlFor="fn" error={errors.fullName} required>
            <Input id="fn" {...register('fullName')} />
          </FormFieldWrapper>
          <FormFieldWrapper label="Email" htmlFor="em" error={errors.email} required>
            <Input id="em" type="email" {...register('email')} />
          </FormFieldWrapper>
          <FormFieldWrapper label="Password" htmlFor="pw" error={errors.password} required>
            <Input id="pw" type="password" {...register('password')} />
          </FormFieldWrapper>
          <FormFieldWrapper label="Role" error={errors.role} required>
            <Select defaultValue="Member" onValueChange={(v) => setValue('role', v as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{USER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </FormFieldWrapper>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Member
          </Button>
        </form>
      </FormDialog>

      <FormDialog open={!!editMember} onOpenChange={(o) => !o && setEditMember(null)} title="Change Role">
        <FormFieldWrapper label="Role">
          <Select value={roleEdit} onValueChange={(v) => setRoleEdit(v as UserRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{USER_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </FormFieldWrapper>
        <Button className="mt-3 w-full" onClick={handleRoleSave}>Save Role</Button>
      </FormDialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} title="Remove Member" description="This will permanently delete the user account." confirmLabel="Remove" variant="destructive" loading={deleteLoading} onConfirm={handleDelete} />
    </div>
  )
}
