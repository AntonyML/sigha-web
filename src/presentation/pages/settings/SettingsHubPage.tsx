/**
 * SettingsHubPage — Centro de configuración del sistema
 *
 * Punto de entrada único para los ajustes de la aplicación.
 * A diferencia de Administración (que contiene CRUDs y entidades),
 * aquí se centralizan los parámetros, preferencias y reglas.
 *
 * Estructura:
 *   1. Header con título + subtítulo
 *   2. Tarjetas de categoría (grid responsivo)
 *      - General
 *      - Sistema
 *      - Módulos
 *      - Seguridad
 *      - Notificaciones
 *      - Interfaz
 *      - Flujo y comportamiento
 *   3. Footer informativo
 */

import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Settings as SettingsIcon, Sliders, Server, Boxes, Lock,
  Bell, Palette, Workflow, ChevronRight, ShieldAlert, Wrench, Cog,
} from 'lucide-react';
import '../../styles/lp.css';

interface Category {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: ReactNode;
  accent: string;
  bg: string;
  highlights: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Identidad institucional, idioma, zona horaria y datos básicos.',
    path: '/settings/general',
    icon: <Sliders size={22} />,
    accent: '#475569',
    bg: 'rgba(71, 85, 105, 0.10)',
    highlights: ['Nombre de la app', 'Idioma', 'Zona horaria', 'Logo'],
  },
  {
    id: 'system',
    title: 'Sistema',
    description: 'Parámetros de plataforma, mantenimiento, respaldos y diagnóstico.',
    path: '/settings/system',
    icon: <Server size={22} />,
    accent: '#0f766e',
    bg: 'rgba(15, 118, 110, 0.10)',
    highlights: ['Versión', 'Logs', 'Respaldos', 'Diagnóstico'],
  },
  {
    id: 'modules',
    title: 'Módulos',
    description: 'Activación, desactivación y configuración por módulo.',
    path: '/settings/modules',
    icon: <Boxes size={22} />,
    accent: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.10)',
    highlights: ['Módulos activos', 'Flags por dominio', 'Capacidades'],
  },
  {
    id: 'security',
    title: 'Seguridad',
    description: 'Política de contraseñas, sesiones, 2FA, intentos de login.',
    path: '/settings/security',
    icon: <Lock size={22} />,
    accent: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.10)',
    highlights: ['Política de contraseñas', '2FA obligatorio', 'Sesiones', 'Intentos'],
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Reglas de envío, plantillas, canales y destinatarios.',
    path: '/settings/notifications',
    icon: <Bell size={22} />,
    accent: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.10)',
    highlights: ['Plantillas', 'Canales', 'Destinatarios', 'Horarios'],
  },
  {
    id: 'interface',
    title: 'Interfaz',
    description: 'Apariencia, idioma, densidad y comportamiento visual.',
    path: '/settings/interface',
    icon: <Palette size={22} />,
    accent: '#d97706',
    bg: 'rgba(217, 119, 6, 0.10)',
    highlights: ['Tema', 'Densidad', 'Tipografía', 'Color de marca'],
  },
  {
    id: 'flow',
    title: 'Flujo y comportamiento',
    description: 'Reglas de negocio, automatizaciones, validaciones y pasos guiados.',
    path: '/settings/flow',
    icon: <Workflow size={22} />,
    accent: '#be185d',
    bg: 'rgba(190, 24, 93, 0.10)',
    highlights: ['Reglas de negocio', 'Automatizaciones', 'Validaciones', 'Wizards'],
  },
];

function CategoryCard({ c }: { c: Category }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(c.path)}
      className="lp-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        textAlign: 'left',
        cursor: 'pointer',
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.625rem', background: c.bg, color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {c.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3 className="lp-title" style={{ fontSize: '1.0625rem' }}>{c.title}</h3>
            <ChevronRight size={16} color="#94a3b8" />
          </div>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.8125rem', lineHeight: 1.4 }}>{c.description}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {c.highlights.map((h) => (
          <span key={h} style={{
            fontSize: '0.6875rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '999px',
            background: '#f1f5f9',
            color: '#475569',
            fontWeight: 500,
          }}>{h}</span>
        ))}
      </div>
    </button>
  );
}

export default function SettingsHubPage() {
  return (
    <div className="lp-page">
      <div className="lp-header">
        <div>
          <h2 className="lp-title">
            <SettingsIcon size={22} color="#475569" />
            Configuración
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>
            Centro de control del sistema. Ajustes, preferencias, reglas y
            parámetros globales. No confundir con la gestión de entidades.
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1rem',
      }}>
        {CATEGORIES.map((c) => <CategoryCard key={c.id} c={c} />)}
      </div>

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
        <ShieldAlert size={18} color="#475569" />
        <span>
          Los cambios en configuración pueden requerir permisos especiales.
          Cada subpágina mostrará los detalles y restricciones aplicables.
        </span>
      </div>
    </div>
  );
}
