import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@/shared/styles/global.css'
import '@/shared/styles/legacy-pages.css'
import '@/shared/ui/data-display/Pagination/Pagination.css'
import '@/shared/ui/navigation/Navbar/GlobalSearch.css'
import '@/shared/ui/navigation/Navbar/MobileBottomNav.css'
import '@/shared/ui/navigation/Navbar/Navbar.css'
import '@/shared/ui/navigation/Navbar/NavbarBell.css'
import '@/shared/ui/navigation/Navbar/NavbarDateTime.css'
import '@/shared/ui/navigation/Navbar/UserMenu.css'
import '@/shared/ui/navigation/Sidebar/Sidebar.css'
import '@/modules/marketing/presentation/marketing.css'
import { AppProviders } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'SIGHa | Gestión integral para hogares de larga estancia',
    template: '%s | SIGHa',
  },
  description:
    'Una plataforma para coordinar la atención, los expedientes y la operación diaria de hogares de larga estancia.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
