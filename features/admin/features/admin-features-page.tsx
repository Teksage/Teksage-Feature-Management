import { KanbanBoard } from '@/features/shared/features/kanban-board'
import { ROUTES } from '@/lib/constants'

export function AdminFeaturesPage() {
  return <KanbanBoard basePath={ROUTES.admin.features} canManageStatus={true} />
}
