/**
 * Sidebar
 *
 * Fixes aplicados (P1 + P2):
 *  ✅ Brand eliminado — ya está en Navbar
 *  ✅ Auto-expand grupo activo al montar y al cambiar ruta
 *  ✅ Chevron animado (rotate) — un solo ícono
 *  ✅ "Mi perfil" navega a /profile (estaba en /users)
 *  ✅ 2FA movido a UserMenu — eliminado del nav
 *  ✅ Sub-Programas como hijo de Programas
 *  ✅ Separadores de sección (Clínica / Administración / Sistema)
 *  ✅ compact mode eliminado — reemplazado por scroll natural
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  FileText,
  ChevronDown,
  Syringe,
  Shield,
  ClipboardList,
  List,
  UserCircle,
  Stethoscope,
  Activity,
  Brain,
  HeartHandshake,
} from 'lucide-react';
import { useTwoFactorStatus } from '../../../../infrastructure/flows/twoFactor';
import { PermissionUtils } from '../../../../utils/permissionUtils';
import './Sidebar.css';

/* ─── Types ───────────────────────────────────────────── */

interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

/* ─── Menu definition ─────────────────────────────────── */

const SECTION_GENERAL: MenuItem[] = [
  {
    id: 'main',
    label: 'Principal',
    path: '/main-menu',
    icon: <Home className="w-[18px] h-[18px]" />,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <ClipboardList className="w-[18px] h-[18px]" />,
  },
];

const SECTION_CLINICAL: MenuItem[] = [
  {
    id: 'virtualFiles',
    label: 'Adultos Mayores',
    icon: <Users className="w-[18px] h-[18px]" />,
    children: [
      { id: 'vf-list',   label: 'Listado',         path: '/virtualFiles' },
      { id: 'vf-create', label: 'Crear Registro',   path: '/virtualFiles/create' },
    ],
  },
  {
    id: 'vaccines',
    label: 'Vacunas',
    icon: <Syringe className="w-[18px] h-[18px]" />,
    children: [
      { id: 'vac-list',   label: 'Listado', path: '/vaccines' },
      { id: 'vac-create', label: 'Crear',   path: '/vaccines/create' },
    ],
  },
  {
    id: 'entranceExit',
    label: 'Entrada / Salida',
    icon: <List className="w-[18px] h-[18px]" />,
    children: [
      { id: 'ee-dashboard', label: 'Dashboard',  path: '/entrance-exit' },
      { id: 'ee-register',  label: 'Registrar',  path: '/entrance-exit/register' },
      { id: 'ee-history',   label: 'Historial',  path: '/entrance-exit/history' },
    ],
  },
  {
    id: 'nursing',
    label: 'Enfermería',
    icon: <Stethoscope className="w-[18px] h-[18px]" />,
    children: [
      { id: 'nur-dashboard',  label: 'Dashboard',  path: '/nursing' },
      { id: 'nur-new',        label: 'Nueva cita', path: '/nursing/appointments/new' },
      { id: 'nur-history',    label: 'Historial',  path: '/nursing/appointments/history' },
    ],
  },
  {
    id: 'physiotherapy',
    label: 'Fisioterapia',
    icon: <Activity className="w-[18px] h-[18px]" />,
    children: [
      { id: 'phy-list',   label: 'Listado', path: '/physiotherapy' },
      { id: 'phy-create', label: 'Crear',   path: '/physiotherapy/create' },
    ],
  },
  {
    id: 'psychology',
    label: 'Psicología',
    icon: <Brain className="w-[18px] h-[18px]" />,
    children: [
      { id: 'psy-list',   label: 'Listado', path: '/psychology' },
      { id: 'psy-create', label: 'Crear',   path: '/psychology/create' },
    ],
  },
  {
    id: 'socialWork',
    label: 'Trabajo Social',
    icon: <HeartHandshake className="w-[18px] h-[18px]" />,
    children: [
      { id: 'sw-list',   label: 'Listado', path: '/social-work' },
      { id: 'sw-create', label: 'Crear',   path: '/social-work/create' },
    ],
  },
];

const SECTION_ADMIN: MenuItem[] = [
  {
    id: 'programs',
    label: 'Programas',
    icon: <Calendar className="w-[18px] h-[18px]" />,
    children: [
      { id: 'programs-list',   label: 'Listado',       path: '/programs' },
      { id: 'programs-create', label: 'Crear',          path: '/programs/create' },
      { id: 'sub-list',        label: 'Sub-Programas',  path: '/sub-programs' },
      { id: 'sub-create',      label: 'Crear Sub-Prog', path: '/sub-programs/create' },
    ],
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: <Shield className="w-[18px] h-[18px]" />,
    children: [
      { id: 'users-list',    label: 'Listado',     path: '/users' },
      { id: 'users-create',  label: 'Crear',       path: '/users/create' },
      { id: 'users-deleted', label: 'Eliminados',  path: '/users/deleted' },
    ],
  },
  {
    id: 'audits',
    label: 'Auditoría',
    icon: <FileText className="w-[18px] h-[18px]" />,
    children: [
      { id: 'audit-menu',      label: 'Menú',      path: '/audits' },
      { id: 'audit-list',      label: 'Listado',   path: '/audits/list' },
      { id: 'audit-dashboard', label: 'Dashboard', path: '/audits/dashboard' },
    ],
  },
];

const ALL_SECTIONS = [
  { label: null,            items: SECTION_GENERAL  },
  { label: 'Clínica',      items: SECTION_CLINICAL },
  { label: 'Administración', items: SECTION_ADMIN  },
];

/* ─── Helpers ─────────────────────────────────────────── */

function findActiveGroupId(sections: typeof ALL_SECTIONS, pathname: string): string | null {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.children?.some(c => c.path && (pathname === c.path || pathname.startsWith(c.path + '/')))) {
        return item.id;
      }
    }
  }
  return null;
}

/* ─── Component ───────────────────────────────────────── */

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isEnabled } = useTwoFactorStatus();
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [openGroups, setOpenGroups]         = useState<Record<string, boolean>>({});

  /* Check permissions once */
  useEffect(() => {
    Promise.all([PermissionUtils.canViewAllUsers(), PermissionUtils.isSuperAdmin()])
      .then(([canManage, isSuper]) => setHasPermissions(canManage || isSuper))
      .catch(() => setHasPermissions(false));
  }, []);

  /* Auto-expand the group whose child matches the current route */
  useEffect(() => {
    const activeId = findActiveGroupId(ALL_SECTIONS, location.pathname);
    if (activeId) {
      setOpenGroups(prev => prev[activeId] ? prev : { ...prev, [activeId]: true });
    }
  }, [location.pathname]);

  /* ── Filtered sections ────────────────────────────────── */
  // El backend exige 2FA solo a SUPER_ADMIN / ADMIN
  // (role.service.ts::requiresTwoFactor). Para los demás roles, el sidebar
  // muestra los módulos clínicos aunque 2FA esté deshabilitado.
  const requires2FA =
    PermissionUtils.isSuperAdminSync() || PermissionUtils.isAdminSync();

  const visibleSections = (() => {
    if (requires2FA && !isEnabled) {
      // 2FA disabled para admin → solo Principal (sin Dashboard)
      return [{ label: null, items: SECTION_GENERAL.filter(i => i.id === 'main') }];
    }
    if (hasPermissions === false) {
      // No admin perms → General only
      return [{ label: null, items: SECTION_GENERAL }];
    }
    return ALL_SECTIONS;
  })();

  /* ── Active checks ────────────────────────────────────── */
  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isGroupActive = (item: MenuItem) =>
    !!item.children?.some(c => isActive(c.path));

  /* ── Toggle group open/close ──────────────────────────── */
  const toggle = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <aside className="sidebar-root" aria-label="Menú lateral de navegación">

      {/* Scrollable nav */}
      <nav className="sidebar-nav">
        {visibleSections.map((section, si) => (
          <div key={si}>
            {/* Section label */}
            {section.label && (
              <div className="sidebar-section-label" aria-hidden="true">
                {section.label}
              </div>
            )}

            <ul className="sidebar-list" role="list">
              {section.items.map(item => (
                <li key={item.id}>

                  {/* ── Leaf item (no children) ── */}
                  {!item.children?.length ? (
                    <button
                      className={`sidebar-btn${isActive(item.path) ? ' sidebar-btn--active' : ''}`}
                      onClick={() => navigate(item.path!)}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                      <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </button>

                  ) : (
                    /* ── Group item (with children) ── */
                    <div>
                      <button
                        className={`sidebar-group-trigger${isGroupActive(item) ? ' sidebar-group-trigger--active' : ''}`}
                        onClick={() => toggle(item.id)}
                        aria-expanded={!!openGroups[item.id]}
                      >
                        <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
                        <span className="sidebar-group-label">{item.label}</span>
                        <ChevronDown
                          className={`sidebar-chevron${openGroups[item.id] ? ' sidebar-chevron--open' : ''}`}
                          aria-hidden="true"
                        />
                      </button>

                      <ul
                        className={`sidebar-children${openGroups[item.id] ? ' sidebar-children--open' : ''}`}
                        role="list"
                      >
                        {item.children.map(child => (
                          <li key={child.id}>
                            <button
                              className={`sidebar-child-btn${isActive(child.path) ? ' sidebar-child-btn--active' : ''}`}
                              onClick={() => navigate(child.path!)}
                              aria-current={isActive(child.path) ? 'page' : undefined}
                            >
                              {child.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — Mi Perfil */}
      <div className="sidebar-footer">
        <button
          className="sidebar-footer-btn"
          onClick={() => navigate('/profile')}
          aria-current={isActive('/profile') ? 'page' : undefined}
        >
          <UserCircle className="sidebar-item-icon w-[18px] h-[18px]" aria-hidden="true" />
          Mi perfil
        </button>
      </div>

    </aside>
  );
}
