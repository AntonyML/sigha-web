import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Bell, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  mobileOnly?: boolean;
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: <Home className="w-5 h-5" />,
      path: '/main-menu',
    },
    {
      id: 'older-adults',
      label: 'Adultos Mayores',
      icon: <Users className="w-5 h-5" />,
      path: '/virtualFiles',
    },
    {
      id: 'activities',
      label: 'Actividades',
      icon: <Calendar className="w-5 h-5" />,
      path: '/programs',
    },
    {
      id: 'audits',
      label: 'Auditoría',
      icon: <Bell className="w-5 h-5" />,
      path: '/audits',
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: <User className="w-5 h-5" />,
      path: '/users',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Desktop Navbar - Top */}
      <nav className="hidden md:block bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  ASOPOGUA
                </h1>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={isActive(item.path) ? 'scale-110' : ''}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex flex-col items-center justify-center space-y-1 transition-all duration-200
                ${
                  isActive(item.path)
                    ? 'text-blue-600'
                    : 'text-gray-600 active:scale-95'
                }
              `}
            >
              <span
                className={`
                  transition-transform duration-200
                  ${isActive(item.path) ? 'scale-110 -translate-y-0.5' : ''}
                `}
              >
                {item.icon}
              </span>
              <span
                className={`
                  text-xs font-medium transition-all duration-200
                  ${isActive(item.path) ? 'opacity-100 font-semibold' : 'opacity-70'}
                `}
              >
                {item.label}
              </span>
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Top Bar (optional info) */}
      <div className="md:hidden bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-gray-900">ASOPOGUA</span>
          </div>
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </>
  );
}
