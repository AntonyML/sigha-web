# Tareas - Sesiones de Fisioterapia (Physiotherapy Sessions)

## Informacion del Modulo
- **Tabla DB**: physiotherapy_sessions
- **Controlador Backend**: physiotherapy.controller.ts
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear physiotherapyService.ts
- [ ] No iniciado - Crear archivo physiotherapyService.ts
- [ ] No iniciado - Implementar getAllSessions()
- [ ] No iniciado - Implementar getSessionById(id)
- [ ] No iniciado - Implementar getSessionsByPatient(olderAdultId)
- [ ] No iniciado - Implementar createSession(data)
- [ ] No iniciado - Implementar updateSession(id, data)
- [ ] No iniciado - Implementar deleteSession(id)
- [ ] No iniciado - Implementar searchSessions(filters)

### 2. Types (src/types)
#### 2.1 Crear physiotherapy.ts
- [ ] No iniciado - Definir interface PhysiotherapySession
- [ ] No iniciado - Definir interface CreatePhysiotherapySessionData
- [ ] No iniciado - Definir interface UpdatePhysiotherapySessionData
- [ ] No iniciado - Definir interface PhysiotherapySessionSearchParams
- [ ] No iniciado - Definir interface PhysiotherapySessionApiResponse

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear physiotherapyFlow.ts
- [ ] No iniciado - Crear carpeta physiotherapy en flows
- [ ] No iniciado - Implementar getAllSessions()
- [ ] No iniciado - Implementar getSessionById()
- [ ] No iniciado - Implementar getSessionsByPatient()
- [ ] No iniciado - Implementar createSession()
- [ ] No iniciado - Implementar updateSession()
- [ ] No iniciado - Implementar deleteSession()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/physiotherapy)
#### 4.1 Crear PhysiotherapyListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de sesiones
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 4.2 Crear CreatePhysiotherapySessionPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Agregar campos de sesion
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Agregar manejo de errores

#### 4.3 Crear EditPhysiotherapySessionPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewPhysiotherapySessionPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa de la sesion
- [ ] No iniciado - Mostrar informacion del paciente
- [ ] No iniciado - Agregar opciones de edicion y eliminacion

#### 4.5 Crear PhysiotherapyDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Mostrar sesiones del dia
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar navegacion a otras vistas

#### 4.6 Crear PatientPhysiotherapyHistory.tsx
- [ ] No iniciado - Crear vista de historial por paciente
- [ ] No iniciado - Mostrar timeline de sesiones
- [ ] No iniciado - Agregar filtros temporales
- [ ] No iniciado - Permitir exportar historial

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear PhysiotherapySessionCard.tsx
- [ ] No iniciado - Crear PhysiotherapySessionForm.tsx
- [ ] No iniciado - Crear PhysiotherapySessionFilters.tsx
- [ ] No iniciado - Crear PhysiotherapyTimeline.tsx

### 6. Integracion
#### 6.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /physiotherapy
- [ ] No iniciado - Agregar ruta /physiotherapy/create
- [ ] No iniciado - Agregar ruta /physiotherapy/edit/:id
- [ ] No iniciado - Agregar ruta /physiotherapy/view/:id
- [ ] No iniciado - Agregar ruta /physiotherapy/patient/:patientId

#### 6.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para physiotherapyService
- [ ] No iniciado - Tests para physiotherapyFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- ps_date (DATE)
- ps_session_number (INT)
- ps_objectives (TEXT)
- ps_activities_performed (TEXT)
- ps_patient_response (TEXT)
- ps_observations (TEXT)
- ps_next_session_plan (TEXT)
- ps_physiotherapist_name (VARCHAR)
- create_at (DATETIME)
- id_older_adult (FK a older_adult)

## Notas
- Revisar physiotherapy.controller.ts en el backend para endpoints exactos
- Las sesiones son independientes pero relacionadas con pacientes
- Considerar mostrar progreso del paciente a lo largo de las sesiones
- Considerar permisos de usuario (solo fisioterapeutas y admins)
- Integrar con el modulo de adultos mayores
