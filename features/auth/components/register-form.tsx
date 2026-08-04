'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'

export function RegisterForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  async function onSubmit(data: RegisterInput) {
    const supabase = getSupabaseBrowserClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}${ROUTES.authCallback}`,
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Account created! Check your email to confirm your address.')
    router.push(ROUTES.login)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Full Name" htmlFor="fullName" error={errors.fullName} required>
        <Input id="fullName" placeholder="Jane Doe" autoComplete="name" {...register('fullName')} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Email" htmlFor="email" error={errors.email} required>
        <Input
          id="email"
          type="email"
          placeholder="you@teksage.com"
          autoComplete="email"
          {...register('email')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Password" htmlFor="password" error={errors.password} required>
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
        Create Account
      </Button>
    </form>
  )
}
