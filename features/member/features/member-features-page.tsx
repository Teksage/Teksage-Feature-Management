import { KanbanBoard } from '@/features/shared/features/kanban-board'
import { ROUTES } from '@/lib/constants'

export function MemberFeaturesPage() {
  return <KanbanBoard basePath={ROUTES.member.features} canManageStatus={false} />
}
