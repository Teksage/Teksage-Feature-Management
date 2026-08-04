import { FeatureDetail } from '@/features/shared/features/feature-detail'
import { ROUTES } from '@/lib/constants'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminFeatureDetailPage({ params }: Props) {
  const { id } = await params
  return <FeatureDetail featureId={id} basePath={ROUTES.admin.features} canManageStatus={true} />
}
