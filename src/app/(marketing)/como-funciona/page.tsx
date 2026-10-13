import type { Metadata } from 'next'
import HowItWorksPage from '@/modules/marketing/presentation/pages/HowItWorksPage'

export const metadata: Metadata = { title: 'Cómo funciona' }

export default function PublicHowItWorksPage() {
  return <HowItWorksPage />
}
