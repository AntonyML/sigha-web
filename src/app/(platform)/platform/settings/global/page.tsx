import type { Metadata } from 'next'
import GlobalSettingsPage from '@/modules/workspace-settings/presentation/pages/settings/GlobalSettingsPage'

export const metadata: Metadata = {
  title: 'Configuración global · Plataforma',
}

export default function Page() {
  return <GlobalSettingsPage />
}
