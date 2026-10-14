import {
  Bell,
  Brain,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  FileHeart,
  HandHeart,
  HeartHandshake,
  KeyRound,
  LockKeyhole,
  PersonStanding,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  Syringe,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

/**
 * Single source of truth for the public site copy that is reused across pages
 * (navigation, module catalogue, FAQ, sitemap). Module names mirror the real
 * workspace routes documented in docs/routes-map.md, so nothing here promises
 * a capability the product does not have.
 */

export const contactEmail = 'soporte@sigha.cr'

export interface NavigationItem {
  readonly href: string
  readonly label: string
}

export const primaryNavigation: readonly NavigationItem[] = [
  { href: '/funcionalidades', label: 'Funcionalidades' },
  { href: '/como-funciona', label: 'Cómo funciona' },
  { href: '/planes', label: 'Planes' },
  { href: '/nosotros', label: 'Nosotros' },
]

export const legalNavigation: readonly NavigationItem[] = [
  { href: '/privacidad', label: 'Privacidad y seguridad' },
  { href: '/accesibilidad', label: 'Accesibilidad' },
]

/* -------------------------------------------------------------------------- */
/* Modules                                                                    */
/* -------------------------------------------------------------------------- */

export type ModuleTone = 'blue' | 'sage' | 'warm' | 'violet' | 'rose'
export type ModuleCategoryId = 'residentes' | 'programada' | 'clinica' | 'operacion' | 'accesos'

export interface ModuleCategory {
  readonly id: ModuleCategoryId
  readonly label: string
  readonly tone: ModuleTone
}

export const moduleCategories: readonly ModuleCategory[] = [
  { id: 'residentes', label: 'Residentes', tone: 'rose' },
  { id: 'programada', label: 'Atención programada', tone: 'blue' },
  { id: 'clinica', label: 'Atención clínica', tone: 'sage' },
  { id: 'operacion', label: 'Operación', tone: 'warm' },
  { id: 'accesos', label: 'Accesos y seguridad', tone: 'violet' },
]

export interface PlatformModule {
  readonly id: string
  readonly title: string
  readonly summary: string
  readonly categoryId: ModuleCategoryId
  readonly icon: LucideIcon
}

export const platformModules: readonly PlatformModule[] = [
  {
    id: 'expedientes',
    title: 'Expedientes de residentes',
    summary: 'Un registro central de cada persona atendida, con su información personal y sus actualizaciones.',
    categoryId: 'residentes',
    icon: ClipboardList,
  },
  {
    id: 'familia',
    title: 'Familia y contactos de emergencia',
    summary: 'Los datos de familiares y de las personas a quienes acudir, siempre a mano del equipo.',
    categoryId: 'residentes',
    icon: HandHeart,
  },
  {
    id: 'enfermeria',
    title: 'Enfermería',
    summary: 'Citas, resultados e historial de atenciones por residente.',
    categoryId: 'programada',
    icon: Stethoscope,
  },
  {
    id: 'citas-especializadas',
    title: 'Citas y áreas especializadas',
    summary: 'Organiza las áreas especializadas del centro y las citas con cada una.',
    categoryId: 'programada',
    icon: CalendarClock,
  },
  {
    id: 'programas-vacunas',
    title: 'Programas y vacunas',
    summary: 'Programas y subprogramas de atención, junto con el registro de vacunas.',
    categoryId: 'programada',
    icon: Syringe,
  },
  {
    id: 'expediente-clinico',
    title: 'Expediente médico',
    summary: 'Registros médicos, condiciones clínicas y medicación en un mismo lugar.',
    categoryId: 'clinica',
    icon: FileHeart,
  },
  {
    id: 'fisioterapia',
    title: 'Fisioterapia',
    summary: 'Sesiones registradas y consultables junto al resto de la atención.',
    categoryId: 'clinica',
    icon: PersonStanding,
  },
  {
    id: 'psicologia',
    title: 'Psicología',
    summary: 'Registro de sesiones psicológicas dentro del mismo espacio de trabajo.',
    categoryId: 'clinica',
    icon: Brain,
  },
  {
    id: 'trabajo-social',
    title: 'Trabajo social',
    summary: 'Informes sociales vinculados a cada persona.',
    categoryId: 'clinica',
    icon: HeartHandshake,
  },
  {
    id: 'entradas-salidas',
    title: 'Entradas y salidas',
    summary: 'Registro de los movimientos del centro, con historial y un panel de resumen.',
    categoryId: 'operacion',
    icon: DoorOpen,
  },
  {
    id: 'notificaciones',
    title: 'Notificaciones',
    summary: 'Avisos para el equipo, creados y consultados desde la propia plataforma.',
    categoryId: 'operacion',
    icon: Bell,
  },
  {
    id: 'auditoria',
    title: 'Auditoría',
    summary: 'Paneles de actividad, de seguridad y de estado del sistema.',
    categoryId: 'accesos',
    icon: ScrollText,
  },
  {
    id: 'roles-permisos',
    title: 'Roles y permisos',
    summary: 'Define quién puede ver o hacer qué en cada módulo, con historial de cambios de rol.',
    categoryId: 'accesos',
    icon: KeyRound,
  },
  {
    id: 'usuarios',
    title: 'Usuarios y verificación',
    summary: 'Gestión de usuarios con verificación en dos pasos disponible.',
    categoryId: 'accesos',
    icon: ShieldCheck,
  },
]

export const moduleById: ReadonlyMap<string, PlatformModule> = new Map(
  platformModules.map((platformModule) => [platformModule.id, platformModule]),
)

export const categoryById: ReadonlyMap<ModuleCategoryId, ModuleCategory> = new Map(
  moduleCategories.map((category) => [category.id, category]),
)

/* -------------------------------------------------------------------------- */
/* Feature areas (Funcionalidades page)                                       */
/* -------------------------------------------------------------------------- */

export interface FeatureArea {
  readonly id: string
  readonly icon: LucideIcon
  readonly title: string
  readonly text: string
  readonly moduleIds: readonly string[]
}

export const featureAreas: readonly FeatureArea[] = [
  {
    id: 'residentes',
    icon: UsersRound,
    title: 'Gestión de residentes',
    text: 'Organiza expedientes y consulta la información de las personas atendidas desde un registro centralizado.',
    moduleIds: ['expedientes', 'familia'],
  },
  {
    id: 'atencion',
    icon: CalendarDays,
    title: 'Atenciones y seguimientos',
    text: 'Coordina citas, consultas y actividades de los equipos clínicos y profesionales.',
    moduleIds: ['enfermeria', 'citas-especializadas', 'programas-vacunas'],
  },
  {
    id: 'expediente',
    icon: FileHeart,
    title: 'Información clínica',
    text: 'Conecta expedientes, antecedentes, medicamentos y registros de atención.',
    moduleIds: ['expediente-clinico', 'fisioterapia', 'psicologia', 'trabajo-social'],
  },
  {
    id: 'operacion',
    icon: ClipboardList,
    title: 'Operación diaria',
    text: 'Da seguimiento a ingresos, salidas, notificaciones y tareas frecuentes del centro.',
    moduleIds: ['entradas-salidas', 'notificaciones'],
  },
  {
    id: 'seguridad',
    icon: LockKeyhole,
    title: 'Acceso y trazabilidad',
    text: 'Asigna permisos por módulo y rol y conserva un historial de actividad relevante.',
    moduleIds: ['auditoria', 'roles-permisos', 'usuarios'],
  },
]

/* -------------------------------------------------------------------------- */
/* Stats (derived from the catalogue so the numbers can never drift)          */
/* -------------------------------------------------------------------------- */

/** Dashboard, activity logs, security and system-health panels under /audits. */
const auditPanelCount = 4

export interface PlatformStat {
  readonly value: number
  readonly label: string
}

export const platformStats: readonly PlatformStat[] = [
  { value: platformModules.length, label: 'módulos de trabajo conectados' },
  { value: moduleCategories.length, label: 'áreas de la operación en un solo lugar' },
  { value: auditPanelCount, label: 'paneles de auditoría y seguridad' },
]

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export interface FaqItem {
  readonly id: string
  readonly question: string
  readonly answer: string
}

export const faqItems: readonly FaqItem[] = [
  {
    id: 'que-es',
    question: '¿Qué es SIGHa?',
    answer:
      'SIGHa es la plataforma web del Sistema Integral de Gestión Holística y de Asistencia. Reúne en un solo espacio de trabajo la gestión de residentes, la atención clínica y la operación diaria del centro.',
  },
  {
    id: 'para-quien',
    question: '¿Para quién está pensada?',
    answer:
      'Para centros que atienden residentes y necesitan coordinar equipos de enfermería, áreas clínicas y de apoyo, y personal administrativo, cada uno con el acceso que su función requiere.',
  },
  {
    id: 'modulos',
    question: '¿Qué módulos incluye?',
    answer:
      'Expedientes de residentes, familia y contactos de emergencia, enfermería, citas especializadas, programas y vacunas, expediente médico, fisioterapia, psicología, trabajo social, entradas y salidas, notificaciones, auditoría, roles y permisos, y gestión de usuarios.',
  },
  {
    id: 'permisos',
    question: '¿Cómo se controla quién ve cada información?',
    answer:
      'Cada persona entra con su usuario y un rol. Los permisos se asignan por módulo y los cambios de rol quedan registrados para poder revisarlos.',
  },
  {
    id: 'trazabilidad',
    question: '¿Queda registro de lo que ocurre en la plataforma?',
    answer:
      'Sí. SIGHa incluye paneles de auditoría con el registro de actividad, la revisión de seguridad y el estado del sistema.',
  },
  {
    id: 'dos-pasos',
    question: '¿Hay verificación en dos pasos?',
    answer:
      'La plataforma incluye verificación en dos pasos. Su activación depende de la configuración de cada organización y la revisamos juntos al definir la puesta en marcha.',
  },
  {
    id: 'precio',
    question: '¿Cuánto cuesta?',
    answer:
      'No publicamos precios fijos porque dependen del número de usuarios, de la configuración y del acompañamiento que necesite cada organización. En la conversación inicial preparamos una propuesta.',
  },
  {
    id: 'empezar',
    question: '¿Cómo empiezo?',
    answer:
      'Solicita una demostración. Revisamos tus procesos actuales, recorremos los módulos que te interesan y definimos juntos el alcance.',
  },
  {
    id: 'cuenta',
    question: 'Ya tengo una cuenta, ¿cómo entro?',
    answer:
      'Usa el enlace «Iniciar sesión» de la parte superior de esta página para entrar al espacio de trabajo.',
  },
]

/* -------------------------------------------------------------------------- */
/* Sitemap                                                                    */
/* -------------------------------------------------------------------------- */

export interface PublicRoute {
  readonly path: string
  readonly priority: number
  readonly changeFrequency: 'weekly' | 'monthly' | 'yearly'
}

export const publicRoutes: readonly PublicRoute[] = [
  { path: '', priority: 1, changeFrequency: 'weekly' },
  { path: '/funcionalidades', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/como-funciona', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/planes', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/nosotros', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/contacto', priority: 0.8, changeFrequency: 'yearly' },
  { path: '/privacidad', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/accesibilidad', priority: 0.4, changeFrequency: 'yearly' },
]
