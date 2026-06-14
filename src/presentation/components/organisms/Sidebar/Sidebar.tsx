/**
 * Sidebar — Navegación lateral principal del sistema
 *
 * Arquitectura de grupos (v2):
 *   Grupo 1 · Inicio                — Dashboard
 *   Grupo 2 · Administración        — Hub de gestión (enlace directo + subítems)
 *   Grupo 3 · Atención clínica      — Enfermería, Psicología, Fisioterapia,
 *                                      Trabajo Social, Citas, Áreas
 *   Grupo 4 · Historial clínico     — Expedientes, Medicamentos, Condiciones, Vacunas
 *   Grupo 5 · Comunicación          — Notificaciones
 *   Grupo 6 · Configuración         — Hub de configuración (enlace directo + subítems)
 *   Grupo 7 · Perfil y seguridad    — Perfil personal, 2FA
 *
 * Reglas de visibilidad:
 *   - 2FA inactivo  → solo Inicio
 *   - Cada ítem declara `requiredModule`
 *   - Se muestra si el usuario tiene `view` sobre ese módulo
 *   - Un grupo se muestra si al menos uno de sus ítems es visible
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
  Settings,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { useTwoFactorStatus } from '../../../../infrastructure/flows/twoFactor';
import { usePermissions } from '../../../../utils/permissionUtils';
import './Sidebar.css';

/* ─── Types ───────────────────────────────────────────── */

type PermissionModule =
  | 'users' | 'roles' | 'permissions' | 'dashboard' | 'virtualFiles' | 'audits'
  | 'programs' | 'vaccines' | 'subPrograms' | 'entranceExit' | 'twoFactor'
  | 'nursing' | 'physiotherapy' | 'psychology' | 'socialWork' | 'clinicalHistory'
  | 'clinicalMedication' | 'medicalRecords' | 'emergencyContacts' | 'olderAdultFamily'
  | 'olderAdultUpdates' | 'specializedAreas' | 'specializedAppointments'
  | 'notifications';

interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  requiredModule?: PermissionModule;
  children?: MenuItem[];
}

interface NavSection {
  id: string;
  label: string | null;
  items: MenuItem[];
}

const ICON_CLASS = 'w-[18px] h-[18px]';

/* ─── Sección: Inicio ───────────────────────────────────── */

const SECTION_INICIO: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className={ICON_CLASS} /> },
];

/* ─── Sección: Administración ───────────────────────────── */

const SECTION_ADMINISTRACION: MenuItem[] = [
  {
    id: 'admin-hub',
    label: 'Administración',
    path: '/admin',
    icon: <LayoutGrid className={ICON_CLASS} />,
    // Sin requiredModule: el hub es accesible a cualquiera con 2FA activo;
    // cada tarjeta interna filtra por permiso real.
  },
  {
    id: 'residentes',
    label: 'Residentes',
    icon: <Users className={ICON_CLASS} />,
    requiredModule: 'virtualFiles',
    children: [
      { id: 'res-list',    label: 'Listado',         path: '/virtualFiles' },
      { id: 'res-create',  label: 'Crear registro',  path: '/virtualFiles/create' },
      { id: 'res-updates', label: 'Actualizaciones', path: '/older-adult-updates' },
    ],
  },
  {
    id: 'entradasSalidas',
    label: 'Entradas y Salidas',
    icon: <ArrowLeftRight className={ICON_CLASS} />,
    requiredModule: 'entranceExit',
    children: [
      { id: 'ee-dashboard', label: 'Dashboard', path: '/entrance-exit' },
      { id: 'ee-register',  label: 'Registrar', path: '/entrance-exit/register' },
      { id: 'ee-history',   label: 'Historial', path: '/entrance-exit/history' },
    ],
  },
  {
    id: 'programas',
    label: 'Programas',
    icon: <Calendar className={ICON_CLASS} />,
    requiredModule: 'programs',
    children: [
      { id: 'prog-list',   label: 'Listado', path: '/programs' },
      { id: 'prog-create', label: 'Crear',   path: '/programs/create' },
    ],
  },
  {
    id: 'subprogramas',
    label: 'Subprogramas',
    icon: <CalendarRange className={ICON_CLASS} />,
    requiredModule: 'subPrograms',
    children: [
      { id: 'sub-list',   label: 'Listado', path: '/sub-programs' },
      { id: 'sub-create', label: 'Crear',   path: '/sub-programs/create' },
    ],
  },
  {
    id: 'familiares',
    label: 'Familiares',
    path: '/older-adult-family',
    icon: <Users className={ICON_CLASS} />,
    requiredModule: 'olderAdultFamily',
  },
  {
    id: 'contactosEmerg',
    label: 'Contactos de Emergencia',
    path: '/emergency-contacts',
    icon: <PhoneCall className={ICON_CLASS} />,
    requiredModule: 'emergencyContacts',
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: <UserCog className={ICON_CLASS} />,
    requiredModule: 'users',
    children: [
      { id: 'usr-list',    label: 'Listado',    path: '/users' },
      { id: 'usr-create',  label: 'Crear',      path: '/users/create' },
      { id: 'usr-deleted', label: 'Eliminados', path: '/users/deleted' },
    ],
  },
  {
    id: 'roles',
    label: 'Roles',
    path: '/roles',
    icon: <Shield className={ICON_CLASS} />,
    requiredModule: 'roles',
  },
  {
    id: 'histCamb',
    label: 'Historial de Cambios',
    path: '/role-changes',
    icon: <History className={ICON_CLASS} />,
    requiredModule: 'roles',
  },
  {
    id: 'permisos',
    label: 'Permisos',
    path: '/permissions',
    icon: <KeyRound className={ICON_CLASS} />,
    requiredModule: 'permissions',
  },
  {
    id: 'auditoria',
    label: 'Auditoría',
    icon: <FileSearch className={ICON_CLASS} />,
    requiredModule: 'audits',
    children: [
      { id: 'aud-menu',      label: 'Menú',              path: '/audits' },
      { id: 'aud-list',      label: 'Listado',           path: '/audits/list' },
      { id: 'aud-dashboard', label: 'Dashboard',         path: '/audits/dashboard' },
      { id: 'aud-logs',      label: 'Logs de Actividad', path: '/audits/activity-logs' },
      { id: 'aud-security',  label: 'Seguridad',         path: '/audits/security' },
      { id: 'aud-health',    label: 'Salud del Sistema', path: '/audits/system-health' },
    ],
  },
];

/* ─── Sección: Atención clínica ─────────────────────────── */

const SECTION_CLINICA: MenuItem[] = [
  { id: 'enfermeria',   label: 'Enfermería',           path: '/nursing',                  icon: <Stethoscope    className={ICON_CLASS} />, requiredModule: 'nursing' },
  { id: 'psicologia',   label: 'Psicología',           path: '/psychology',               icon: <Brain          className={ICON_CLASS} />, requiredModule: 'psychology' },
  { id: 'fisioterapia', label: 'Fisioterapia',         path: '/physiotherapy',            icon: <Activity       className={ICON_CLASS} />, requiredModule: 'physiotherapy' },
  { id: 'trabajoSoc',   label: 'Trabajo Social',       path: '/social-work',              icon: <HeartHandshake className={ICON_CLASS} />, requiredModule: 'socialWork' },
  { id: 'citas',        label: 'Citas Especializadas', path: '/specialized-appointments', icon: <CalendarCheck  className={ICON_CLASS} />, requiredModule: 'specializedAppointments' },
  { id: 'areas',        label: 'Áreas Especializadas', path: '/specialized-areas',        icon: <Building2      className={ICON_CLASS} />, requiredModule: 'specializedAreas' },
];

/* ─── Sección: Historial clínico ────────────────────────── */

const SECTION_HISTORIAL: MenuItem[] = [
  { id: 'expedientes',  label: 'Expedientes Médicos', path: '/medical-records',     icon: <ClipboardList className={ICON_CLASS} />, requiredModule: 'medicalRecords' },
  { id: 'medicamentos', label: 'Medicamentos',        path: '/clinical-medication', icon: <Pill          className={ICON_CLASS} />, requiredModule: 'clinicalMedication' },
  { id: 'condiciones',  label: 'Condiciones',         path: '/clinical-history',    icon: <HeartPulse    className={ICON_CLASS} />, requiredModule: 'clinicalHistory' },
  { id: 'vacunas',      label: 'Vacunas',             path: '/vaccines',            icon: <Syringe       className={ICON_CLASS} />, requiredModule: 'vaccines' },
];

/* ─── Sección: Comunicación ─────────────────────────────── */

const SECTION_COMUNICACION: MenuItem[] = [
  { id: 'notificaciones', label: 'Notificaciones', path: '/notifications', icon: <Bell className={ICON_CLASS} />, requiredModule: 'notifications' },
];

/* ─── Sección: Configuración ────────────────────────────── */

const SECTION_CONFIGURACION: MenuItem[] = [
  {
    id: 'settings-hub',
    label: 'Configuración',
    path: '/settings',
    icon: <Settings className={ICON_CLASS} />,
    // Sin requiredModule: accesible a cualquier usuario con 2FA activo;
    // las subpáginas que requieran privilegios especiales los verifican internamente.
  },
];

/* ─── Sección: Perfil y seguridad personal ──────────────── */

const SECTION_PERFIL: MenuItem[] = [
  { id: 'perfil', label: 'Mi Perfil', path: '/profile',    icon: <UserCircle  className={ICON_CLASS} /> },
  { id: 'twofa',  label: '2FA',       path: '/two-factor', icon: <ShieldCheck className={ICON_CLASS} />, requiredModule: 'twoFactor' },
];

/* ─── Mapa completo de navegación ───────────────────────── */

const ALL_SECTIONS: NavSection[] = [
  { id: 'inicio',         label: null,                      items: SECTION_INICIO         },
  { id: 'administracion', label: 'Administración',          items: SECTION_ADMINISTRACION },
  { id: 'clinica',        label: 'Atención clínica',        items: SECTION_CLINICA        },
  { id: 'historial',      label: 'Historial clínico',       items: SECTION_HISTORIAL      },
  { id: 'comunicacion',   label: 'Comunicación',            items: SECTION_COMUNICACION   },
  { id: 'configuracion',  label: 'Configuración',           items: SECTION_CONFIGURACION  },
  { id: 'perfil',         label: 'Perfil y seguridad',      items: SECTION_PERFIL         },
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
  const { isLoaded: permsLoaded, canAccessModule } = usePermissions();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  /* Filtra un ítem por permiso real del backend */
  function isItemVisible(item: MenuItem): boolean {
    if (!item.requiredModule) return true;
    if (!permsLoaded) return false;
    return canAccessModule(item.requiredModule);
  }

  /* Auto-expand el grupo cuyo hijo coincide con la ruta actual */
  useEffect(() => {
    const activeId = findActiveGroupId(ALL_SECTIONS, location.pathname);
    if (activeId) {
      setOpenGroups(prev => prev[activeId] ? prev : { ...prev, [activeId]: true });
    }
  }, [location.pathname]);

  /* ── Secciones visibles ───────────────────────────────── */
  const visibleSections: NavSection[] = (() => {
    if (!isEnabled) {
      // 2FA desactivado → solo Inicio
      return ALL_SECTIONS
        .filter(s => s.id === 'inicio')
        .map(section => ({ ...section, items: section.items.filter(isItemVisible) }))
        .filter(s => s.items.length > 0);
    }
    return ALL_SECTIONS
      .map(section => ({ ...section, items: section.items.filter(isItemVisible) }))
      .filter(s => s.items.length > 0);
  })();

  /* ── Active checks ────────────────────────────────────── */
  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isGroupActive = (item: MenuItem) => isItemActive(item, location.pathname);

  /* ── Toggle grupo ─────────────────────────────────────── */
  const toggle = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <aside className="sidebar-root" aria-label="Menú lateral de navegación principal">
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
