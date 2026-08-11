'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ROUTES } from '@/lib/constants'

export function LoginForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id ?? '')
      .single()

    const role = (profile as { role?: string } | null)?.role
    router.push(role === 'Admin' ? ROUTES.admin.dashboard : ROUTES.member.dashboard)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormFieldWrapper label="Email" htmlFor="email" error={errors.email} required>
        <Input
          id="email"
          type="email"
          placeholder="you@teksage.com"
          autoComplete="email"
          className="bg-background/80 h-11"
          {...register('email')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Password" htmlFor="password" error={errors.password} required>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="bg-background/80 h-11"
          {...register('password')}
        />
      </FormFieldWrapper>

      <div className="-mt-1 flex justify-end">
        <Link
          href={ROUTES.forgotPassword}
          className="text-muted-foreground hover:text-primary text-xs font-medium transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      <p className="text-muted-foreground pt-1 text-center text-sm">
        {"Don't have an account? "}
        <Link href={ROUTES.register} className="text-primary font-semibold hover:underline">
          Register
        </Link>
      </p>
    </form>
  )
}
