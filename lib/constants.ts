export const USER_ROLES = ['Admin', 'Member'] as const

export const FEATURE_STATUSES = [
  'Idea',
  'Planned',
  'In Progress',
  'Completed',
] as const

export const FEATURE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const

/** Where a feature ships — Both appears on Web and App boards. */
export const FEATURE_PLATFORMS = ['Website', 'App', 'Both'] as const

/** Board tabs (Both features are included in each). */
export const FEATURE_BOARD_TABS = [
  { id: 'Web', label: 'Web', matches: ['Website', 'Both'] as const },
  { id: 'App', label: 'App', matches: ['App', 'Both'] as const },
] as const

export type FeatureBoardTab = (typeof FEATURE_BOARD_TABS)[number]['id']

export const ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authCallback: '/auth/callback',
  admin: {
    dashboard: '/admin/dashboard',
    features: '/admin/features',
    team: '/admin/team',
    profile: '/admin/profile',
  },
  member: {
    dashboard: '/member/dashboard',
    features: '/member/features',
    profile: '/member/profile',
  },
} as const

export const APP_NAME = 'Teksage Feature Management'
export const APP_BRAND = 'Teksage'
export const APP_DESCRIPTION = 'Capture, prioritize, and ship Teksage product ideas'
export const APP_LOGO = '/logo.svg'
export const APP_LOGIN_LOGO = '/login-logo.svg'

export const QUERY_KEYS = {
  features: 'features',
  feature: 'feature',
  categories: 'categories',
  comments: 'comments',
  votes: 'votes',
  team: 'team',
  dashboardStats: 'dashboard-stats',
  profile: 'profile',
} as const

export const STALE_TIME = {
  short: 30 * 1000,
  medium: 60 * 1000,
  long: 5 * 60 * 1000,
} as const

export const PAGE_SIZE = 50
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const

export const DATE_DISPLAY_FORMAT = 'dd MMM yyyy'
export const RELEASE_DUE_SOON_DAYS = 7

/**
 * Custom MIME type for Kanban drag payloads. A non-standard type is required so
 * the browser never treats a stray drop as text or a URL to navigate to.
 */
export const KANBAN_DRAG_TYPE = 'application/x-tfm-feature-id'

/** Same-origin endpoint that replays Supabase updates when the browser blocks PATCH. */
export const SUPABASE_WRITE_PROXY_PATH = '/api/supabase-write'

/** Sentinel for "no category" — Select cannot use an empty string as a value. */
export const NO_CATEGORY_VALUE = 'none'

export const AUTH_COPY = {
  loginTitle: 'Welcome back',
  loginSubtitle: 'Sign in to Teksage Feature Management',
  registerTitle: 'Create account',
  registerSubtitle: 'Join the Teksage product team',
  forgotTitle: 'Forgot password?',
  forgotSubtitle: "Enter your email and we'll send you a reset link.",
  resetTitle: 'Set new password',
  resetSubtitle: 'Choose a strong password for your account.',
} as const
