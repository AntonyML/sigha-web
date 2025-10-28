import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  FileText,
  ChevronDown,
  ChevronRight,
  Syringe,
  Shield,
  ClipboardList,
  List,
  Tags,
} from 'lucide-react';
import { useTwoFactorStatus } from '../../../../infrastructure/flows/twoFactor';
import { PermissionUtils } from '../../../../utils/permissionUtils';

interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

const menu: MenuItem[] = [
  {
    id: 'main',
    label: 'Principal',
    path: '/main-menu',
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    id: 'virtualFiles',
    label: 'Adultos Mayores',
    icon: <Users className="w-5 h-5" />,
    children: [
      { id: 'vf-list', label: 'Listado', path: '/virtualFiles' },
      { id: 'vf-create', label: 'Crear Registro', path: '/virtualFiles/create' },
    ],
  },
  {
    id: 'programs',
    label: 'Programas',
    icon: <Calendar className="w-5 h-5" />,
    children: [
      { id: 'programs-list', label: 'Listado', path: '/programs' },
      { id: 'programs-create', label: 'Crear', path: '/programs/create' },
    ],
  },
  {
    id: 'subPrograms',
    label: 'Sub-Programas',
    icon: <Tags className="w-5 h-5" />,
    children: [
      { id: 'sub-list', label: 'Listado', path: '/sub-programs' },
      { id: 'sub-create', label: 'Crear', path: '/sub-programs/create' },
    ],
  },
  {
    id: 'vaccines',
    label: 'Vacunas',
    icon: <Syringe className="w-5 h-5" />,
    children: [
      { id: 'vac-list', label: 'Listado', path: '/vaccines' },
      { id: 'vac-create', label: 'Crear', path: '/vaccines/create' },
    ],
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: <Shield className="w-5 h-5" />,
    children: [
      { id: 'users-list', label: 'Listado', path: '/users' },
      { id: 'users-create', label: 'Crear', path: '/users/create' },
      { id: 'users-deleted', label: 'Eliminados', path: '/users/deleted' },
    ],
  },
  {
    id: 'entranceExit',
    label: 'Entrada/Salida',
    icon: <List className="w-5 h-5" />,
    children: [
      { id: 'ee-dashboard', label: 'Dashboard', path: '/entrance-exit' },
      { id: 'ee-register', label: 'Registrar', path: '/entrance-exit/register' },
      { id: 'ee-history', label: 'Historial', path: '/entrance-exit/history' },
    ],
  },
  {
    id: 'audits',
    label: 'Auditoría',
    icon: <FileText className="w-5 h-5" />,
    children: [
      { id: 'audit-menu', label: 'Menú', path: '/audits' },
      { id: 'audit-list', label: 'Listado', path: '/audits/list' },
      { id: 'audit-dashboard', label: 'Dashboard', path: '/audits/dashboard' },
    ],
  },
  {
    id: 'twoFactor',
    label: '2FA',
    path: '/two-factor',
    icon: <Shield className="w-5 h-5" />,
  },
];

export default function Sidebar() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [compact, setCompact] = useState(false);
  const [hasRequiredPermissions, setHasRequiredPermissions] = useState<boolean | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isEnabled } = useTwoFactorStatus();

  const toggleGroup = (id: string) => {
    setOpenGroups((s) => ({ ...s, [id]: !s[id] }));
  };

  // Verificar permisos del usuario
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const [canManageUsers, isSuperAdmin] = await Promise.all([
          PermissionUtils.canViewAllUsers(),
          PermissionUtils.isSuperAdmin()
        ]);
        setHasRequiredPermissions(canManageUsers || isSuperAdmin);
      } catch (error) {
        console.error('Error checking permissions:', error);
        setHasRequiredPermissions(false);
      }
    };

    checkPermissions();
  }, []);

  // Ajuste automático: si el contenido del nav excede la altura disponible,
  // activamos el modo compact (reduce paddings y tamaño de texto) para evitar scroll.
  useEffect(() => {
    const check = () => {
      const navEl = navRef.current;
      const headerH = headerRef.current ? headerRef.current.offsetHeight : 0;
      const footerH = footerRef.current ? footerRef.current.offsetHeight : 0;
      const available = window.innerHeight - headerH - footerH - 40; // margen

      if (navEl) {
        setCompact(navEl.scrollHeight > available);
      }
    };

    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Filtrar menú basado en estado del 2FA y permisos
  const getFilteredMenu = () => {
    // Si el usuario no tiene 2FA activado, mostrar solo opciones limitadas
    if (!isEnabled) {
      return menu.filter(item =>
        item.id === 'main' || // Inicio
        item.id === 'twoFactor' // 2FA
      );
    }

    // Si tiene 2FA activado pero no tiene permisos avanzados, mostrar opciones básicas
    if (hasRequiredPermissions === false) {
      return menu.filter(item =>
        item.id === 'main' ||
        item.id === 'dashboard' ||
        item.id === 'twoFactor'
      );
    }

    // Usuarios con permisos completos ven todo el menú
    return menu;
  };

  const filteredMenu = getFilteredMenu();

  return (
    <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 bg-white border-r border-gray-100 h-screen sticky top-0 z-40">
      <div ref={headerRef} className="flex items-center gap-3 px-3 py-3 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">ASOPOGUA</h2>
          <p className="text-[11px] text-gray-500">Panel de administración</p>
        </div>
      </div>

      <nav ref={navRef} className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {filteredMenu.map((m) => (
            <li key={m.id}>
              {m.children && m.children.length > 0 ? (
                <div className="group">
                  <button
                    onClick={() => toggleGroup(m.id)}
                    className={`w-full flex items-center justify-between rounded-md transition-colors ${
                      m.children.some((c) => isActive(c.path)) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    } ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={compact ? 'text-gray-500' : 'text-gray-500'}>{m.icon}</span>
                      <span className={compact ? 'text-xs' : ''}>{m.label}</span>
                    </div>
                    <span className="text-gray-400">
                      {openGroups[m.id] ? <ChevronDown className={compact ? 'w-3 h-3' : 'w-4 h-4'} /> : <ChevronRight className={compact ? 'w-3 h-3' : 'w-4 h-4'} />}
                    </span>
                  </button>

                  <ul className={`mt-1 pl-8 pr-1 overflow-hidden transition-[max-height] duration-200 ${openGroups[m.id] ? 'max-h-96' : 'max-h-0'}`}>
                    {m.children.map((child) => (
                      <li key={child.id} className={`mb-1 ${compact ? '' : ''}`}>
                        <button
                          onClick={() => navigate(child.path!)}
                          className={`w-full text-left rounded-md transition-colors ${isActive(child.path) ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'} ${compact ? 'px-2 py-1.5 text-xs' : 'px-2 py-2 text-sm'}`}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <button
                  onClick={() => navigate(m.path!)}
                  className={`w-full flex items-center rounded-md space-x-2 transition-colors ${isActive(m.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'} ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
                >
                  <span className={compact ? 'text-gray-500' : 'text-gray-500'}>{m.icon}</span>
                  <span className={compact ? 'text-xs' : ''}>{m.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div ref={footerRef} className="p-3 border-t border-gray-100">
        <button
          onClick={() => navigate('/users')}
          className={`w-full flex items-center gap-2 rounded-md text-gray-700 hover:bg-gray-50 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}
        >
          <Users className={compact ? 'w-3 h-3 text-gray-500' : 'w-4 h-4 text-gray-500'} />
          <span className={compact ? 'text-xs' : ''}>Mi perfil</span>
        </button>
      </div>
    </aside>
  );
}
