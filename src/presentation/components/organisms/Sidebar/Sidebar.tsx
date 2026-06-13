/**
 * Sidebar — Mapa completo de navegación del sistema
 *
 * Arquitectura:
 *   Grupo 1 · Inicio              — Dashboard
 *   Grupo 2 · Operación diaria    — Residentes, E/S, Programas, Subprogramas,
 *                                   Familiares, Contactos emergencia, Actualizaciones
 *   Grupo 3 · Atención clínica   — Enfermería, Psicología, Fisioterapia,
 *                                   Trabajo Social, Citas, Áreas especializadas
 *   Grupo 4 · Historial clínico  — Expedientes, Medicamentos, Condiciones, Vacunas
 *   Grupo 5 · Comunicación       — Notificaciones
 *   Grupo 6 · Seguridad y acceso — Usuarios, Roles, Permisos, 2FA, Perfil
 *   Grupo 7 · Auditoría          — Auditoría (menú, listado, dashboard)
 *
 * Reglas de visibilidad:
 *   - 2FA inactivo  → solo Inicio (Dashboard)
 *   - Sin permisos administrativos → oculta Usuarios, Roles, Permisos y todo el grupo Auditoría
 *   - Con permisos → todo visible
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Calendar,
  CalendarRange,
  CalendarCheck,
  PhoneCall,
  History,
  Stethoscope,
  Brain,
  Activity,
  HeartHandshake,
  Building2,
  ClipboardList,
  Pill,
  HeartPulse,
  Syringe,
  Bell,
  UserCog,
  Shield,
  KeyRound,
  ShieldCheck,
  UserCircle,
  FileSearch,
  ChevronDown,
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

interface NavSection {
  id: string;
  label: string | null;
  items: MenuItem[];
  adminOnly?: boolean;
}

const ICON_CLASS = 'w-[18px] h-[18px]';

/* ─── Menú completo del sistema ────────────────────────── */

const SECTION_INICIO: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className={ICON_CLASS} /> },
];

const SECTION_OPERACION: MenuItem[] = [
  {
    id: 'residentes', label: 'Residentes', icon: <Users className={ICON_CLASS} />,
    children: [
      { id: 'res-list',     label: 'Listado',        path: '/virtualFiles' },
      { id: 'res-create',   label: 'Crear registro', path: '/virtualFiles/create' },
      { id: 'res-updates',  label: 'Actualizaciones', path: '/older-adult-updates' },
    ],
  },
  {
    id: 'entradasSalidas', label: 'Entradas y Salidas', icon: <ArrowLeftRight className={ICON_CLASS} />,
    children: [
      { id: 'ee-dashboard', label: 'Dashboard',  path: '/entrance-exit' },
      { id: 'ee-register',  label: 'Registrar',  path: '/entrance-exit/register' },
      { id: 'ee-history',   label: 'Historial',  path: '/entrance-exit/history' },
    ],
  },
  {
    id: 'programas', label: 'Programas', icon: <Calendar className={ICON_CLASS} />,
    children: [
      { id: 'prog-list',   label: 'Listado', path: '/programs' },
      { id: 'prog-create', label: 'Crear',    path: '/programs/create' },
    ],
  },
  {
    id: 'subprogramas', label: 'Subprogramas', icon: <CalendarRange className={ICON_CLASS} />,
    children: [
      { id: 'sub-list',   label: 'Listado', path: '/sub-programs' },
      { id: 'sub-create', label: 'Crear',    path: '/sub-programs/create' },
    ],
  },
  { id: 'familiares',     label: 'Familiares',            path: '/older-adult-family', icon: <Users className={ICON_CLASS} /> },
  { id: 'contactosEmerg', label: 'Contactos de Emergencia', path: '/emergency-contacts', icon: <PhoneCall className={ICON_CLASS} /> },
  { id: 'historialCamb',  label: 'Historial de Cambios',   path: '/older-adult-updates', icon: <History className={ICON_CLASS} /> },
];

const SECTION_CLINICA: MenuItem[] = [
  { id: 'enfermeria',   label: 'Enfermería',            path: '/nursing',                  icon: <Stethoscope    className={ICON_CLASS} /> },
  { id: 'psicologia',   label: 'Psicología',            path: '/psychology',               icon: <Brain          className={ICON_CLASS} /> },
  { id: 'fisioterapia', label: 'Fisioterapia',          path: '/physiotherapy',            icon: <Activity       className={ICON_CLASS} /> },
  { id: 'trabajoSoc',   label: 'Trabajo Social',        path: '/social-work',              icon: <HeartHandshake className={ICON_CLASS} /> },
  { id: 'citas',        label: 'Citas Especializadas',  path: '/specialized-appointments', icon: <CalendarCheck  className={ICON_CLASS} /> },
  { id: 'areas',        label: 'Áreas Especializadas',  path: '/specialized-areas',        icon: <Building2      className={ICON_CLASS} /> },
];

const SECTION_HISTORIAL: MenuItem[] = [
  { id: 'expedientes',  label: 'Expedientes Médicos',    path: '/medical-records',      icon: <ClipboardList className={ICON_CLASS} /> },
  { id: 'medicamentos', label: 'Medicamentos',           path: '/clinical-medication',  icon: <Pill          className={ICON_CLASS} /> },
  { id: 'condiciones',  label: 'Condiciones Clínicas',   path: '/clinical-history',     icon: <HeartPulse    className={ICON_CLASS} /> },
  { id: 'vacunas',      label: 'Vacunas',                path: '/vaccines',             icon: <Syringe       className={ICON_CLASS} /> },
];

const SECTION_COMUNICACION: MenuItem[] = [
  { id: 'notificaciones', label: 'Notificaciones', path: '/notifications', icon: <Bell className={ICON_CLASS} /> },
];

const SECTION_SEGURIDAD: MenuItem[] = [
  {
    id: 'usuarios', label: 'Usuarios', icon: <UserCog className={ICON_CLASS} />, adminOnly: true,
    children: [
      { id: 'usr-list',    label: 'Listado',    path: '/users' },
      { id: 'usr-create',  label: 'Crear',      path: '/users/create' },
      { id: 'usr-deleted', label: 'Eliminados', path: '/users/deleted' },
    ],
  },
  { id: 'roles',     label: 'Roles',      path: '/roles',       icon: <Shield      className={ICON_CLASS} />, adminOnly: true },
  { id: 'permisos',  label: 'Permisos',   path: '/permissions', icon: <KeyRound    className={ICON_CLASS} />, adminOnly: true },
  { id: 'twofa',     label: '2FA',        path: '/two-factor',  icon: <ShieldCheck className={ICON_CLASS} /> },
  { id: 'perfil',    label: 'Perfil',     path: '/profile',     icon: <UserCircle  className={ICON_CLASS} /> },
];

const SECTION_AUDITORIA: MenuItem[] = [
  {
    id: 'auditoria', label: 'Auditoría', icon: <FileSearch className={ICON_CLASS} />, adminOnly: true,
    children: [
      { id: 'aud-menu',      label: 'Menú',      path: '/audits' },
      { id: 'aud-list',      label: 'Listado',   path: '/audits/list' },
      { id: 'aud-dashboard', label: 'Dashboard', path: '/audits/dashboard' },
    ],
  },
];

const ALL_SECTIONS: NavSection[] = [
  { id: 'inicio',        label: null,              items: SECTION_INICIO,      adminOnly: false },
  { id: 'operacion',     label: 'Operación diaria', items: SECTION_OPERACION,   adminOnly: false },
  { id: 'clinica',       label: 'Atención clínica', items: SECTION_CLINICA,     adminOnly: false },
  { id: 'historial',     label: 'Historial clínico', items: SECTION_HISTORIAL,  adminOnly: false },
  { id: 'comunicacion',  label: 'Comunicación',     items: SECTION_COMUNICACION, adminOnly: false },
  { id: 'seguridad',     label: 'Seguridad y acceso', items: SECTION_SEGURIDAD, adminOnly: false },
  { id: 'auditoria',     label: 'Auditoría',        items: SECTION_AUDITORIA,   adminOnly: true  },
];

/* ─── Helpers ─────────────────────────────────────────── */

function findActiveGroupId(sections: NavSection[], pathname: string): string | null {
  for (const section of sections) {
    for (const item of section.items) {
      if (isItemActive(item, pathname)) return item.id;
    }
  }
  return null;
}

function isItemActive(item: MenuItem, pathname: string): boolean {
  if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) return true;
  return !!item.children?.some(c => c.path && (pathname === c.path || pathname.startsWith(c.path + '/')));
}

/* ─── Component ───────────────────────────────────────── */

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isEnabled } = useTwoFactorStatus();
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [openGroups, setOpenGroups]         = useState<Record<string, boolean>>({});

  /* Check admin permissions once */
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
  const visibleSections: NavSection[] = (() => {
    if (!isEnabled) {
      // 2FA disabled → only Inicio (Dashboard)
      return ALL_SECTIONS.filter(s => s.id === 'inicio');
    }
    const isAdmin = hasPermissions === true;
    return ALL_SECTIONS
      .map(section => {
        if (section.adminOnly && !isAdmin) return null;
        const items = section.items
          .map(item => item.adminOnly && !isAdmin ? null : item)
          .filter((i): i is MenuItem => i !== null);
        if (items.length === 0) return null;
        return { ...section, items };
      })
      .filter((s): s is NavSection => s !== null);
  })();

  /* ── Active checks ────────────────────────────────────── */
  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isGroupActive = (item: MenuItem) => isItemActive(item, location.pathname);

  /* ── Toggle group open/close ──────────────────────────── */
  const toggle = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <aside className="sidebar-root" aria-label="Menú lateral de navegación principal">

      {/* Scrollable nav */}
      <nav className="sidebar-nav">
        {visibleSections.map(section => (
          <div key={section.id}>
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
                        aria-controls={`sidebar-group-${item.id}`}
                      >
                        <span className="sidebar-item-icon" aria-hidden="true">{item.icon}</span>
                        <span className="sidebar-group-label">{item.label}</span>
                        <ChevronDown
                          className={`sidebar-chevron${openGroups[item.id] ? ' sidebar-chevron--open' : ''}`}
                          aria-hidden="true"
                        />
                      </button>

                      <ul
                        id={`sidebar-group-${item.id}`}
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

    </aside>
  );
}
