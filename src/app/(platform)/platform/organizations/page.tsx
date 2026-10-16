import type { Metadata } from 'next'
import PlatformOrganizationsPage from '@/modules/platform/presentation/pages/PlatformOrganizationsPage'

export const metadata: Metadata = {
  title: 'Organizaciones · Plataforma',
}

export default function Page() {
  return <PlatformOrganizationsPage />
}
