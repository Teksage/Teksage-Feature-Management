import { z } from 'zod'
import { FEATURE_PLATFORMS, FEATURE_PRIORITIES, FEATURE_STATUSES } from '@/lib/constants'

export const featureSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().max(5000).optional().or(z.literal('')),
  status: z.enum(FEATURE_STATUSES),
  priority: z.enum(FEATURE_PRIORITIES),
  platform: z.enum(FEATURE_PLATFORMS),
  categoryId: z.string().uuid().optional().nullable().or(z.literal('')),
  targetRelease: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date')
    .optional()
    .or(z.literal('')),
})

export const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000),
})

export const teamMemberSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['Admin', 'Member']),
})

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export type FeatureInput = z.infer<typeof featureSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type TeamMemberInput = z.infer<typeof teamMemberSchema>
export type ProfileInput = z.infer<typeof profileSchema>
