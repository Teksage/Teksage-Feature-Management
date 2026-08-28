import { KanbanBoard } from '@/features/shared/features/kanban-board'
import { ROUTES } from '@/lib/constants'

export function MemberMarketingPage() {
  return <KanbanBoard basePath={ROUTES.member.marketing} domain="marketing" />
}
