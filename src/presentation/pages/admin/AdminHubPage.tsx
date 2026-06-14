/**
 * AdminHubPage — Centro de operaciones administrativas
 *
 * Punto de entrada único para toda la gestión operativa del sistema.
 * Agrupa las entidades en dominios de negocio y respeta la visibilidad
 * por módulo de PermissionUtils (canAccessModule).
 *
 * Responsabilidad: navegación entre dominios, no CRUD directo.
 * Las acciones reales (listar/crear/editar) viven en sus páginas
 * dedicadas (users, roles, virtualFiles, etc.).
 *
 * Estructura:
 *   1. Header con título + subtítulo
 *   2. Tarjetas de dominio (grid responsivo)
 *      - Seguridad y acceso
 *      - Personas
 *      - Programas
 *      - Atención clínica
 *      - Citas y agendas
 *      - Expedientes
 *      - Comunicación
 *      - Monitoreo
 *      - Relaciones y flujos
 *   3. Footer informativo
 */

import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Building2, Users, Shield, KeyRound, History, UserCog,
  Heart, Calendar, CalendarRange, PhoneCall,
  Stethoscope, Activity, Brain, HeartHandshake,
  CalendarCheck, ClipboardList, Pill, HeartPulse, Syringe,
  Bell, FileSearch, ArrowLeftRight, UserCircle,
  Network, ShieldAlert,
  ChevronRight, Lock, ListChecks, AlarmClock,
  Stethoscope as StethoIcon, IdCard,
} from 'lucide-react';
import { usePermissions } from '../../../utils/permissionUtils';
import '../../styles/lp.css';

interface DomainAction {
  id: string;
  label: string;
  path: string;
  description: string;
  module: string;
}

interface Domain {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent: string;
  bg: string;
  actions: DomainAction[];
}

const DOMAINS: Domain[] = [
  {
    id: 'security',
    title: 'Seguridad y acceso',
    description: 'Identidades, permisos, historial de cambios y auditoría de accesos.',
    icon: <Shield size={22} />,
    accent: '#0f766e',
    bg: 'rgba(15, 118, 110, 0.10)',
    actions: [
      { id: 'users',       label: 'Usuarios',            path: '/users',        description: 'Cuentas, estado, contraseñas.',     module: 'users' },
      { id: 'roles',       label: 'Roles',               path: '/roles',        description: 'Catálogo de roles del sistema.',     module: 'roles' },
      { id: 'perms',       label: 'Permisos',            path: '/permissions',  description: 'Matriz de permisos por rol.',        module: 'permissions' },
      { id: 'rchist',      label: 'Historial de cambios', path: '/role-changes', description: 'Trazabilidad de asignaciones.',      module: 'roles' },
    ],
  },
  {
    id: 'people',
    title: 'Gestión de personas',
    description: 'Adultos mayores, familiares y contactos de emergencia.',
    icon: <UserCircle size={22} />,
    accent: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.10)',
    actions: [
      { id: 'residents',   label: 'Adultos mayores',          path: '/virtualFiles',        description: 'Fichas virtuales y datos personales.', module: 'virtualFiles' },
      { id: 'family',      label: 'Familiares',               path: '/older-adult-family',  description: 'Red familiar de cada residente.',     module: 'olderAdultFamily' },
      { id: 'contacts',    label: 'Contactos de emergencia',  path: '/emergency-contacts',  description: 'Contactos para casos urgentes.',       module: 'emergencyContacts' },
    ],
  },
  {
    id: 'programs',
    title: 'Programas y subprogramas',
    description: 'Oferta programática institucional.',
    icon: <Calendar size={22} />,
    accent: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.10)',
    actions: [
      { id: 'programs',    label: 'Programas',    path: '/programs',     description: 'Programas institucionales.', module: 'programs' },
      { id: 'subprograms', label: 'Subprogramas', path: '/sub-programs', description: 'Subprogramas derivados.',     module: 'subPrograms' },
    ],
  },
  {
    id: 'clinical',
    title: 'Atención clínica',
    description: 'Servicios clínicos por especialidad.',
    icon: <StethoIcon size={22} />,
    accent: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.10)',
    actions: [
      { id: 'nursing',     label: 'Enfermería',    path: '/nursing',     description: 'Citas, controles y registros.',  module: 'nursing' },
      { id: 'physio',      label: 'Fisioterapia',  path: '/physiotherapy', description: 'Sesiones de fisioterapia.',     module: 'physiotherapy' },
      { id: 'psycho',      label: 'Psicología',    path: '/psychology',  description: 'Sesiones de psicología.',        module: 'psychology' },
      { id: 'social',      label: 'Trabajo social', path: '/social-work', description: 'Reportes de trabajo social.',    module: 'socialWork' },
    ],
  },
  {
    id: 'appts',
    title: 'Citas y agendas',
    description: 'Agendamiento entre pacientes, áreas y staff.',
    icon: <CalendarCheck size={22} />,
    accent: '#d97706',
    bg: 'rgba(217, 119, 6, 0.10)',
    actions: [
      { id: 'appts',  label: 'Citas especializadas',  path: '/specialized-appointments', description: 'Agenda de citas por especialidad.', module: 'specializedAppointments' },
      { id: 'areas',  label: 'Áreas especializadas',   path: '/specialized-areas',        description: 'Áreas donde se atienden citas.',     module: 'specializedAreas' },
    ],
  },
  {
    id: 'records',
    title: 'Expedientes y salud',
    description: 'Historia clínica, medicación, condiciones y vacunas.',
    icon: <ClipboardList size={22} />,
    accent: '#16a34a',
    bg: 'rgba(22, 163, 74, 0.10)',
    actions: [
      { id: 'records',     label: 'Expedientes médicos',  path: '/medical-records',      description: 'Registros clínicos de residentes.', module: 'medicalRecords' },
      { id: 'conditions',  label: 'Condiciones clínicas', path: '/clinical-history',     description: 'Condiciones médicas registradas.',   module: 'clinicalHistory' },
      { id: 'meds',        label: 'Medicamentos',         path: '/clinical-medication',  description: 'Catálogo de medicación.',           module: 'clinicalMedication' },
      { id: 'vaccines',    label: 'Vacunas',              path: '/vaccines',             description: 'Esquema de vacunación.',            module: 'vaccines' },
    ],
  },
  {
    id: 'comms',
    title: 'Comunicación',
    description: 'Notificaciones internas del sistema.',
    icon: <Bell size={22} />,
    accent: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.10)',
    actions: [
      { id: 'notifs', label: 'Notificaciones', path: '/notifications', description: 'Bandeja de notificaciones.', module: 'notifications' },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoreo y auditoría',
    description: 'Trazabilidad operativa y entradas / salidas.',
    icon: <FileSearch size={22} />,
    accent: '#1e293b',
    bg: 'rgba(30, 41, 59, 0.10)',
    actions: [
      { id: 'audits',    label: 'Auditoría',          path: '/audits',         description: 'Bitácora y dashboard de auditoría.', module: 'audits' },
      { id: 'entrance',  label: 'Entradas y salidas', path: '/entrance-exit',  description: 'Movimientos físicos de residentes.', module: 'entranceExit' },
    ],
  },
  {
    id: 'relations',
    title: 'Relaciones y flujos',
    description: 'Vistas cruzadas entre personas, programas y servicios.',
    icon: <Network size={22} />,
    accent: '#be185d',
    bg: 'rgba(190, 24, 93, 0.10)',
    actions: [
      { id: 'updates',  label: 'Actualizaciones',          path: '/older-adult-updates', description: 'Bitácora de cambios en fichas.',     module: 'olderAdultUpdates' },
      { id: 'sessions', label: 'Sesiones (próximamente)',  path: '#',                   description: 'Sesiones activas y cierres.',         module: 'users' },
      { id: 'logins',   label: 'Intentos de login (próximamente)', path: '#',          description: 'Bitácora de autenticación.',          module: 'audits' },
    ],
  },
];

function HubCard({ d }: { d: Domain }) {
  const navigate = useNavigate();
  const { canAccessModule } = usePermissions();

  const visible = d.actions.filter((a) => canAccessModule(a.module));
  if (visible.length === 0) return null;

  return (
    <div className="lp-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: d.bg, color: d.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {d.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="lp-title" style={{ fontSize: '1.0625rem' }}>{d.title}</h3>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.8125rem', lineHeight: 1.4 }}>{d.description}</p>
        </div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {visible.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => a.path !== '#' && navigate(a.path)}
              disabled={a.path === '#'}
              className="lp-btn lp-btn--back"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                padding: '0.55rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #f1f5f9',
                color: a.path === '#' ? '#94a3b8' : '#1e293b',
                cursor: a.path === '#' ? 'not-allowed' : 'pointer',
                opacity: a.path === '#' ? 0.6 : 1,
              }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.125rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{a.label}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.description}</span>
              </span>
              {a.path !== '#' && <ChevronRight size={16} color="#94a3b8" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminHubPage() {
  const { canAccessModule, isLoaded } = usePermissions();

  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h2 className="lp-title">
            <Building2 size={22} color="#0f766e" />
            Administración
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Centro de gestión operativa del sistema. Aquí encontrarás todos los
            dominios, sus entidades y sus relaciones.
          </p>
        </div>
      </div>

      {isLoaded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}>
          {DOMAINS.map((d) => {
            if (d.actions.every((a) => !canAccessModule(a.module))) return null;
            return <HubCard key={d.id} d={d} />;
          })}
        </div>
      )}

      <div style={{
        marginTop: '1.5rem',
        padding: '1rem 1.25rem',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        fontSize: '0.8125rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <ShieldAlert size={18} color="#0f766e" />
        <span>
          La visibilidad de cada tarjeta respeta los permisos del usuario
          autenticado. Las opciones marcadas como "próximamente" estarán
          disponibles en próximas iteraciones.
        </span>
      </div>
    </div>
  );
}
