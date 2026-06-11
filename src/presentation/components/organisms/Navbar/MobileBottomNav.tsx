import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, User } from 'lucide-react';
import './MobileBottomNav.css';

interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const NAV_ITEMS: MobileNavItem[] = [
  { id: 'home',         label: 'Inicio',         icon: <Home    className="mobile-nav-icon" />, path: '/main-menu'    },
  { id: 'residents',    label: 'Residentes',      icon: <Users   className="mobile-nav-icon" />, path: '/virtualFiles' },
  { id: 'activities',   label: 'Actividades',     icon: <Calendar className="mobile-nav-icon" />, path: '/programs'  },
  { id: 'profile',      label: 'Perfil',          icon: <User    className="mobile-nav-icon" />, path: '/profile'     },
];

export default function MobileBottomNav() {
  const navigate   = useNavigate();
  const location   = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`mobile-nav-item${active ? ' mobile-nav-item--active' : ''}`}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className="mobile-nav-icon-wrap" aria-hidden="true">
              {item.icon}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
            {active && <span className="mobile-nav-indicator" aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
