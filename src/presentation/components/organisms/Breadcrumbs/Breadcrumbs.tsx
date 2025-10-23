import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Mapeo de rutas a nombres legibles
const routeNameMap: Record<string, string> = {
  'main-menu': 'Inicio',
  'virtualFiles': 'Adultos Mayores',
  'create': 'Crear',
  'edit': 'Editar',
  'view': 'Ver Detalles',
  'users': 'Usuarios',
  'programs': 'Programas',
  'vaccines': 'Vacunas',
  'sub-programs': 'Sub-programas',
  'audits': 'Auditoría',
  'list': 'Listado',
  'dashboard': 'Dashboard',
  'two-factor': 'Autenticación 2FA',
  'entrance-exit': 'Entradas y Salidas',
  'register': 'Registrar',
  'history': 'Historial',
};

export default function Breadcrumbs() {
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const paths = location.pathname.split('/').filter((path) => path !== '');
    
    // Si estamos en login, no mostrar breadcrumbs
    if (paths.includes('login') || paths.length === 0) {
      return [];
    }

    const items: BreadcrumbItem[] = [];

    // Siempre agregar Home al inicio
    items.push({
      label: 'Inicio',
      path: '/main-menu',
    });

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      
      // Saltar IDs numéricos en los breadcrumbs (ej: /users/123)
      if (!isNaN(Number(path))) {
        return;
      }

      const label = routeNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
      
      items.push({
        label,
        path: currentPath,
      });
    });

    return items;
  }, [location.pathname]);

  // No mostrar breadcrumbs en login o si solo hay Home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 px-4 py-3 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm overflow-x-auto scrollbar-hide">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isHome = index === 0;

            return (
              <li key={item.path} className="flex items-center space-x-2 whitespace-nowrap">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                
                {isLast ? (
                  <span className="text-blue-600 font-semibold flex items-center space-x-1.5">
                    {isHome && <Home className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1.5 group"
                  >
                    {isHome && <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span className="group-hover:underline">{item.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
