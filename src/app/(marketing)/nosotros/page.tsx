import type { Metadata } from 'next'
import AboutPage from '@/modules/marketing/presentation/pages/AboutPage'

export const metadata: Metadata = { title: 'Nosotros' }

export default function PublicAboutPage() {
  return <AboutPage />
}
