import type { Metadata } from 'next'
import AccessibilityPage from '@/modules/marketing/presentation/pages/AccessibilityPage'

export const metadata: Metadata = {
  title: 'Accesibilidad',
  description: 'Canal para reportar barreras y prácticas de accesibilidad de la experiencia pública de SIGHA.',
}

export default function PublicAccessibilityPage() {
  return <AccessibilityPage />
}
