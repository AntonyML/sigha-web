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

- **Autenticación Segura**: Login con JWT + Verificación 2FA obligatoria con códigos TOTP
- **Configuración 2FA**: Módulo completo para configurar autenticación de dos factores
- **Dashboard Interactivo**: Menú principal con acceso a todos los módulos
- **Gestión de Usuarios**: CRUD completo con asignación de roles y estados
- **Expedientes Digitales**: Sistema de fichas virtuales para adultos mayores
- **Sistema de Citas**: Gestión de citas médicas y atenciones (en desarrollo)
- **Historiales Médicos**: Visualización de datos clínicos (en desarrollo)
- **Auditoría**: Sistema de registro de actividades (en desarrollo)
- **Control de Sesiones**: Gestión de múltiples sesiones activas por usuario
- **Interfaz Responsiva**: Diseño adaptable con Bootstrap 5

---

## Arquitectura del Frontend

El frontend implementa **Clean Architecture** con separación de responsabilidades:

```
Presentation Layer (UI Components & Pages)
        ↓
Infrastructure Layer (Flows - Business Logic)
        ↓
Services Layer (HTTP API Calls)
        ↓
Backend API (NestJS)
```

### Capa de Flows (Arquitectura Principal)

El proyecto utiliza una **arquitectura basada en Flows** que centraliza la lógica de negocio:

**Page → Flow → Service → Backend**

- **Pages**: Componentes de presentación que manejan UI y estado local
- **Flows**: Capa intermedia con lógica de negocio, validaciones y transformaciones
- **Services**: Llamadas HTTP puras sin lógica de negocio
- **Backend**: API REST con NestJS

### Flows Implementados

#### 1. **authFlow** (`infrastructure/flows/authFlow.ts`)
Gestión completa de autenticación:
- `login()`: Login con credenciales, retorna si requiere 2FA
- `verify2FA()`: Verificación de código 2FA
- `logout()`: Cierre de sesión y limpieza de tokens
- `refreshToken()`: Renovación automática de tokens
- `getCurrentUser()`: Obtener usuario autenticado actual
- `getActiveSessions()`: Listar sesiones activas del usuario
- `terminateSession()`: Cerrar sesión específica
- `terminateAllSessions()`: Cerrar todas las sesiones
- `isAuthenticated()`: Verificar si hay sesión válida

#### 2. **userFlow** (`infrastructure/flows/userFlow.ts`)
Gestión de usuarios y roles:
- `getAllUsers()`: Listar todos los usuarios
- `getUserById()`: Obtener usuario por ID
- `createUser()`: Crear nuevo usuario con validaciones
- `updateUser()`: Actualizar datos de usuario
- `deleteUser()`: Eliminar usuario (soft delete)
- `toggleUserStatus()`: Activar/desactivar usuario
- `changePassword()`: Cambio de contraseña con validación
- `getAllRoles()`: Obtener lista de roles disponibles
- `searchUsers()`: Búsqueda de usuarios con filtros
- `getFullName()`: Formatear nombre completo del usuario
- `isUserActive()`: Verificar si usuario está activo

#### 3. **twoFactorFlow** (`infrastructure/flows/twoFactorFlow.ts`)
Configuración y gestión de 2FA:
- `generate2FA()`: Generar QR code y secret para configurar 2FA
- `enable2FA()`: Habilitar 2FA con verificación de código
- `disable2FA()`: Deshabilitar 2FA
- `get2FAStatus()`: Obtener estado actual de 2FA del usuario
- `regenerateBackupCodes()`: Regenerar códigos de respaldo
- `setup2FA()`: Flujo completo de configuración inicial
- `is2FAEnabled()`: Verificar si 2FA está activo

#### 4. **virtualFileFlow** (`infrastructure/flows/virtualFileFlow.ts`)
Gestión de expedientes virtuales (en desarrollo)

### Patrones de Diseño

- **Flow Pattern**: Lógica de negocio centralizada en flows
- **Service Pattern**: Servicios HTTP sin lógica de negocio
- **Atomic Design**: Componentes organizados en atoms, molecules, organisms, templates, pages
- **Custom Hooks**: Reutilización de lógica con hooks personalizados
- **Singleton Storage**: localStorage con patrón singleton

### Principios SOLID Aplicados

- **Single Responsibility**: Cada flow tiene una responsabilidad específica
- **Open/Closed**: Flows extensibles mediante composición
- **Dependency Inversion**: Pages dependen de abstracciones (flows) no de implementaciones

---

## Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|-----------|
| Framework | React 18.3 |
| Lenguaje | TypeScript 5.3 |
| Build Tool | Vite 5.0 |
| Escritorio | Electron 28 |
| Estilos | Bootstrap 5.3 |
| Estado Global | React Hooks (useState, useEffect) |
| Formularios | Validación nativa + React |
| HTTP Client | Axios 1.6 |
| Routing | React Router v6 |
| Autenticación | JWT + 2FA (TOTP) |
| Storage | localStorage (Singleton Pattern) |
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
git clone https://git.ucr.ac.cr/proyecto_analisis/sigha-web.git
cd sigha-web
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
sigha-web/
│
├── public/                                    # Archivos estáticos
│
├── electron/                                  # Configuración Electron
│   ├── main.ts                                # Proceso principal
│   ├── preload.ts                             # Preload script
│   └── tsconfig.json
│
├── src/
│   ├── main.tsx                               # Entry point
│   ├── App.tsx                                # Componente raíz con rutas
│   ├── App.css                                # Estilos globales
│   │
│   ├── assets/                                # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       └── global.css
│   │
│   ├── types/                                 # Tipos TypeScript
│   │   ├── auth.ts                            # Tipos de autenticación
│   │   ├── user.ts                            # Tipos de usuarios
│   │   ├── twoFactor.ts                       # Tipos de 2FA
│   │   ├── virtualFile.ts                     # Tipos de expedientes
│   │   ├── formData.ts                        # Tipos de formularios
│   │   └── index.ts
│   │
│   ├── infrastructure/                        # Capa de Infraestructura
│   │   │
│   │   ├── flows/                             # Lógica de negocio
│   │   │   ├── authFlow.ts                    # Flow de autenticación
│   │   │   ├── userFlow.ts                    # Flow de usuarios
│   │   │   ├── twoFactorFlow.ts               # Flow de 2FA
│   │   │   └── virtualFileFlow.ts             # Flow de expedientes
│   │   │
│   │   ├── storage/                           # Almacenamiento local
│   │   │   └── authStorage.ts                 # Storage de autenticación
│   │   │
│   │   └── utils/                             # Utilidades
│   │       └── Alert.ts                       # Alertas personalizadas
│   │
│   ├── services/                              # Servicios HTTP
│   │   ├── authService.ts                     # API de autenticación
│   │   ├── userService.ts                     # API de usuarios
│   │   ├── twoFactorService.ts                # API de 2FA
│   │   └── virtualFileService.ts              # API de expedientes
│   │
│   ├── domain/                                # Capa de Dominio
│   │   ├── models/                            # Modelos de dominio
│   │   ├── interfaces/                        # Interfaces
│   │   └── enums/                             # Enumeraciones
│   │
│   ├── presentation/                          # Capa de Presentación
│   │   │
│   │   ├── components/                        # Componentes UI (Atomic Design)
│   │   │   ├── atoms/                         # Componentes básicos
│   │   │   │   ├── Button/
│   │   │   │   │   └── Button.tsx
│   │   │   │   ├── Input/
│   │   │   │   │   └── Input.tsx
│   │   │   │   ├── Checkbox/
│   │   │   │   │   └── Checkbox.tsx
│   │   │   │   └── index.ts
│   │   │   ├── molecules/                     # Componentes combinados
│   │   │   ├── organisms/                     # Componentes complejos
│   │   │   └── templates/                     # Layouts de página
│   │   │
│   │   └── pages/                             # Páginas de la aplicación
│   │       │
│   │       ├── auth/                          # Módulo de Autenticación
│   │       │   └── LoginPage.tsx              # Página de login
│   │       │
│   │       ├── two-factor/                    # Módulo 2FA
│   │       │   └── TwoFactorPage.tsx          # Configuración 2FA
│   │       │
│   │       ├── dashboard/                     # Dashboard Principal
│   │       │   ├── DashboardPage.tsx          # Dashboard general
│   │       │   └── components/                # Componentes del dashboard
│   │       │
│   │       ├── main-menu/                     # Menú Principal
│   │       │   ├── MainMenuPage.tsx           # Menú de navegación
│   │       │   └── style.css                  # Estilos del menú
│   │       │
│   │       ├── users/                         # Gestión de Usuarios
│   │       │   ├── UserListPage.tsx           # Lista de usuarios
│   │       │   ├── CreateUserPage.tsx         # Crear usuario
│   │       │   ├── EditUserPage.tsx           # Editar usuario
│   │       │   └── ViewUserPage.tsx           # Ver detalle de usuario
│   │       │
│   │       ├── older-adults/                  # Gestión de Adultos Mayores
│   │       │   ├── OlderAdultsListPage.tsx    # Lista de adultos mayores
│   │       │   ├── CreateVirtualRecordPage.tsx # Crear ficha virtual
│   │       │   ├── EditVirtualRecordPage.tsx  # Editar ficha
│   │       │   └── ViewAdultsPage.tsx         # Ver detalle
│   │       │
│   │       ├── roles/                         # Gestión de Roles
│   │       ├── appointments/                  # Gestión de Citas
│   │       ├── medical-records/               # Historiales Médicos
│   │       ├── specialized-areas/             # Áreas Especializadas
│   │       ├── programs/                      # Gestión de Programas
│   │       ├── audit/                         # Auditoría
│   │       ├── access-control/                # Control de Acceso
│   │       ├── notifications/                 # Notificaciones
│   │       ├── settings/                      # Configuración
│   │       └── errors/                        # Páginas de error
│   │
│   └── utils/                                 # Utilidades generales
│       └── virtualFileApiHelper.ts            # Helper para API de expedientes
│
├── tests/                                     # Tests
│   ├── unit/
│   │   ├── components/
│   │   │   ├── atoms/
│   │   │   ├── molecules/
│   │   │   └── organisms/
│   │   ├── hooks/
│   │   └── utils/
│   ├── integration/
│   │   └── pages/
│   └── e2e/
│
├── dist-electron/                             # Build de Electron
├── .env.example                               # Variables de entorno ejemplo
├── .env                                       # Variables de entorno (no commitear)
├── .gitignore                                 # Archivos ignorados por git
├── eslint.config.js                           # Configuración ESLint
├── tsconfig.json                              # Configuración TypeScript
├── tsconfig.app.json                          # Config TS para app
├── tsconfig.node.json                         # Config TS para Node
├── vite.config.ts                             # Configuración Vite
├── package.json                               # Dependencias
└── README.md                                  # Documentación
```

---

## Flujo de Navegación

### Flujo de Autenticación

```
1. Login (/login)
   - Ingreso de DNI y contraseña
   - Validación de credenciales
   ↓
2. Verificación 2FA (requiere configuración previa)
   - Código TOTP de 6 dígitos desde app autenticadora
   - O código de respaldo de 8 caracteres
   ↓
3. Dashboard Principal (/dashboard)
   - Resumen de métricas del sistema
   ↓
4. Menú Principal (/main-menu)
   - Acceso a todos los módulos del sistema
```

### Módulos Implementados

#### Gestión de Usuarios (/users)
```
Menú Principal → Gestión de Usuarios
   │
   ├─→ Lista de Usuarios (/users)
   │   - Tabla con búsqueda y filtros
   │   - Ver, Editar, Eliminar usuarios
   │   - Activar/Desactivar usuarios
   │
   ├─→ Crear Usuario (/users/create)
   │   - Formulario completo de registro
   │   - Asignación de rol
   │   - Validación de datos
   │
   ├─→ Editar Usuario (/users/edit/:id)
   │   - Modificar información del usuario
   │   - Cambio de rol
   │   - Cambio de contraseña opcional
   │
   └─→ Ver Usuario (/users/view/:id)
       - Información completa del usuario
       - Roles asignados
       - Estado de cuenta
```

#### Gestión de Adultos Mayores (/older-adults)
```
Menú Principal → Gestión de Adultos Mayores
   │
   ├─→ Lista de Adultos Mayores (/older-adults)
   │   - Búsqueda por DNI/nombre
   │   - Filtros avanzados
   │
   ├─→ Crear Ficha Virtual (/older-adults/create)
   │   - Formulario de datos personales
   │   - Información de contacto
   │   - Datos familiares
   │
   ├─→ Editar Ficha (/older-adults/edit/:id)
   │   - Actualizar información
   │
   └─→ Ver Ficha (/older-adults/view/:id)
       - Detalle completo del expediente
```

#### Configuración 2FA (/two-factor)
```
Menú Principal → Configuración 2FA
   │
   ├─→ Estado de 2FA
   │   - Ver si está habilitado/deshabilitado
   │
   ├─→ Generar Configuración
   │   - Código QR para app autenticadora
   │   - Secret key manual
   │   - 8 códigos de respaldo
   │
   ├─→ Verificar y Habilitar
   │   - Ingresar código de 6 dígitos
   │   - Confirmar habilitación
   │
   └─→ Gestión
       - Deshabilitar 2FA
       - Regenerar códigos de respaldo
```

### Rutas Configuradas

| Ruta | Componente | Protección | Descripción |
|------|-----------|------------|-------------|
| `/` | LoginPage | Pública | Página de inicio/login |
| `/login` | LoginPage | Pública | Login con DNI y contraseña |
| `/dashboard` | DashboardPage | Privada | Dashboard principal |
| `/main-menu` | MainMenuPage | Privada | Menú de navegación |
| `/two-factor` | TwoFactorPage | Privada | Configuración 2FA |
| `/users` | UserListPage | Privada | Lista de usuarios |
| `/users/create` | CreateUserPage | Privada | Crear usuario |
| `/users/edit/:id` | EditUserPage | Privada | Editar usuario |
| `/users/view/:id` | ViewUserPage | Privada | Ver detalle usuario |
| `/older-adults` | OlderAdultsListPage | Privada | Lista adultos mayores |
| `/older-adults/create` | CreateVirtualRecordPage | Privada | Crear ficha |
| `/older-adults/edit/:id` | EditVirtualRecordPage | Privada | Editar ficha |
| `/older-adults/view/:id` | ViewAdultsPage | Privada | Ver ficha |

---

## Componentes Principales Implementados

### 1. Autenticación

**LoginPage** (`/login`)
- Formulario de login con DNI y contraseña
- Validación de credenciales con JWT
- Manejo de errores (credenciales incorrectas, cuenta desactivada)
- Redirección automática a dashboard tras autenticación exitosa
- Integración con authFlow

**TwoFactorPage** (`/two-factor`)
- Vista de estado actual de 2FA (habilitado/deshabilitado)
- Generación de QR code para apps autenticadoras (Google Authenticator, Authy, etc.)
- Visualización de secret key manual
- Generación de 8 códigos de respaldo con opciones de:
  - Copiar al portapapeles
  - Descargar como archivo de texto
- Input de verificación de 6 dígitos
- Proceso completo de habilitación con confirmación
- Opción para deshabilitar 2FA
- Regeneración de códigos de respaldo con modal
- Integración con twoFactorFlow

### 2. Dashboard y Menú

**DashboardPage** (`/dashboard`)
- Vista principal tras login
- Acceso rápido al menú principal
- Bienvenida personalizada

**MainMenuPage** (`/main-menu`)
- Grid de opciones de navegación:
  - Gestión de Usuarios
  - Gestión de Adultos Mayores
  - Gestión de Citas
  - Configuración 2FA
  - Roles y Permisos
  - Auditoría
  - Programas y Actividades
  - Reportes y Estadísticas
- Diseño con tarjetas Bootstrap 5
- Iconos descriptivos para cada módulo
- Navegación con React Router

### 3. Gestión de Usuarios

**UserListPage** (`/users`)
- Tabla completa de usuarios del sistema
- Búsqueda por nombre, DNI o correo
- Columnas: ID, Nombre completo, DNI, Correo, Rol, Estado
- Acciones por usuario:
  - Ver detalle (botón azul con ícono de ojo)
  - Editar (botón amarillo con ícono de lápiz)
  - Eliminar (botón rojo con ícono de papelera, requiere confirmación)
  - Activar/Desactivar (toggle con confirmación)
- Badge de estado (Activo/Inactivo)
- Integración con userFlow
- Manejo de estados de carga y errores

**CreateUserPage** (`/users/create`)
- Formulario completo de registro:
  - DNI (requerido, único)
  - Primer nombre (requerido)
  - Segundo nombre (opcional)
  - Primer apellido (requerido)
  - Segundo apellido (opcional)
  - Correo electrónico (requerido, único)
  - Teléfono (requerido)
  - Contraseña (requerido, mínimo 6 caracteres)
  - Confirmar contraseña (debe coincidir)
  - Rol (selector dinámico desde backend)
- Validaciones en tiempo real
- Mensaje de éxito con redirección
- Botón "Volver a la lista"
- Integración con userFlow.createUser()

**EditUserPage** (`/users/edit/:id`)
- Carga de datos del usuario desde backend
- Formulario prellenado con información actual
- Campos editables:
  - DNI, nombres, apellidos
  - Correo, teléfono
  - Rol (selector dinámico)
- Cambio de contraseña opcional (solo si se completan ambos campos)
- Validación de confirmación de contraseña
- Actualización inteligente (solo envía campos modificados)
- Mensaje de éxito con redirección
- Integración con userFlow.getUserById() y userFlow.updateUser()

**ViewUserPage** (`/users/view/:id`)
- Vista detallada de información del usuario en 4 secciones:
  1. **Información Personal**: Nombres, apellidos, DNI
  2. **Contacto**: Correo, teléfono
  3. **Acceso al Sistema**: Rol, estado (badge), fecha de creación, última actualización
  4. **Roles y Permisos**: Lista de roles asignados con badges de colores
- Botones de acción: Volver, Editar usuario
- Diseño con cards de Bootstrap 5
- Estados de carga y errores
- Integración con userFlow.getUserById() y userFlow.getAllRoles()

### 4. Gestión de Adultos Mayores (En Desarrollo)

**OlderAdultsListPage** (`/older-adults`)
- Lista de adultos mayores registrados
- Búsqueda y filtros (en desarrollo)
- Acciones: Ver, Editar, Crear nuevo

**CreateVirtualRecordPage** (`/older-adults/create`)
- Formulario de creación de ficha virtual (en desarrollo)

**EditVirtualRecordPage** (`/older-adults/edit/:id`)
- Edición de ficha virtual (en desarrollo)

**ViewAdultsPage** (`/older-adults/view/:id`)
- Vista detallada de expediente (en desarrollo)
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

### Bootstrap 5

El proyecto usa Bootstrap 5 para estilos. Convenciones:

```tsx
// CORRECTO: usar clases de Bootstrap
<button className="btn btn-primary">
  Guardar
</button>

// INCORRECTO: estilos inline
<button style={{ backgroundColor: 'blue', color: 'white' }}>
  Guardar
</button>
```

### Nomenclatura de Componentes

```tsx
// CORRECTO: PascalCase para componentes
const UserCard = () => { ... }

// CORRECTO: camelCase para funciones
const handleSubmit = () => { ... }

// CORRECTO: UPPER_CASE para constantes
const API_BASE_URL = 'http://localhost:3000'
```

### Organización de Imports

```tsx
// 1. Imports de React y librerías externas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Imports de tipos
import type { User } from '../../types/user';

// 3. Imports de flows
import { userFlow } from '../../infrastructure/flows/userFlow';

// 4. Imports de componentes
import { Button } from '../components/atoms/Button/Button';

// 5. Imports de estilos (si aplica)
import './UserCard.css';
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
// CORRECTO: Usar FC con tipado
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

### Uso de Flows

```tsx
// CORRECTO: Usar flows para lógica de negocio
import { useState, useEffect } from 'react';
import { userFlow } from '../../infrastructure/flows/userFlow';
import type { User } from '../../types/user';

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await userFlow.getAllUsers();
      
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        alert(result.error || 'Error al cargar usuarios');
      }
    } catch (error) {
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{userFlow.getFullName(user)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

### Servicios HTTP

```tsx
// CORRECTO: Servicios con axios y tipos
import axios from 'axios';
import type { User, CreateUserData, UpdateUserData } from '../types/user';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await axios.get<User>(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserData): Promise<User> {
    const response = await axios.post<User>(`${API_BASE_URL}/users`, data);
    return response.data;
  },

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await axios.patch<User>(`${API_BASE_URL}/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
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

### Completado
- [x] Autenticación con JWT
- [x] Verificación 2FA con TOTP
- [x] Configuración completa de 2FA (QR, secret, códigos de respaldo)
- [x] Gestión de sesiones activas
- [x] Dashboard principal
- [x] Menú principal de navegación
- [x] CRUD completo de usuarios con flows
- [x] Sistema de roles y permisos
- [x] Arquitectura basada en Flows (authFlow, userFlow, twoFactorFlow)
- [x] Storage con patrón Singleton
- [x] Componentes atómicos (Button, Input, Checkbox)
- [x] Páginas de usuarios (List, Create, Edit, View)
- [x] Inicio de gestión de adultos mayores

### En Desarrollo
- [ ] Completar módulo de adultos mayores (fichas virtuales completas)
- [ ] Sistema de citas con calendario
- [ ] Historiales médicos completos
- [ ] Módulos especializados (enfermería, fisioterapia, psicología)

### Pendiente
- [ ] Auditoría completa con dashboard
- [ ] Gestión de roles personalizados
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Exportación masiva de datos
- [ ] Gráficos analíticos avanzados
- [ ] Modo offline completo
- [ ] Soporte multi-idioma (i18n)
- [ ] Tests E2E completos

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
- GitLab: [Issues](https://git.ucr.ac.cr/proyecto_analisis/sigha-web/-/issues)

---

## Agradecimientos

- Universidad de Costa Rica (UCR) - Análisis de Sistemas 2025
- React Community
- Bootstrap Team
- NestJS Backend Team

---

**Desarrollado con React, TypeScript y Bootstrap 5**