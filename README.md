# Sistema Integral de Gestión para Hogar de Ancianos - Frontend

![React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-28.0-47848F?style=for-the-badge&logo=electron&logoColor=white)

![Status](https://img.shields.io/badge/Status-En_Desarrollo-yellow?style=for-the-badge)
![Created By](https://img.shields.io/badge/Creado_por-Luis_|_Tony_|_Jona-%23ff69b4?style=for-the-badge&logo=starship&logoColor=white)

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características Principales](#características-principales)
- [Arquitectura del Frontend](#arquitectura-del-frontend)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Flujo de Navegación](#flujo-de-navegación)
- [Componentes Principales](#componentes-principales)
- [Testing](#testing)
- [Build y Deploy](#build-y-deploy)
- [Contribución](#contribución)

---

## Descripción

Aplicación frontend desarrollada con **React 18** y **TypeScript** para la gestión integral de un hogar de ancianos. La aplicación se compila como aplicación de escritorio usando **Electron** para Windows, garantizando una experiencia nativa y segura.

La interfaz está diseñada con **componentes reutilizables** siguiendo principios de **Atomic Design** y **Clean Architecture**, con énfasis en usabilidad para personal administrativo con habilidades digitales básicas.

---

## Características Principales

- **Autenticación Segura**: Login con JWT + Verificación 2FA obligatoria
- **Dashboard Interactivo**: Métricas y estadísticas en tiempo real
- **Gestión de Usuarios**: CRUD completo con asignación de roles
- **Expedientes Digitales**: Creación, edición y consulta de fichas virtuales
- **Sistema de Citas**: Calendario interactivo con programación de atenciones
- **Historiales Médicos**: Visualización completa con timeline de eventos
- **Auditoría Visual**: Dashboard con filtros avanzados y exportación
- **Notificaciones en Tiempo Real**: Alertas y recordatorios
- **Modo Offline**: Caché local para operación sin conexión
- **Interfaz Accesible**: Diseño inclusivo con fuentes grandes y alto contraste

---

## Arquitectura del Frontend

El frontend implementa **Clean Architecture** con separación de responsabilidades:

```
Presentation Layer (UI Components)
        ↓
Application Layer (Hooks, Context, State Management)
        ↓
Domain Layer (Models, Business Logic)
        ↓
Infrastructure Layer (API Services, Storage)
```

**Patrones de Diseño**:
- **Atomic Design**: Componentes organizados en atoms, molecules, organisms, templates, pages
- **Container/Presenter Pattern**: Separación entre lógica y presentación
- **Custom Hooks**: Reutilización de lógica con hooks personalizados
- **Context API + Zustand**: Gestión de estado global optimizada
- **Repository Pattern**: Abstracción de llamadas API

**Principios SOLID Aplicados**:
- **Single Responsibility**: Cada componente tiene una única responsabilidad
- **Open/Closed**: Componentes extensibles mediante props
- **Dependency Inversion**: Inyección de dependencias mediante Context

---

## Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 18.3 |
| Lenguaje | TypeScript 5.3 |
| Build Tool | Vite 5.0 |
| Escritorio | Electron 28 |
| Estilos | TailwindCSS 3.4 |
| UI Components | Radix UI, Headless UI |
| Estado Global | Zustand 4.5 |
| Formularios | React Hook Form 7.5 |
| Validación | Zod 3.22 |
| HTTP Client | Axios 1.6 |
| Routing | React Router v6 |
| Iconos | Lucide React |
| Gráficos | Recharts 2.10 |
| Tablas | TanStack Table v8 |
| Fechas | date-fns 3.0 |
| PDF Viewer | react-pdf 7.7 |
| Testing | Vitest, Testing Library |
| Linting | ESLint, Prettier |

---

## Requisitos Previos

Asegúrate de tener instalado:

- **Node.js**: v20.x LTS o superior
- **npm**: v10.x o superior
- **Git**: v2.40 o superior
- **Backend API**: Corriendo en `http://localhost:3000`

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://git.ucr.ac.cr/proyecto_analisis/frontend_proton_react_hogar_de_ancianos.git
cd frontend_proton_react_hogar_de_ancianos
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Hogar de Ancianos
VITE_APP_VERSION=1.0.0
```

---

## Ejecución

### Modo Desarrollo (Web)

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Modo Electron (Desarrollo)

```bash
npm run electron:dev
```

### Build para Producción

```bash
# Build web
npm run build

# Build Electron (Windows)
npm run electron:build
```

El instalador se generará en `dist/electron/`

---

## Estructura del Proyecto

```
frontend_proton_react_hogar_de_ancianos/
│
├── public/                                    # Archivos estáticos
│   ├── icons/
│   └── fonts/
│
├── src/
│   ├── main.tsx                               # Entry point
│   ├── App.tsx                                # Componente raíz
│   │
│   ├── assets/                                # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       └── global.css
│   │
│   ├── config/                                # Configuraciones
│   │   ├── axios.config.ts                    # Configuración Axios
│   │   ├── constants.ts                       # Constantes globales
│   │   └── routes.config.ts                   # Configuración de rutas
│   │
│   ├── types/                                 # Tipos TypeScript globales
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── older-adult.types.ts
│   │   ├── appointment.types.ts
│   │   └── index.ts
│   │
│   ├── infrastructure/                        # Capa de Infraestructura
│   │   │
│   │   ├── api/                               # Servicios API
│   │   │   ├── axios.instance.ts              # Instancia configurada
│   │   │   ├── auth.service.ts                # Auth endpoints
│   │   │   ├── users.service.ts               # Users endpoints
│   │   │   ├── older-adults.service.ts        # Older adults endpoints
│   │   │   ├── appointments.service.ts        # Appointments endpoints
│   │   │   ├── medical-records.service.ts     # Medical records endpoints
│   │   │   ├── roles.service.ts               # Roles endpoints
│   │   │   ├── audit.service.ts               # Audit endpoints
│   │   │   ├── programs.service.ts            # Programs endpoints
│   │   │   └── index.ts
│   │   │
│   │   ├── storage/                           # Almacenamiento local
│   │   │   ├── local-storage.service.ts       # LocalStorage helper
│   │   │   ├── session-storage.service.ts     # SessionStorage helper
│   │   │   └── index-db.service.ts            # IndexedDB para offline
│   │   │
│   │   └── utils/                             # Utilidades
│   │       ├── format-date.util.ts
│   │       ├── format-currency.util.ts
│   │       ├── validate-dni.util.ts
│   │       ├── pdf-generator.util.ts
│   │       └── index.ts
│   │
│   ├── domain/                                # Capa de Dominio
│   │   ├── models/                            # Modelos de dominio
│   │   │   ├── User.model.ts
│   │   │   ├── OlderAdult.model.ts
│   │   │   ├── Appointment.model.ts
│   │   │   ├── MedicalRecord.model.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── interfaces/                        # Interfaces de dominio
│   │   │   ├── IAuthRepository.ts
│   │   │   ├── IUserRepository.ts
│   │   │   └── index.ts
│   │   │
│   │   └── enums/                             # Enumeraciones
│   │       ├── roles.enum.ts
│   │       ├── appointment-status.enum.ts
│   │       └── index.ts
│   │
│   ├── application/                           # Capa de Aplicación
│   │   │
│   │   ├── hooks/                             # Custom Hooks
│   │   │   ├── auth/
│   │   │   │   ├── useAuth.ts                 # Hook de autenticación
│   │   │   │   ├── useLogin.ts                # Hook de login
│   │   │   │   └── use2FA.ts                  # Hook de 2FA
│   │   │   ├── users/
│   │   │   │   ├── useUsers.ts                # Hook CRUD usuarios
│   │   │   │   ├── useCreateAdmin.ts
│   │   │   │   └── useUserPermissions.ts
│   │   │   ├── older-adults/
│   │   │   │   ├── useOlderAdults.ts
│   │   │   │   ├── useVirtualRecord.ts
│   │   │   │   └── useGeneratePDF.ts
│   │   │   ├── appointments/
│   │   │   │   ├── useAppointments.ts
│   │   │   │   ├── useScheduleAppointment.ts
│   │   │   │   └── useAppointmentCalendar.ts
│   │   │   ├── medical-records/
│   │   │   │   ├── useMedicalRecords.ts
│   │   │   │   └── useClinicalHistory.ts
│   │   │   ├── audit/
│   │   │   │   ├── useAuditLogs.ts
│   │   │   │   └── useGenerateReport.ts
│   │   │   ├── roles/
│   │   │   │   ├── useRoles.ts
│   │   │   │   └── usePermissions.ts
│   │   │   └── common/
│   │   │       ├── useDebounce.ts
│   │   │       ├── useLocalStorage.ts
│   │   │       ├── useOnlineStatus.ts
│   │   │       └── usePagination.ts
│   │   │
│   │   ├── context/                           # Context Providers
│   │   │   ├── AuthContext.tsx                # Contexto de autenticación
│   │   │   ├── ThemeContext.tsx               # Contexto de tema
│   │   │   ├── NotificationContext.tsx        # Contexto de notificaciones
│   │   │   └── index.ts
│   │   │
│   │   └── store/                             # Estado Global (Zustand)
│   │       ├── auth.store.ts                  # Store de autenticación
│   │       ├── user.store.ts                  # Store de usuarios
│   │       ├── notification.store.ts          # Store de notificaciones
│   │       └── index.ts
│   │
│   ├── presentation/                          # Capa de Presentación
│   │   │
│   │   ├── components/                        # Componentes UI (Atomic Design)
│   │   │   │
│   │   │   ├── atoms/                         # Componentes básicos
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   └── Button.styles.ts
│   │   │   │   ├── Input/
│   │   │   │   ├── Label/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Avatar/
│   │   │   │   ├── Icon/
│   │   │   │   ├── Spinner/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── molecules/                     # Componentes combinados
│   │   │   │   ├── FormField/
│   │   │   │   ├── SearchBar/
│   │   │   │   ├── DatePicker/
│   │   │   │   ├── SelectDropdown/
│   │   │   │   ├── UserAvatar/
│   │   │   │   ├── StatusBadge/
│   │   │   │   ├── ActionButton/
│   │   │   │   ├── NotificationItem/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── organisms/                     # Componentes complejos
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   └── Header.test.tsx
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── DataTable/
│   │   │   │   ├── LoginForm/
│   │   │   │   ├── TwoFactorForm/
│   │   │   │   ├── UserForm/
│   │   │   │   ├── OlderAdultForm/
│   │   │   │   ├── AppointmentCalendar/
│   │   │   │   ├── MedicalRecordTimeline/
│   │   │   │   ├── AuditLogTable/
│   │   │   │   ├── NotificationPanel/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── templates/                     # Layouts de página
│   │   │   │   ├── AuthLayout/
│   │   │   │   │   └── AuthLayout.tsx
│   │   │   │   ├── DashboardLayout/
│   │   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   │   └── DashboardSidebar.tsx
│   │   │   │   ├── EmptyLayout/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── shared/                        # Componentes compartidos
│   │   │       ├── ErrorBoundary/
│   │   │       ├── LoadingScreen/
│   │   │       ├── Modal/
│   │   │       ├── Toast/
│   │   │       ├── ConfirmDialog/
│   │   │       └── index.ts
│   │   │
│   │   ├── pages/                             # Páginas de la aplicación
│   │   │   │
│   │   │   ├── auth/                          # Módulo de Autenticación
│   │   │   │   ├── LoginPage.tsx              # Página de login
│   │   │   │   ├── TwoFactorPage.tsx          # Página de verificación 2FA
│   │   │   │   ├── ForgotPasswordPage.tsx     # Recuperar contraseña
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── dashboard/                     # Dashboard Principal
│   │   │   │   ├── DashboardPage.tsx          # Dashboard general
│   │   │   │   ├── components/
│   │   │   │   │   ├── StatsCard.tsx
│   │   │   │   │   ├── RecentActivities.tsx
│   │   │   │   │   ├── QuickActions.tsx
│   │   │   │   │   └── AppointmentsOverview.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── users/                         # Gestión de Usuarios
│   │   │   │   ├── UsersListPage.tsx          # Lista de usuarios
│   │   │   │   ├── CreateUserPage.tsx         # Crear usuario
│   │   │   │   ├── CreateAdminPage.tsx        # Crear administrador
│   │   │   │   ├── CreateSuperAdminPage.tsx   # Crear super admin
│   │   │   │   ├── EditUserPage.tsx           # Editar usuario
│   │   │   │   ├── UserDetailPage.tsx         # Detalle de usuario
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── roles/                         # Gestión de Roles
│   │   │   │   ├── RolesListPage.tsx          # Lista de roles
│   │   │   │   ├── CreateRolePage.tsx         # Crear rol personalizado
│   │   │   │   ├── EditRolePage.tsx           # Editar rol
│   │   │   │   ├── RoleDetailPage.tsx         # Detalle de rol
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── older-adults/                  # Gestión de Adultos Mayores
│   │   │   │   ├── OlderAdultsListPage.tsx    # Lista de adultos mayores
│   │   │   │   ├── CreateVirtualRecordPage.tsx # Crear ficha virtual
│   │   │   │   ├── EditVirtualRecordPage.tsx  # Editar ficha
│   │   │   │   ├── VirtualRecordDetailPage.tsx # Detalle completo
│   │   │   │   ├── GeneratePDFPage.tsx        # Vista previa PDF
│   │   │   │   ├── ShareWithSpecialistPage.tsx # Compartir ficha
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── appointments/                  # Gestión de Citas
│   │   │   │   ├── AppointmentsListPage.tsx   # Lista de citas
│   │   │   │   ├── ScheduleAppointmentPage.tsx # Programar cita
│   │   │   │   ├── AppointmentCalendarPage.tsx # Vista de calendario
│   │   │   │   ├── RegisterNursingCarePage.tsx # Registrar atención enfermería
│   │   │   │   ├── GenerateMedicalReportPage.tsx # Generar reporte médico
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── medical-records/               # Historiales Médicos
│   │   │   │   ├── MedicalRecordsPage.tsx     # Historial completo
│   │   │   │   ├── ClinicalHistoryPage.tsx    # Antecedentes clínicos
│   │   │   │   ├── MedicationPage.tsx         # Gestión de medicamentos
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── specialized-areas/             # Áreas Especializadas
│   │   │   │   ├── NursingPage.tsx            # Módulo de enfermería
│   │   │   │   ├── PhysiotherapyPage.tsx      # Módulo de fisioterapia
│   │   │   │   ├── PsychologyPage.tsx         # Módulo de psicología
│   │   │   │   ├── SocialWorkPage.tsx         # Módulo de trabajo social
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── programs/                      # Gestión de Programas
│   │   │   │   ├── ProgramsListPage.tsx       # Lista de programas
│   │   │   │   ├── CreateProgramPage.tsx      # Crear programa
│   │   │   │   ├── EditProgramPage.tsx        # Editar programa
│   │   │   │   ├── ProgramDetailPage.tsx      # Detalle de programa
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── audit/                         # Auditoría
│   │   │   │   ├── AuditLogsPage.tsx          # Logs de auditoría
│   │   │   │   ├── AuditReportsPage.tsx       # Reportes de auditoría
│   │   │   │   ├── GenerateReportPage.tsx     # Generar reporte
│   │   │   │   ├── AuditDashboardPage.tsx     # Dashboard de auditoría
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── access-control/                # Control de Acceso
│   │   │   │   ├── EntrancesExitsPage.tsx     # Registro entradas/salidas
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── notifications/                 # Centro de Notificaciones
│   │   │   │   ├── NotificationsPage.tsx      # Todas las notificaciones
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── settings/                      # Configuración
│   │   │   │   ├── ProfilePage.tsx            # Perfil de usuario
│   │   │   │   ├── SecurityPage.tsx           # Configuración 2FA
│   │   │   │   ├── SystemSettingsPage.tsx     # Configuración sistema
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── errors/                        # Páginas de error
│   │   │       ├── NotFoundPage.tsx           # 404
│   │   │       ├── UnauthorizedPage.tsx       # 403
│   │   │       └── ServerErrorPage.tsx        # 500
│   │   │
│   │   └── routes/                            # Configuración de rutas
│   │       ├── AppRoutes.tsx                  # Rutas principales
│   │       ├── PrivateRoute.tsx               # Ruta protegida
│   │       ├── PublicRoute.tsx                # Ruta pública
│   │       └── RoleBasedRoute.tsx             # Ruta por rol
│   │
│   └── electron/                              # Configuración Electron
│       ├── main.ts                            # Proceso principal
│       ├── preload.ts                         # Preload script
│       └── electron-builder.config.js         # Configuración de build
│
├── tests/                                     # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                               # Variables de entorno ejemplo
├── .env                                       # Variables de entorno (no commitear)
├── .gitignore                                 # Archivos ignorados por git
├── .eslintrc.cjs                              # Configuración ESLint
├── .prettierrc                                # Configuración Prettier
├── tsconfig.json                              # Configuración TypeScript
├── vite.config.ts                             # Configuración Vite
├── tailwind.config.js                         # Configuración TailwindCSS
├── postcss.config.js                          # Configuración PostCSS
├── package.json                               # Dependencias
├── package-lock.json                          # Lock de dependencias
└── README.md                                  # Documentación
```

---

## Flujo de Navegación

### Flujo Principal (Super Administrador)

```
1. Login (/login)
   ↓
2. Verificación 2FA (/auth/2fa)
   ↓
3. Dashboard Principal (/dashboard)
   │
   ├─→ Gestión de Usuarios (/users)
   │   ├─→ Lista de Usuarios (/users)
   │   ├─→ Crear Administrador (/users/create-admin)
   │   ├─→ Crear Super Admin (/users/create-super-admin)
   │   ├─→ Editar Usuario (/users/:id/edit)
   │   └─→ Detalle Usuario (/users/:id)
   │
   ├─→ Gestión de Roles (/roles)
   │   ├─→ Lista de Roles (/roles)
   │   ├─→ Crear Rol Personalizado (/roles/create)
   │   ├─→ Editar Rol (/roles/:id/edit)
   │   └─→ Detalle Rol (/roles/:id)
   │
   ├─→ Gestión de Adultos Mayores (/older-adults)
   │   ├─→ Lista de Adultos Mayores (/older-adults)
   │   ├─→ Crear Ficha Virtual (/older-adults/create)
   │   ├─→ Editar Ficha (/older-adults/:id/edit)
   │   ├─→ Detalle Completo (/older-adults/:id)
   │   ├─→ Generar PDF (/older-adults/:id/pdf)
   │   └─→ Compartir con Especialista (/older-adults/:id/share)
   │
   ├─→ Gestión de Citas (/appointments)
   │   ├─→ Lista de Citas (/appointments)
   │   ├─→ Calendario de Citas (/appointments/calendar)
   │   ├─→ Programar Cita (/appointments/schedule)
   │   ├─→ Registrar Atención (/appointments/:id/register-care)
   │   └─→ Generar Reporte Médico (/appointments/:id/report)
   │
   ├─→ Historiales Médicos (/medical-records)
   │   ├─→ Historial Completo (/medical-records/:patientId)
   │   ├─→ Antecedentes Clínicos (/medical-records/:patientId/clinical-history)
   │   └─→ Gestión de Medicamentos (/medical-records/:patientId/medication)
   │
   ├─→ Áreas Especializadas (/specialized-areas)
   │   ├─→ Enfermería (/specialized-areas/nursing)
   │   ├─→ Fisioterapia (/specialized-areas/physiotherapy)
   │   ├─→ Psicología (/specialized-areas/psychology)
   │   └─→ Trabajo Social (/specialized-areas/social-work)
   │
   ├─→ Gestión de Programas (/programs)
   │   ├─→ Lista de Programas (/programs)
   │   ├─→ Crear Programa (/programs/create)
   │   ├─→ Editar Programa (/programs/:id/edit)
   │   └─→ Detalle Programa (/programs/:id)
   │
   ├─→ Auditoría (/audit)
   │   ├─→ Logs de Auditoría (/audit/logs)
   │   ├─→ Dashboard de Auditoría (/audit/dashboard)
   │   ├─→ Generar Reporte (/audit/reports/generate)
   │   └─→ Historial de Reportes (/audit/reports)
   │
   ├─→ Control de Acceso (/access-control)
   │   └─→ Entradas y Salidas (/access-control/entries-exits)
   │
   ├─→ Notificaciones (/notifications)
   │
   └─→ Configuración (/settings)
       ├─→ Mi Perfil (/settings/profile)
       ├─→ Seguridad y 2FA (/settings/security)
       └─→ Configuración del Sistema (/settings/system)
```

---

## Componentes Principales

### 1. Autenticación

**LoginPage** (`/auth/login`)
- Formulario de login con validación
- Integración con JWT
- Manejo de errores (credenciales incorrectas, cuenta desactivada)
- Redirección a 2FA después de login exitoso

**TwoFactorPage** (`/auth/2fa`)
- Input de código 2FA de 6 dígitos
- Validación en tiempo real
- Temporizador de expiración
- Opción de reenviar código

### 2. Dashboard

**DashboardPage** (`/dashboard`)
- Tarjetas de estadísticas (usuarios activos, adultos mayores, citas del día)
- Gráficos de actividad (recharts)
- Lista de actividades recientes
- Acciones rápidas contextuales por rol
- Notificaciones importantes

### 3. Gestión de Usuarios

**UsersListPage** (`/users`)
- Tabla con filtros avanzados (rol, estado, búsqueda)
- Paginación
- Acciones: Ver, Editar, Desactivar
- Botón "Crear Administrador" y "Crear Super Administrador"

**CreateAdminPage** (`/users/create-admin`)
- Formulario con validación (react-hook-form + zod)
- Campos: DNI, nombre, apellidos, correo, rol
- Validación de DNI único en tiempo real
- Confirmación de creación
- Envío automático de credenciales por email

**CreateSuperAdminPage** (`/users/create-super-admin`)
- Formulario extendido con justificación obligatoria
- Confirmación de identidad (contraseña actual)
- Doble confirmación por acción crítica
- Notificación a otros super admins

### 4. Gestión de Adultos Mayores

**OlderAdultsListPage** (`/older-adults`)
- Tabla con búsqueda por DNI, nombre
- Filtros: estado (vivo/fallecido), programa
- Vista de tarjetas con foto de perfil
- Acciones: Ver ficha, Editar, Generar PDF, Compartir

**CreateVirtualRecordPage** (`/older-adults/create`)
- Formulario multi-paso (wizard):
  1. Datos personales
  2. Información familiar
  3. Historial educativo y laboral
  4. Datos económicos
  5. Contactos de emergencia
- Validaciones por paso
- Guardado automático (draft)
- Vista previa antes de guardar

**VirtualRecordDetailPage** (`/older-adults/:id`)
- Vista completa con tabs:
  - Información General
  - Familia y Contactos
  - Historial Médico
  - Citas Programadas
  - Programas Asociados
  - Timeline de Actividades
- Botones de acción: Editar, Generar PDF, Compartir

### 5. Gestión de Citas

**AppointmentCalendarPage** (`/appointments/calendar`)
- Calendario mensual interactivo
- Código de colores por tipo de cita
- Vista diaria/semanal/mensual
- Drag & drop para reprogramar
- Modal de detalles al hacer click

**ScheduleAppointmentPage** (`/appointments/schedule`)
- Selector de área especializada
- Selector de paciente (autocompletado)
- Selector de fecha y hora
- Selector de profesional asignado
- Tipo de cita (checkup, evaluación, terapia)
- Prioridad (baja, media, alta, urgente)
- Notas adicionales

**RegisterNursingCarePage** (`/appointments/:id/register-care`)
- Formulario de signos vitales:
  - Temperatura
  - Presión arterial
  - Frecuencia cardíaca
  - Nivel de dolor (escala 0-10)
- Movilidad, apetito, calidad de sueño
- Notas de observación
- Subida de archivos adjuntos

### 6. Historiales Médicos

**MedicalRecordsPage** (`/medical-records/:patientId`)
- Timeline cronológico de eventos médicos
- Filtros por tipo de evento, fecha, área
- Vista de resumen con métricas clave
- Gráficos de evolución (peso, presión, etc.)
- Exportar historial completo a PDF

**ClinicalHistoryPage** (`/medical-records/:patientId/clinical-history`)
- Antecedentes clínicos (padecimientos, caídas frecuentes)
- Datos biométricos (peso, altura, IMC, presión)
- Riesgo cardiovascular (RCVG)
- Problemas de visión/audición
- Vacunas aplicadas (checklist)
- Neoplasias (con descripción)

### 7. Roles y Permisos

**CreateRolePage** (`/roles/create`)
- Nombre y código de rol
- Descripción detallada (mínimo 20 caracteres)
- Nivel de prioridad (1-10)
- Árbol de permisos por módulo:
  - Gestión de Usuarios (ver, crear, editar, eliminar)
  - Adultos Mayores (ver, crear, editar, eliminar, PDF, compartir)
  - Citas (ver, crear, editar, cancelar, registrar atención)
  - Historiales Médicos (ver, crear, editar)
  - Auditoría (ver logs, generar reportes, exportar)
  - Roles (ver, crear, editar, eliminar)
  - Programas (ver, crear, editar, eliminar)
- Dependencias automáticas (ej: editar requiere ver)
- Vista previa de permisos seleccionados

### 8. Auditoría

**AuditLogsPage** (`/audit/logs`)
- Tabla paginada de logs
- Filtros avanzados:
  - Rango de fechas
  - Usuario
  - Acción (login, create, update, delete)
  - Tabla afectada
  - Registro ID
- Búsqueda por descripción
- Exportar a CSV/PDF
- Vista de detalles en modal

**AuditDashboardPage** (`/audit/dashboard`)
- Gráficos de actividad por usuario
- Gráficos de acciones por tipo
- Métricas de accesos al sistema
- Top 10 usuarios más activos
- Timeline de eventos críticos

**GenerateReportPage** (`/audit/reports/generate`)
- Selector de tipo de reporte:
  - Acciones generales
  - Cambios de roles
  - Actualizaciones de adultos mayores
  - Accesos al sistema
- Rango de fechas
- Vista previa antes de generar
- Descarga inmediata en PDF

### 9. Programas

**ProgramsListPage** (`/programs`)
- Tarjetas de programas con info resumida
- Filtros por tipo, estado
- Vista de lista/tarjetas (toggle)
- Acciones: Ver, Editar, Eliminar

**CreateProgramPage** (`/programs/create`)
- Nombre del programa
- Descripción detallada
- Tipo (salud, recreación, educación, comunidad)
- Fechas de inicio/fin
- Presupuesto
- Estado (planificado, en progreso, completado)
- Participantes (búsqueda y selección múltiple)
- Observaciones

### 10. Control de Acceso

**EntrancesExitsPage** (`/access-control/entries-exits`)
- Registro de entradas/salidas en tiempo real
- Filtros por tipo (empleado, adulto mayor, visitante)
- Estado (dentro/fuera)
- Búsqueda por DNI, nombre
- Tabla con timestamps de entrada/salida
- Botón "Registrar entrada" y "Registrar salida"

---

## Testing

### Tests Unitarios

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar en modo watch
npm run test:watch

# Generar coverage
npm run test:coverage
```

### Tests E2E

```bash
# Ejecutar tests end-to-end
npm run test:e2e
```

### Estructura de Tests

```
tests/
├── unit/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── hooks/
│   └── utils/
├── integration/
│   └── pages/
└── e2e/
    ├── auth.spec.ts
    ├── users.spec.ts
    └── older-adults.spec.ts
```

---

## Build y Deploy

### Build para Web

```bash
# Build de producción
npm run build

# Preview del build
npm run preview
```

Los archivos se generan en `dist/`

### Build para Electron (Windows)

```bash
# Build instalador .exe
npm run electron:build

# Build portable
npm run electron:build:portable
```

Los instaladores se generan en `dist/electron/`

### Configuración de Electron Builder

El archivo `electron-builder.config.js` incluye:
- Icono de la aplicación
- Nombre del instalador
- Configuración de auto-update
- Permisos necesarios
- Firma digital (opcional)

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Vista previa del build |
| `npm run electron:dev` | Ejecutar en Electron (desarrollo) |
| `npm run electron:build` | Compilar instalador Electron |
| `npm run lint` | Ejecutar linter ESLint |
| `npm run format` | Formatear código con Prettier |
| `npm run test` | Ejecutar tests unitarios |
| `npm run test:e2e` | Ejecutar tests end-to-end |
| `npm run test:coverage` | Generar reporte de cobertura |

---

## Guía de Estilos

### TailwindCSS

El proyecto usa TailwindCSS para estilos. Convenciones:

```tsx
// ✅ Correcto: usar clases de Tailwind
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Guardar
</button>

// ❌ Incorrecto: estilos inline
<button style={{ backgroundColor: 'blue', color: 'white' }}>
  Guardar
</button>
```

### Nomenclatura de Componentes

```tsx
// ✅ Correcto: PascalCase para componentes
const UserCard = () => { ... }

// ✅ Correcto: camelCase para funciones
const handleSubmit = () => { ... }

// ✅ Correcto: UPPER_CASE para constantes
const API_BASE_URL = 'http://localhost:3000'
```

### Organización de Imports

```tsx
// 1. Imports de React y librerías externas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Imports de configuración y tipos
import { API_ENDPOINTS } from '@config/constants';
import type { User } from '@types/user.types';

// 3. Imports de servicios y hooks
import { useAuth } from '@application/hooks/auth/useAuth';
import { usersService } from '@infrastructure/api/users.service';

// 4. Imports de componentes
import { Button } from '@presentation/components/atoms/Button';
import { UserForm } from '@presentation/components/organisms/UserForm';

// 5. Imports de estilos (si aplica)
import './UserCard.styles.css';
```

---

## Variables de Entorno

### `.env.example`

```env
# API Backend
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=15000

# Aplicación
VITE_APP_NAME=Sistema Hogar de Ancianos
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Autenticación
VITE_JWT_STORAGE_KEY=hogar_auth_token
VITE_2FA_APP_NAME=Hogar de Ancianos

# Configuración UI
VITE_ITEMS_PER_PAGE=10
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Features flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_AUTO_SAVE=true

# Electron
VITE_ELECTRON_WINDOW_WIDTH=1280
VITE_ELECTRON_WINDOW_HEIGHT=800
```

---

## Convenciones de Código

### Componentes Funcionales

```tsx
// ✅ Correcto: Usar FC con tipado
import { FC } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};
```

### Custom Hooks

```tsx
// ✅ Correcto: Hooks con tipado completo
import { useState, useEffect } from 'react';
import { usersService } from '@infrastructure/api/users.service';
import type { User } from '@types/user.types';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
};
```

### Servicios API

```tsx
// ✅ Correcto: Servicios con axios instance
import { axiosInstance } from './axios.instance';
import type { User, CreateUserDto } from '@types/user.types';

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get<User[]>('/users');
    return data;
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await axiosInstance.get<User>(`/users/${id}`);
    return data;
  },

  create: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await axiosInstance.post<User>('/users', userData);
    return data;
  },

  update: async (id: number, userData: Partial<User>): Promise<User> => {
    const { data } = await axiosInstance.patch<User>(`/users/${id}`, userData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },
};
```

---

## Seguridad

### Protección de Rutas

```tsx
// PrivateRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@application/hooks/auth/useAuth';

export const PrivateRoute: FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### Protección por Roles

```tsx
// RoleBasedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@application/hooks/auth/useAuth';
import type { Role } from '@types/auth.types';

interface RoleBasedRouteProps {
  children: JSX.Element;
  allowedRoles: Role[];
}

export const RoleBasedRoute: FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

### Manejo de Tokens

```typescript
// local-storage.service.ts
export const localStorageService = {
  setToken: (token: string): void => {
    localStorage.setItem('access_token', token);
  },

  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  removeToken: (): void => {
    localStorage.removeItem('access_token');
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem('refresh_token', token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  clear: (): void => {
    localStorage.clear();
  },
};
```

---

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Asegúrate de que el código pase los tests (`npm run test`)
4. Asegúrate de que el código pase el linter (`npm run lint`)
5. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
6. Push a la rama (`git push origin feature/nueva-funcionalidad`)
7. Abre un Pull Request en GitLab

### Checklist antes de PR

- [ ] El código compila sin errores (`npm run build`)
- [ ] Los tests pasan (`npm run test`)
- [ ] El linter no muestra errores (`npm run lint`)
- [ ] Los componentes tienen tests unitarios
- [ ] La documentación está actualizada
- [ ] Se siguieron las convenciones de código

---

## Roadmap

- [x] Autenticación con JWT y 2FA
- [x] Dashboard principal
- [x] Gestión de usuarios
- [ ] Gestión completa de adultos mayores
- [ ] Sistema de citas con calendario
- [ ] Historiales médicos completos
- [ ] Módulos especializados (enfermería, fisioterapia, psicología)
- [ ] Auditoría completa con dashboard
- [ ] Gestión de roles personalizados
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Modo offline completo
- [ ] Exportación masiva de datos
- [ ] Gráficos analíticos avanzados
- [ ] Soporte multi-idioma (i18n)

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## Autores

- **Luis** - Frontend Lead - UI/UX & Funcionalidad Principal
- **Tony** - Frontend Developer - Servicios & Integración Backend
- **Jona** - Database & API Integration

---

## Contacto

Para consultas o soporte:

- Email: soporte@hogar-ancianos.com
- GitLab: [Issues](https://git.ucr.ac.cr/proyecto_analisis/frontend_proton_react_hogar_de_ancianos/-/issues)

---

## Agradecimientos

- Universidad de Costa Rica (UCR) - Análisis de Sistemas 2025
- React Community
- TailwindCSS Team
- NestJS Backend Team

---

**Desarrollado con React, TypeScript y TailwindCSS**