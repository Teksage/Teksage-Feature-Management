import { z } from 'zod'

export const subtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  assigneeId: z.string().uuid().optional().nullable().or(z.literal('')),
})

export type SubtaskInput = z.infer<typeof subtaskSchema>

export const attachmentLinkSchema = z.object({
  label: z.string().min(1, 'Label is required').max(120),
  url: z.string().url('Enter a valid URL'),
})

export type AttachmentLinkInput = z.infer<typeof attachmentLinkSchema>

export const featureDocSchema = z.object({
  body: z.string().max(50000),
})

export type FeatureDocInput = z.infer<typeof featureDocSchema>
