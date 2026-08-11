'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { FeatureCategoryField } from './feature-category-field'
import { FeatureAssigneeField } from './feature-assignee-field'
import { FeatureFormMetaFields } from './feature-form-meta-fields'
import { DatePicker } from '@/components/shared/forms/date-picker'
import { featureSchema, type FeatureInput } from '@/lib/validations/feature'
import { useGetCategories } from '@/services/categories/use-get-categories'
import { useUpsertCategory } from '@/services/categories/use-upsert-category'
import { useGetTeam } from '@/services/team/use-get-team'
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
  const { data: members = [] } = useGetTeam()
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
      assigneeId: defaultValues?.assignee_id ?? '',
      targetRelease: defaultValues?.target_release ?? '',
    },
  })

  useEffect(() => {
    if (defaultValues?.category_id) setValue('categoryId', defaultValues.category_id)
    if (defaultValues?.assignee_id) setValue('assigneeId', defaultValues.assignee_id)
  }, [defaultValues?.category_id, defaultValues?.assignee_id, setValue])

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="mx-auto w-full max-w-2xl space-y-4">
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

      <FeatureFormMetaFields
        platform={watch('platform')}
        status={watch('status')}
        priority={watch('priority')}
        canManageStatus={canManageStatus}
        errors={errors}
        setValue={setValue}
      />

      <FeatureCategoryField
        categories={categories}
        categoryId={watch('categoryId') ?? ''}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FeatureAssigneeField
          members={members}
          assigneeId={watch('assigneeId') ?? ''}
          error={errors.assigneeId}
          onChange={(id) => setValue('assigneeId', id)}
        />

        <FormFieldWrapper label="Target Release" error={errors.targetRelease}>
          <DatePicker
            value={watch('targetRelease') || ''}
            onChange={(v) => setValue('targetRelease', v)}
            placeholder="Pick a release date"
          />
        </FormFieldWrapper>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {defaultValues?.id ? 'Update Feature' : 'Create Feature'}
      </Button>
    </form>
  )
}
