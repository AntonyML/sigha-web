/**
 * AdminHubPage — Centro de operaciones administrativas
 *
 * Punto de entrada único para toda la gestión operativa del sistema.
 * Agrupa entidades y módulos por dominio de negocio, respetando la
 * visibilidad por módulo mediante PermissionUtils.canAccessModule().
 *
 * Estructura de grupos:
 *   1. Seguridad y acceso
 *   2. Personas y cuentas
 *   3. Programas y participación
 *   4. Atención clínica
 *   5. Historial y expedientes
 *   6. Relaciones entre entidades
 *   7. Comunicación
 *   8. Auditoría y trazabilidad
 *
 * Reglas:
 *   - Solo se enlazan rutas existentes en App.tsx.
 *   - No hay texto de promesa, placeholder ni "próximamente".
 *   - Las tarjetas sin módulo visible no se renderizan.
 *   - Si un grupo queda vacío por permisos, no se renderiza.
 */

import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Shield,
  Users,
  KeyRound,
  History,
  ShieldCheck,
  UserCircle,
  UserCog,
  Calendar,
  CalendarRange,
  PhoneCall,
  Stethoscope,
  Brain,
  Activity,
  HeartHandshake,
  CalendarCheck,
  Building2,
  ClipboardList,
  Pill,
  HeartPulse,
  Syringe,
  Bell,
  FileSearch,
  ArrowLeftRight,
  BarChart3,
  ShieldAlert,
  Server,
  ListChecks,
  ChevronRight,
  Link2,
  GitMerge,
  Network,
} from 'lucide-react';
import { usePermissions } from '../../../utils/permissionUtils';
import '../../styles/lp.css';

/* ─── Tipos internos ──────────────────────────────────────── */

interface HubAction {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: ReactNode;
  module: string;
}

interface HubGroup {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent: string;
  bg: string;
  actions: HubAction[];
}

/* ─── Definición de grupos ────────────────────────────────── */

const GROUPS: HubGroup[] = [

  /* 1 · Seguridad y acceso */
  {
    id: 'security',
    title: 'Seguridad y acceso',
    subtitle: 'Identidades, privilegios, autenticación y trazabilidad de cambios.',
    icon: <Shield size={20} />,
    accent: '#0f766e',
    bg: 'rgba(15, 118, 110, 0.09)',
    actions: [
      {
        id: 'users',
        label: 'Usuarios',
        description: 'Cuentas activas, suspendidas y eliminadas.',
        path: '/users',
        icon: <UserCog size={16} />,
        module: 'users',
      },
      {
        id: 'roles',
        label: 'Roles',
        description: 'Catálogo de roles del sistema.',
        path: '/roles',
        icon: <Shield size={16} />,
        module: 'roles',
      },
      {
        id: 'permissions',
        label: 'Permisos',
        description: 'Matriz de permisos por rol y módulo.',
        path: '/permissions',
        icon: <KeyRound size={16} />,
        module: 'permissions',
      },
      {
        id: 'role-changes',
        label: 'Historial de cambios de rol',
        description: 'Trazabilidad de todas las asignaciones y revocaciones.',
        path: '/role-changes',
        icon: <History size={16} />,
        module: 'roles',
      },
      {
        id: 'two-factor',
        label: 'Autenticación 2FA',
        description: 'Estado y gestión del segundo factor de autenticación.',
        path: '/two-factor',
        icon: <ShieldCheck size={16} />,
        module: 'twoFactor',
      },
    ],
  },

  /* 2 · Personas y cuentas */
  {
    id: 'people',
    title: 'Personas y cuentas',
    subtitle: 'Adultos mayores, familiares, contactos de emergencia y perfiles de usuario.',
    icon: <Users size={20} />,
    accent: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.09)',
    actions: [
      {
        id: 'residents',
        label: 'Adultos mayores',
        description: 'Fichas virtuales, datos personales y estado.',
        path: '/virtualFiles',
        icon: <UserCircle size={16} />,
        module: 'virtualFiles',
      },
      {
        id: 'family',
        label: 'Familiares',
        description: 'Red familiar vinculada a cada residente.',
        path: '/older-adult-family',
        icon: <Users size={16} />,
        module: 'olderAdultFamily',
      },
      {
        id: 'contacts',
        label: 'Contactos de emergencia',
        description: 'Personas de contacto para situaciones urgentes.',
        path: '/emergency-contacts',
        icon: <PhoneCall size={16} />,
        module: 'emergencyContacts',
      },
      {
        id: 'updates',
        label: 'Actualizaciones de residentes',
        description: 'Bitácora de cambios en fichas de adultos mayores.',
        path: '/older-adult-updates',
        icon: <ListChecks size={16} />,
        module: 'olderAdultUpdates',
      },
      {
        id: 'profile',
        label: 'Mi perfil',
        description: 'Datos personales y configuración de la cuenta.',
        path: '/profile',
        icon: <UserCircle size={16} />,
        module: 'dashboard', // público
      },
    ],
  },

  /* 3 · Programas y participación */
  {
    id: 'programs',
    title: 'Programas y participación',
    subtitle: 'Oferta programática institucional y subprogramas de atención.',
    icon: <Calendar size={20} />,
    accent: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.09)',
    actions: [
      {
        id: 'programs',
        label: 'Programas',
        description: 'Programas institucionales activos.',
        path: '/programs',
        icon: <Calendar size={16} />,
        module: 'programs',
      },
      {
        id: 'sub-programs',
        label: 'Subprogramas',
        description: 'Derivaciones y subgrupos de cada programa.',
        path: '/sub-programs',
        icon: <CalendarRange size={16} />,
        module: 'subPrograms',
      },
    ],
  },

  /* 4 · Atención clínica */
  {
    id: 'clinical',
    title: 'Atención clínica',
    subtitle: 'Servicios de salud por especialidad: enfermería, psicología, fisioterapia y trabajo social.',
    icon: <Stethoscope size={20} />,
    accent: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.09)',
    actions: [
      {
        id: 'nursing',
        label: 'Enfermería',
        description: 'Citas, controles y registros de enfermería.',
        path: '/nursing',
        icon: <Stethoscope size={16} />,
        module: 'nursing',
      },
      {
        id: 'physiotherapy',
        label: 'Fisioterapia',
        description: 'Sesiones y evolución fisioterapéutica.',
        path: '/physiotherapy',
        icon: <Activity size={16} />,
        module: 'physiotherapy',
      },
      {
        id: 'psychology',
        label: 'Psicología',
        description: 'Sesiones y seguimiento psicológico.',
        path: '/psychology',
        icon: <Brain size={16} />,
        module: 'psychology',
      },
      {
        id: 'social-work',
        label: 'Trabajo social',
        description: 'Reportes y gestión de trabajo social.',
        path: '/social-work',
        icon: <HeartHandshake size={16} />,
        module: 'socialWork',
      },
      {
        id: 'appointments',
        label: 'Citas especializadas',
        description: 'Agenda de citas por área y paciente.',
        path: '/specialized-appointments',
        icon: <CalendarCheck size={16} />,
        module: 'specializedAppointments',
      },
      {
        id: 'areas',
        label: 'Áreas especializadas',
        description: 'Catálogo de áreas donde se realizan citas.',
        path: '/specialized-areas',
        icon: <Building2 size={16} />,
        module: 'specializedAreas',
      },
    ],
  },

  /* 5 · Historial y expedientes */
  {
    id: 'records',
    title: 'Historial y expedientes',
    subtitle: 'Historia clínica, medicación activa, condiciones diagnosticadas y esquema de vacunación.',
    icon: <ClipboardList size={20} />,
    accent: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.09)',
    actions: [
      {
        id: 'medical-records',
        label: 'Expedientes médicos',
        description: 'Registros clínicos completos de cada residente.',
        path: '/medical-records',
        icon: <ClipboardList size={16} />,
        module: 'medicalRecords',
      },
      {
        id: 'conditions',
        label: 'Condiciones clínicas',
        description: 'Diagnósticos y condiciones médicas registradas.',
        path: '/clinical-history',
        icon: <HeartPulse size={16} />,
        module: 'clinicalHistory',
      },
      {
        id: 'medication',
        label: 'Medicamentos',
        description: 'Medicación activa y tratamientos farmacológicos.',
        path: '/clinical-medication',
        icon: <Pill size={16} />,
        module: 'clinicalMedication',
      },
      {
        id: 'vaccines',
        label: 'Vacunas',
        description: 'Esquema de vacunación por residente.',
        path: '/vaccines',
        icon: <Syringe size={16} />,
        module: 'vaccines',
      },
    ],
  },

  /* 6 · Relaciones entre entidades */
  {
    id: 'relations',
    title: 'Relaciones entre entidades',
    subtitle: 'Navegación cruzada entre los módulos del sistema. Cada ítem lleva al módulo que une los objetos relacionados.',
    icon: <Network size={20} />,
    accent: '#be185d',
    bg: 'rgba(190, 24, 93, 0.09)',
    actions: [
      {
        id: 'rel-roles-perms',
        label: 'Roles ↔ Permisos',
        description: 'Gestionar qué puede hacer cada rol en cada módulo.',
        path: '/permissions',
        icon: <GitMerge size={16} />,
        module: 'permissions',
      },
      {
        id: 'rel-user-roles',
        label: 'Usuarios ↔ Roles',
        description: 'Ver y modificar los roles asignados a cada cuenta.',
        path: '/users',
        icon: <Link2 size={16} />,
        module: 'users',
      },
      {
        id: 'rel-resident-family',
        label: 'Adultos mayores ↔ Familia',
        description: 'Red familiar y contactos vinculados a cada residente.',
        path: '/older-adult-family',
        icon: <Users size={16} />,
        module: 'olderAdultFamily',
      },
      {
        id: 'rel-resident-programs',
        label: 'Adultos mayores ↔ Programas',
        description: 'Subprogramas en que participa cada residente.',
        path: '/sub-programs',
        icon: <CalendarRange size={16} />,
        module: 'subPrograms',
      },
      {
        id: 'rel-appt-area',
        label: 'Citas ↔ Áreas ↔ Pacientes',
        description: 'Agenda de citas cruzada con áreas y residentes.',
        path: '/specialized-appointments',
        icon: <CalendarCheck size={16} />,
        module: 'specializedAppointments',
      },
      {
        id: 'rel-record-conditions',
        label: 'Expediente ↔ Condiciones ↔ Medicación',
        description: 'Historia clínica, diagnósticos y tratamientos activos.',
        path: '/medical-records',
        icon: <ClipboardList size={16} />,
        module: 'medicalRecords',
      },
      {
        id: 'rel-role-changes',
        label: 'Cambios de rol ↔ Usuarios ↔ Admin',
        description: 'Trazabilidad completa de modificaciones de acceso.',
        path: '/role-changes',
        icon: <History size={16} />,
        module: 'roles',
      },
      {
        id: 'rel-entrance-resident',
        label: 'Entradas y salidas ↔ Residentes',
        description: 'Movimientos físicos diarios de adultos mayores.',
        path: '/entrance-exit',
        icon: <ArrowLeftRight size={16} />,
        module: 'entranceExit',
      },
    ],
  },

  /* 7 · Comunicación */
  {
    id: 'comms',
    title: 'Comunicación',
    subtitle: 'Notificaciones internas generadas por el sistema o por el equipo administrativo.',
    icon: <Bell size={20} />,
    accent: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.09)',
    actions: [
      {
        id: 'notifications',
        label: 'Notificaciones',
        description: 'Bandeja de notificaciones y creación de nuevas.',
        path: '/notifications',
        icon: <Bell size={16} />,
        module: 'notifications',
      },
    ],
  },

  /* 8 · Auditoría y trazabilidad */
  {
    id: 'audit',
    title: 'Auditoría y trazabilidad',
    subtitle: 'Bitácora operativa, seguridad del sistema, logs de actividad y entradas / salidas físicas.',
    icon: <FileSearch size={20} />,
    accent: '#1e293b',
    bg: 'rgba(30, 41, 59, 0.09)',
    actions: [
      {
        id: 'audits-menu',
        label: 'Menú de auditoría',
        description: 'Punto de entrada al módulo de auditoría.',
        path: '/audits',
        icon: <FileSearch size={16} />,
        module: 'audits',
      },
      {
        id: 'audits-list',
        label: 'Listado de auditoría',
        description: 'Registro completo de eventos auditados.',
        path: '/audits/list',
        icon: <ListChecks size={16} />,
        module: 'audits',
      },
      {
        id: 'audits-dashboard',
        label: 'Dashboard de auditoría',
        description: 'Visualización analítica de eventos y tendencias.',
        path: '/audits/dashboard',
        icon: <BarChart3 size={16} />,
        module: 'audits',
      },
      {
        id: 'audits-activity',
        label: 'Logs de actividad',
        description: 'Detalle de acciones realizadas por usuario y sesión.',
        path: '/audits/activity-logs',
        icon: <History size={16} />,
        module: 'audits',
      },
      {
        id: 'audits-security',
        label: 'Auditoría de seguridad',
        description: 'Intentos de acceso, bloqueos y eventos de seguridad.',
        path: '/audits/security',
        icon: <ShieldAlert size={16} />,
        module: 'audits',
      },
      {
        id: 'audits-health',
        label: 'Salud del sistema',
        description: 'Estado de servicios, diagnóstico y observabilidad.',
        path: '/audits/system-health',
        icon: <Server size={16} />,
        module: 'audits',
      },
      {
        id: 'entrance-exit',
        label: 'Entradas y salidas',
        description: 'Movimientos físicos diarios registrados de residentes.',
        path: '/entrance-exit',
        icon: <ArrowLeftRight size={16} />,
        module: 'entranceExit',
      },
      {
        id: 'entrance-history',
        label: 'Historial de movimientos',
        description: 'Registro histórico de todas las entradas y salidas.',
        path: '/entrance-exit/history',
        icon: <ListChecks size={16} />,
        module: 'entranceExit',
      },
    ],
  },
];

/* ─── Componente de tarjeta de acción ─────────────────────── */

function ActionCard({ action, onNavigate }: { action: HubAction; onNavigate: (path: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(action.path)}
      className="lp-btn lp-btn--back"
      style={{
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '0.625rem 0.875rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
        textAlign: 'left',
        cursor: 'pointer',
        gap: '0.625rem',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
        <span style={{ color: '#94a3b8', marginTop: '1px', flexShrink: 0 }}>{action.icon}</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{action.label}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>{action.description}</span>
        </span>
      </span>
      <ChevronRight size={14} color="#cbd5e1" style={{ flexShrink: 0, marginTop: '3px' }} />
    </button>
  );
}

/* ─── Componente de grupo ─────────────────────────────────── */

function DomainGroup({ group, onNavigate }: { group: HubGroup; onNavigate: (path: string) => void }) {
  const { canAccessModule } = usePermissions();

  const visible = group.actions.filter(a => canAccessModule(a.module));
  if (visible.length === 0) return null;

  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.875rem',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Header del grupo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #f1f5f9',
          background: group.bg,
        }}
      >
        <div
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.5rem',
            background: '#ffffff',
            color: group.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {group.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.3,
            }}
          >
            {group.title}
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0',
              fontSize: '0.78125rem',
              color: '#64748b',
              lineHeight: 1.4,
            }}
          >
            {group.subtitle}
          </p>
        </div>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: group.accent,
            background: '#ffffff',
            border: `1px solid ${group.accent}22`,
            borderRadius: '999px',
            padding: '0.15rem 0.55rem',
            flexShrink: 0,
            alignSelf: 'flex-start',
          }}
        >
          {visible.length} {visible.length === 1 ? 'módulo' : 'módulos'}
        </span>
      </div>

      {/* Acciones del grupo */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '0.375rem',
          padding: '0.875rem',
        }}
      >
        {visible.map(action => (
          <ActionCard key={action.id} action={action} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}

/* ─── Página principal ────────────────────────────────────── */

export default function AdminHubPage() {
  const navigate = useNavigate();
  const { isLoaded, canAccessModule } = usePermissions();

  // Total de módulos visibles para el encabezado
  const totalVisible = GROUPS.reduce((sum, g) => {
    return sum + g.actions.filter(a => canAccessModule(a.module)).length;
  }, 0);

  return (
    <div className="lp-page">

      {/* ── Encabezado ─────────────────────────────────────── */}
      <header className="lp-header" style={{ alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="lp-title" style={{ fontSize: '1.625rem' }}>
            Administración
          </h1>
          <p style={{ margin: '0.375rem 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '680px' }}>
            Centro de operaciones del sistema. Gestiona usuarios, roles, permisos, residentes,
            programas, atención clínica, expedientes, auditoría y trazabilidad operativa
            desde un único punto de acceso.
          </p>
        </div>

        {isLoaded && totalVisible > 0 && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.625rem',
              padding: '0.625rem 1rem',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {totalVisible}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500, marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
              módulos accesibles
            </div>
          </div>
        )}
      </header>

      {/* ── Accesos rápidos ────────────────────────────────── */}
      {isLoaded && (
        <nav
          aria-label="Accesos rápidos"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {[
            { label: 'Usuarios',      path: '/users',            module: 'users'       },
            { label: 'Roles',         path: '/roles',            module: 'roles'       },
            { label: 'Permisos',      path: '/permissions',      module: 'permissions' },
            { label: 'Residentes',    path: '/virtualFiles',     module: 'virtualFiles'},
            { label: 'Programas',     path: '/programs',         module: 'programs'    },
            { label: 'Enfermería',    path: '/nursing',          module: 'nursing'     },
            { label: 'Expedientes',   path: '/medical-records',  module: 'medicalRecords'},
            { label: 'Auditoría',     path: '/audits',           module: 'audits'      },
            { label: 'Notificaciones',path: '/notifications',    module: 'notifications'},
            { label: 'E/S diarias',   path: '/entrance-exit',    module: 'entranceExit'},
          ]
            .filter(item => canAccessModule(item.module))
            .map(item => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '999px',
                  border: '1.5px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'border-color 0.13s, color 0.13s, background 0.13s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563eb';
                  (e.currentTarget as HTMLButtonElement).style.color = '#2563eb';
                  (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
                  (e.currentTarget as HTMLButtonElement).style.color = '#475569';
                  (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                }}
              >
                {item.label}
              </button>
            ))}
        </nav>
      )}

      {/* ── Spinner mientras cargan permisos ───────────────── */}
      {!isLoaded && (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Cargando módulos…</span>
        </div>
      )}

      {/* ── Grupos de dominio ──────────────────────────────── */}
      {isLoaded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {GROUPS.map(group => (
            <DomainGroup
              key={group.id}
              group={group}
              onNavigate={navigate}
            />
          ))}
        </div>
      )}

      {/* ── Pie informativo ────────────────────────────────── */}
      {isLoaded && (
        <footer
          style={{
            padding: '1rem 1.25rem',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            fontSize: '0.8125rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            lineHeight: 1.5,
          }}
        >
          <ShieldAlert size={18} color="#0f766e" style={{ flexShrink: 0 }} />
          <span>
            La visibilidad de cada módulo se determina por los permisos efectivos del usuario autenticado.
            Si no ves un módulo que esperas, solicita al administrador que revise tu asignación de roles.
          </span>
        </footer>
      )}

    </div>
  );
}
