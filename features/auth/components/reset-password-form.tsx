'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'

export function ResetPasswordForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(data: ResetPasswordInput) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Password updated successfully.')
    router.push(ROUTES.login)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="New Password" htmlFor="password" error={errors.password} required>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('password')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Confirm Password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword}
        required
      >
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
      </FormFieldWrapper>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Set New Password
      </Button>
    </form>
  )
}
