import type { Metadata } from 'next'
import ContactPage from '@/modules/marketing/presentation/pages/ContactPage'

export const metadata: Metadata = { title: 'Contacto' }

export default function PublicContactPage() {
  return <ContactPage />
}
