'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { PageHeader } from '@/components/shared/layout/page-header'
import { PageLoader } from '@/components/shared/feedback/page-loader'
import { profileSchema, type ProfileInput } from '@/lib/validations/feature'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { QUERY_KEYS } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'

export function ProfileForm() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.fullName ?? '' },
  })

  useEffect(() => {
    if (user) reset({ fullName: user.fullName })
  }, [user, reset])

  async function onSubmit(data: ProfileInput) {
    if (!user) return
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: data.fullName })
      .eq('id', user.id)

    if (error) { toast.error(error.message); return }

    setUser({ ...user, fullName: data.fullName })
    void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.profile] })
    toast.success('Profile updated.')
  }

  if (!user) return <PageLoader />

  return (
    <div className="space-y-6 max-w-md">
      <PageHeader title="Profile" description="Update your account details." />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldWrapper label="Full Name" htmlFor="fullName" error={errors.fullName} required>
          <Input id="fullName" {...register('fullName')} />
        </FormFieldWrapper>

        <FormFieldWrapper label="Email">
          <Input value={user.email} disabled className="bg-muted/50" />
        </FormFieldWrapper>

        <FormFieldWrapper label="Role">
          <Input value={user.role} disabled className="bg-muted/50" />
        </FormFieldWrapper>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  )
}
