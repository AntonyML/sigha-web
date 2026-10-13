import type { Metadata } from 'next'
import FeaturesPage from '@/modules/marketing/presentation/pages/FeaturesPage'

export const metadata: Metadata = { title: 'Funcionalidades' }

export default function PublicFeaturesPage() {
  return <FeaturesPage />
}
