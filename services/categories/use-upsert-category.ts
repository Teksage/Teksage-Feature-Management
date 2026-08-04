'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateCategories } from '@/lib/invalidate-queries'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function useUpsertCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name }: { name: string }): Promise<string> => {
      const supabase = getSupabaseBrowserClient()
      const slug = slugify(name)

      const { data, error } = await supabase
        .from('feature_categories')
        .insert({ name: name.trim(), slug })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    },
    onSuccess: () => {
      invalidateCategories(queryClient)
    },
    onError: (err: Error) => toast.error(err.message),
  })
}
