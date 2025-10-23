import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />
      
      {/* Breadcrumbs */}
      <Breadcrumbs />
      
      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
