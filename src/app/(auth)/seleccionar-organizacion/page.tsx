import { Suspense } from 'react'
import OrganizationPickerPage from '@/modules/auth/presentation/pages/organization/OrganizationPickerPage'

export default function SelectOrganizationRoute() {
  return (
    <Suspense fallback={<div className="p-6 text-center" role="status">Cargando organizaciones...</div>}>
      <OrganizationPickerPage />
    </Suspense>
  )
}
