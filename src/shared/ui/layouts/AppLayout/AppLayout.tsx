import type { ReactNode } from 'react';
import { useLocation } from '@/shared/navigation';
import Navbar from '@/shared/ui/navigation/Navbar/Navbar';
import Breadcrumbs from '@/shared/ui/navigation/Breadcrumbs/Breadcrumbs';
import Sidebar from '@/shared/ui/navigation/Sidebar/Sidebar';
import { NotificationCenter } from '@/shared/ui/notifications/NotificationCenter';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  // Páginas donde NO mostrar navbar/breadcrumbs (ej: login)
  const hideNavigation = ['/login', '/'].includes(location.pathname);

  if (hideNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:flex">
        {/* Sidebar (hidden on mobile) */}
        <Sidebar />

        {/* Right area (Navbar on top, breadcrumbs, content) */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <Navbar />

          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Main Content */}
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
        </div>
      </div>

      {/* Global UI Components */}
      <NotificationCenter />
    </div>
  );
}
