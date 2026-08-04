import type { FeatureBoardTab } from '@/lib/constants'

interface IBoardAccent {
  /** Selected tab pill. */
  trigger: string
  /** Column shell, so each board reads as its own surface at a glance. */
  column: string
  /** Column highlight while a card hovers over it. */
  dropTarget: string
  /** Left edge of the column header. */
  headerEdge: string
}

export const BOARD_TAB_ACCENT: Record<FeatureBoardTab, IBoardAccent> = {
  Web: {
    // Dark overrides are required: TabsTrigger ships `dark:data-active:*` defaults.
    trigger:
      'data-active:bg-info data-active:text-info-foreground dark:data-active:bg-info dark:data-active:text-info-foreground',
    column: 'bg-background',
    dropTarget: 'bg-muted/40 ring-info/50 ring-2 ring-dashed',
    headerEdge: 'border-l-2 border-l-info',
  },
  App: {
    trigger:
      'data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground',
    column: 'bg-background',
    dropTarget: 'bg-muted/40 ring-primary/50 ring-2 ring-dashed',
    headerEdge: 'border-l-2 border-l-primary',
  },
}
