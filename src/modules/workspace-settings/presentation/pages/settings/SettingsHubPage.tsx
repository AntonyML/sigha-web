'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  Bell,
  Boxes,
  ChevronRight,
  Globe2,
  Lock,
  LockKeyhole,
  Palette,
  Server,
  Sliders,
  Workflow,
} from 'lucide-react'
import { usePermissions } from '@/shared/lib/permissionUtils'
import { Alert } from '@/shared/ui/feedback/Alert/Alert'
import { Card, CardContent } from '@/shared/ui/data-display/Card/Card'
import { PageHeader } from '@/shared/ui/layouts/PageHeader/PageHeader'
import styles from './SettingsHubPage.module.css'

interface Category {
  id: string
  title: string
  description: string
  path: string
  icon: ReactNode
  accent: string
  bg: string
  highlights: string[]
  adminOnly?: boolean
}

const CATEGORIES: Category[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Identidad de la organización activa, idioma y zona horaria.',
    path: '/settings/general',
    icon: <Sliders size={21} />,
    accent: '#475569',
    bg: 'rgba(71, 85, 105, 0.10)',
    highlights: ['Identidad por organización', 'Idioma', 'Zona horaria'],
  },
  {
    id: 'system',
    title: 'Sistema',
    description: 'Mantenimiento, respaldos y diagnóstico de la instancia.',
    path: '/settings/system',
    icon: <Server size={21} />,
    accent: '#0f766e',
    bg: 'rgba(15, 118, 110, 0.10)',
    highlights: ['Versión', 'Logs', 'Respaldos', 'Diagnóstico'],
  },
  {
    id: 'modules',
    title: 'Módulos',
    description: 'Activación y configuración de las capacidades del sistema.',
    path: '/settings/modules',
    icon: <Boxes size={21} />,
    accent: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.10)',
    highlights: ['Módulos activos', 'Capacidades'],
  },
  {
    id: 'security',
    title: 'Seguridad',
    description: 'Políticas de contraseñas, sesiones, 2FA e intentos de acceso.',
    path: '/settings/security',
    icon: <Lock size={21} />,
    accent: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.10)',
    highlights: ['Contraseñas', '2FA', 'Sesiones', 'Intentos'],
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Reglas de envío, plantillas, canales y destinatarios.',
    path: '/settings/notifications',
    icon: <Bell size={21} />,
    accent: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.10)',
    highlights: ['Plantillas', 'Canales', 'Destinatarios'],
  },
  {
    id: 'interface',
    title: 'Interfaz',
    description: 'Apariencia, densidad, tipografía y comportamiento visual.',
    path: '/settings/interface',
    icon: <Palette size={21} />,
    accent: '#d97706',
    bg: 'rgba(217, 119, 6, 0.10)',
    highlights: ['Tema', 'Densidad', 'Tipografía', 'Color'],
  },
  {
    id: 'flow',
    title: 'Flujo y comportamiento',
    description: 'Reglas de negocio, automatizaciones y pasos guiados.',
    path: '/settings/flow',
    icon: <Workflow size={21} />,
    accent: '#be185d',
    bg: 'rgba(190, 24, 93, 0.10)',
    highlights: ['Reglas', 'Automatizaciones', 'Validaciones'],
  },
  {
    id: 'perfil-digital',
    title: 'Perfil Digital y Campos Dinámicos',
    description: 'Personalización de campos y secciones dinámicas para la entidad Persona.',
    path: '/settings/perfil-digital',
    icon: <Sliders size={21} />,
    accent: '#0284c7',
    bg: 'rgba(2, 132, 199, 0.10)',
    highlights: ['Campos personalizados', 'Secciones dinámicas', 'Sin alterar SQL'],
  },
  {
    id: 'global',
    title: 'Configuraciones Globales',
    description: 'Identidad compartida de la plataforma, protegida con una verificación 2FA.',
    path: '/platform/settings/global',
    icon: <Globe2 size={21} />,
    accent: '#6d28d9',
    bg: 'rgba(109, 40, 217, 0.10)',
    highlights: ['Toda la plataforma', 'Admin o superadmin', 'Código 2FA'],
    adminOnly: true,
  },
]

function CategoryCard({ category }: { category: Category }) {
  return (
    <Card className={styles.categoryCard}>
      <Link href={category.path} className={styles.categoryLink}>
        <span
          className={styles.categoryIcon}
          style={{ color: category.accent, backgroundColor: category.bg }}
          aria-hidden="true"
        >
          {category.icon}
        </span>
        <span className={styles.categoryText}>
          <span className={styles.categoryTitleRow}>
            <span className={styles.categoryTitle}>{category.title}</span>
            <ChevronRight size={17} aria-hidden="true" className={styles.chevron} />
          </span>
          <span className={styles.categoryDescription}>{category.description}</span>
        </span>
        <span className={styles.highlights}>
          {category.highlights.map((highlight) => (
            <span key={highlight} className={styles.highlight}>{highlight}</span>
          ))}
        </span>
        {category.adminOnly && (
          <span className={styles.securityNote}>
            <LockKeyhole size={14} aria-hidden="true" />
            Requiere volver a verificar tu identidad
          </span>
        )}
      </Link>
    </Card>
  )
}

export default function SettingsHubPage() {
  const { isLoaded, isAdminSync, isSuperAdminSync } = usePermissions()
  const canManageGlobalSettings = isLoaded && (isAdminSync() || isSuperAdminSync())
  const categories = CATEGORIES.filter((category) => !category.adminOnly || canManageGlobalSettings)

  return (
    <main className={`lp-page ${styles.page}`}>
      <PageHeader
        title="Configuración"
        subtitle="Preferencias del espacio activo y controles del sistema, organizados en un solo lugar."
        icon="bi-gear"
        className={styles.header}
      />

      <section className={styles.grid} aria-label="Categorías de configuración">
        {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
      </section>

      <Card className={styles.scopeCard}>
        <CardContent className={styles.scopeContent}>
          <Alert variant="info" title="La identidad se mantiene separada">
            El nombre y el logo de una organización solo afectan a ese espacio. Las configuraciones globales requieren un rol administrativo y una verificación 2FA reciente.
          </Alert>
        </CardContent>
      </Card>
    </main>
  )
}
