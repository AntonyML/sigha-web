/**
 * MainMenuPage — Rediseño completo con 4 capas de progressive disclosure
 *
 * Capa 0  HeroStats        → métricas del día (siempre visible cuando 2FA activo)
 * Capa 1  Accesos rápidos  → 4 módulos de uso diario
 * Capa 2  Atención clínica → grid compacto de módulos especializados
 * Capa 3  Administración   → solo usuarios con permisos avanzados
 *
 * Lógica de acceso preservada:
 *  - loading || !2FA activo  → banner de 2FA, secciones ocultas
 *  - sin permisos avanzados  → Accesos Rápidos + Clínica (sin Administración)
 *  - permisos completos      → todo visible
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Stethoscope, ArrowLeftRight, CalendarDays,
  Activity, Brain, HeartHandshake, ClipboardList,
  CalendarCheck, Building2, HeartPulse, Pill, PhoneCall,
  Users, History, Syringe,
  UserCog, Shield, Lock, FileSearch, Bell,
  ShieldAlert, Loader2, ChevronRight,
} from 'lucide-react';

import { useTwoFactorStatus } from '../../../infrastructure/flows/twoFactor';
import { PermissionUtils }    from '../../../utils/permissionUtils';
import HeroStats              from './HeroStats';
import './MainMenuPage.css';

/* ─── Types ───────────────────────────────────────────── */

interface QuickItem {
  label:  string;
  desc:   string;
  route:  string;
  icon:   React.ReactNode;
  color:  'blue' | 'indigo' | 'emerald' | 'teal';
}

interface CompactItem {
  label:  string;
  route:  string;
  icon:   React.ReactNode;
  color:  string;
}

/* ─── Quick Access (Layer 2) ──────────────────────────── */

const quickItems: QuickItem[] = [
  {
    label: 'Fichas Virtuales',
    desc:  'Gestionar expedientes y datos de residentes',
    route: '/virtualFiles',
    icon:  <FileText />,
    color: 'blue',
  },
  {
    label: 'Citas',
    desc:  'Agendar y gestionar citas de todas las áreas clínicas',
    route: '/specialized-appointments',
    icon:  <CalendarCheck />,
    color: 'indigo',
  },
  {
    label: 'Entradas y Salidas',
    desc:  'Registrar movimientos de residentes y visitas',
    route: '/entrance-exit',
    icon:  <ArrowLeftRight />,
    color: 'emerald',
  },
  {
    label: 'Programas',
    desc:  'Actividades, sub-programas y planificación',
    route: '/programs',
    icon:  <CalendarDays />,
    color: 'teal',
  },
];

/* ─── Clinical items (Layer 3) ────────────────────────── */

const clinicalItems: CompactItem[] = [
  { label: 'Enfermería',             route: '/nursing',                   icon: <Stethoscope />,      color: 'indigo'  },
  { label: 'Fisioterapia',           route: '/physiotherapy',             icon: <Activity />,        color: 'rose'    },
  { label: 'Psicología',             route: '/psychology',                icon: <Brain />,            color: 'purple'  },
  { label: 'Trabajo Social',         route: '/social-work',               icon: <HeartHandshake />,   color: 'sky'     },
  { label: 'Registros Médicos',      route: '/medical-records',           icon: <ClipboardList />,    color: 'orange'  },
  { label: 'Áreas Especializadas',   route: '/specialized-areas',         icon: <Building2 />,        color: 'lime'    },
  { label: 'Condiciones Clínicas',   route: '/clinical-history',          icon: <HeartPulse />,       color: 'fuchsia' },
  { label: 'Medicamentos Clínicos',  route: '/clinical-medication',       icon: <Pill />,             color: 'pink'    },
  { label: 'Contactos Emergencia',   route: '/emergency-contacts',        icon: <PhoneCall />,        color: 'red'     },
  { label: 'Familiares',             route: '/older-adult-family',        icon: <Users />,            color: 'green'   },
  { label: 'Historial de Cambios',   route: '/older-adult-updates',       icon: <History />,          color: 'amber'   },
  { label: 'Vacunas',                route: '/vaccines',                  icon: <Syringe />,          color: 'slate'   },
];

/* ─── Admin items (Layer 4) ───────────────────────────── */

const adminItems: CompactItem[] = [
  { label: 'Usuarios',       route: '/users',         icon: <UserCog />,     color: 'blue'   },
  { label: 'Roles',          route: '/roles',          icon: <Shield />,      color: 'indigo' },
  { label: 'Permisos',       route: '/permissions',    icon: <Lock />,        color: 'emerald'},
  { label: 'Auditoría',      route: '/audits',         icon: <FileSearch />,  color: 'orange' },
  { label: 'Notificaciones', route: '/notifications',  icon: <Bell />,        color: 'amber'  },
];

/* ─── Sub-components ──────────────────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mm-section-header">
      <h2 className="mm-section-title">{title}</h2>
      <div className="mm-section-divider" aria-hidden="true" />
    </div>
  );
}

function QuickCard({ item, onClick }: { item: QuickItem; onClick: () => void }) {
  return (
    <button
      type="button"
      className="mm-quick-card"
      onClick={onClick}
      aria-label={item.label}
    >
      <span className={`mm-quick-icon-wrap mm-quick-icon-wrap--${item.color}`} aria-hidden="true">
        {item.icon}
      </span>
      <span className="mm-quick-label">{item.label}</span>
      <span className="mm-quick-desc">{item.desc}</span>
    </button>
  );
}

function CompactCard({ item, onClick }: { item: CompactItem; onClick: () => void }) {
  return (
    <button
      type="button"
      className="mm-compact-card"
      onClick={onClick}
      aria-label={item.label}
    >
      <span className={`mm-compact-icon mm-compact-icon--${item.color}`} aria-hidden="true">
        {item.icon}
      </span>
      <span className="mm-compact-label">{item.label}</span>
    </button>
  );
}

/* ─── Main Component ──────────────────────────────────── */

export default function MainMenuPage() {
  const navigate = useNavigate();
  const { isEnabled, loading } = useTwoFactorStatus();
  const [hasRequiredPermissions, setHasRequiredPermissions] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const [canManageUsers, isSuperAdmin] = await Promise.all([
          PermissionUtils.canViewAllUsers(),
          PermissionUtils.isSuperAdmin(),
        ]);
        setHasRequiredPermissions(canManageUsers || isSuperAdmin);
      } catch {
        setHasRequiredPermissions(false);
      }
    };
    checkPermissions();
  }, []);

  const go = (route: string) => navigate(route);

  // El backend solo exige 2FA para SUPER_ADMIN y ADMIN (ver
  // role.service.ts::requiresTwoFactor). El resto de roles (director,
  // nurse, physiotherapist, psychologist, social worker) acceden al
  // menú principal sin necesidad de 2FA.
  const requires2FA =
    PermissionUtils.isSuperAdminSync() || PermissionUtils.isAdminSync();

  /* Loading state */
  if (loading && requires2FA) {
    return (
      <div className="main-menu-page">
        <HeroStats />
        <div className="mm-loading-banner">
          <Loader2 className="mm-loading-spinner" aria-hidden="true" />
          Verificando configuración de seguridad…
        </div>
      </div>
    );
  }

  /* 2FA required gate (solo aplica a super admin / admin) */
  if (requires2FA && !isEnabled) {
    return (
      <div className="main-menu-page">
        <HeroStats />
        <div className="mm-2fa-banner" role="alert">
          <span className="mm-2fa-banner-icon" aria-hidden="true">
            <ShieldAlert size={20} />
          </span>
          <div className="mm-2fa-banner-body">
            <p className="mm-2fa-banner-title">Verificación en dos pasos requerida</p>
            <p className="mm-2fa-banner-msg">
              Para acceder al sistema debes activar la autenticación de dos factores (2FA)
              desde tu menú de usuario.
            </p>
            <button
              type="button"
              className="mm-2fa-banner-btn"
              onClick={() => navigate('/two-factor')}
            >
              Configurar 2FA <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Authenticated + 2FA active — render layered menu */
  const showAdmin = hasRequiredPermissions === true;

  return (
    <div className="main-menu-page">
      {/* Capa 0 — Hero Stats */}
      <HeroStats />

      {/* Capa 1 — Accesos Rápidos */}
      <section className="mm-section" aria-labelledby="mm-quick-title">
        <SectionHeader title="Accesos Rápidos" />
        <div className="mm-quick-grid" id="mm-quick-title" role="list">
          {quickItems.map(item => (
            <QuickCard key={item.route} item={item} onClick={() => go(item.route)} />
          ))}
        </div>
      </section>

      {/* Capa 2 — Atención Clínica */}
      <section className="mm-section" aria-labelledby="mm-clinical-title">
        <SectionHeader title="Atención Clínica" />
        <div className="mm-compact-grid" id="mm-clinical-title" role="list">
          {clinicalItems.map(item => (
            <CompactCard key={item.route} item={item} onClick={() => go(item.route)} />
          ))}
        </div>
      </section>

      {/* Capa 3 — Administración (permisos avanzados) */}
      {showAdmin && (
        <section className="mm-section" aria-labelledby="mm-admin-title">
          <SectionHeader title="Administración" />
          <div className="mm-admin-grid mm-compact-grid" id="mm-admin-title" role="list">
            {adminItems.map(item => (
              <CompactCard key={item.route} item={item} onClick={() => go(item.route)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}