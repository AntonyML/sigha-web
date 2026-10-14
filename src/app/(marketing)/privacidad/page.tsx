import type { Metadata } from 'next'
import PrivacyPage from '@/modules/marketing/presentation/pages/PrivacyPage'

export const metadata: Metadata = {
  title: 'Privacidad y seguridad',
  description: 'Información sobre controles de acceso y consultas de privacidad en SIGHA.',
}

export default function PublicPrivacyPage() {
  return <PrivacyPage />
}
