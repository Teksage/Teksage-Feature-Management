'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { FeatureCategoryField } from './feature-category-field'
import { DatePicker } from '@/components/shared/forms/date-picker'
import { featureSchema, type FeatureInput } from '@/lib/validations/feature'
import { FEATURE_STATUSES, FEATURE_PRIORITIES, FEATURE_PLATFORMS } from '@/lib/constants'
import { useGetCategories } from '@/services/categories/use-get-categories'
import { useUpsertCategory } from '@/services/categories/use-upsert-category'
import type { IFeatureEntity } from '@/services/features/features.types'

interface FeatureFormProps {
  defaultValues?: Partial<IFeatureEntity> & {
    status?: FeatureInput['status']
    platform?: FeatureInput['platform']
  }
  canManageStatus?: boolean
  isSubmitting?: boolean
  onSubmit: (data: FeatureInput) => void | Promise<void>
}

export function FeatureForm({
  defaultValues,
  canManageStatus = false,
  isSubmitting = false,
  onSubmit,
}: FeatureFormProps) {
  const { data: categories = [] } = useGetCategories()
  const upsertCategory = useUpsertCategory()
  const [newCategory, setNewCategory] = useState('')
  const [busy, setBusy] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeatureInput>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      status: defaultValues?.status ?? 'Idea',
      priority: defaultValues?.priority ?? 'Medium',
      platform: defaultValues?.platform ?? 'Both',
      categoryId: defaultValues?.category_id ?? '',
      targetRelease: defaultValues?.target_release ?? '',
    },
  })

  useEffect(() => {
    if (defaultValues?.category_id) setValue('categoryId', defaultValues.category_id)
  }, [defaultValues?.category_id, setValue])

  const status = watch('status')
  const priority = watch('priority')
  const platform = watch('platform')
  const categoryId = watch('categoryId')

  async function handleFormSubmit(data: FeatureInput) {
    setBusy(true)
    try {
      let resolvedCategory = data.categoryId
      const name = newCategory.trim()
      if (name) {
        resolvedCategory = await upsertCategory.mutateAsync({ name })
        setNewCategory('')
      }
      await onSubmit({ ...data, categoryId: resolvedCategory || '' })
    } finally {
      setBusy(false)
    }
  }

  const submitting = isSubmitting || busy || upsertCategory.isPending

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormFieldWrapper label="Title" htmlFor="title" error={errors.title} required>
        <Input id="title" placeholder="Feature title" {...register('title')} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Description" htmlFor="description" error={errors.description}>
        <Textarea
          id="description"
          rows={3}
          placeholder="Describe the feature…"
          {...register('description')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Platform" error={errors.platform} required>
        <Select
          value={platform}
          onValueChange={(v) => {
            if (v) setValue('platform', v as FeatureInput['platform'])
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEATURE_PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p === 'Website' ? 'Website' : p === 'App' ? 'App' : 'Both (Web + App)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      <div className="grid grid-cols-2 gap-3">
        {canManageStatus && (
          <FormFieldWrapper label="Status" error={errors.status} required>
            <Select
              value={status}
              onValueChange={(v) => {
                if (v) setValue('status', v as FeatureInput['status'])
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEATURE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        )}

        <FormFieldWrapper label="Priority" error={errors.priority} required>
          <Select
            value={priority}
            onValueChange={(v) => {
              if (v) setValue('priority', v as FeatureInput['priority'])
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FEATURE_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>

      <FeatureCategoryField
        categories={categories}
        categoryId={categoryId ?? ''}
        newCategory={newCategory}
        error={errors.categoryId}
        canCreate={canManageStatus}
        onCategoryChange={(id) => {
          setValue('categoryId', id)
          if (id) setNewCategory('')
        }}
        onNewCategoryChange={(name) => {
          setNewCategory(name)
          if (name.trim()) setValue('categoryId', '')
        }}
      />

      <FormFieldWrapper label="Target Release" error={errors.targetRelease}>
        <DatePicker
          value={watch('targetRelease') || ''}
          onChange={(v) => setValue('targetRelease', v)}
          placeholder="Pick a release date"
        />
      </FormFieldWrapper>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {defaultValues?.id ? 'Update Feature' : 'Create Feature'}
      </Button>
    </form>
  )
}
