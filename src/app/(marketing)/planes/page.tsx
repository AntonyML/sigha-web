import type { Metadata } from 'next'
import PlansPage from '@/modules/marketing/presentation/pages/PlansPage'

export const metadata: Metadata = { title: 'Planes' }

export default function PublicPlansPage() {
  return <PlansPage />
}
