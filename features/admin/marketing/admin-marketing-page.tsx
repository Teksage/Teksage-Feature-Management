import { KanbanBoard } from '@/features/shared/features/kanban-board'
import { ROUTES } from '@/lib/constants'

export function AdminMarketingPage() {
  return <KanbanBoard basePath={ROUTES.admin.marketing} domain="marketing" />
}
