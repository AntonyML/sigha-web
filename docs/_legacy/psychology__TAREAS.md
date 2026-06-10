# Tareas - Sesiones de Psicologia (Psychology Sessions)

## Informacion del Modulo
- **Tabla DB**: psychology_sessions
- **Controlador Backend**: psychology.controller.ts
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear psychologyService.ts
- [ ] No iniciado - Crear archivo psychologyService.ts
- [ ] No iniciado - Implementar getAllSessions()
- [ ] No iniciado - Implementar getSessionById(id)
- [ ] No iniciado - Implementar getSessionsByPatient(olderAdultId)
- [ ] No iniciado - Implementar createSession(data)
- [ ] No iniciado - Implementar updateSession(id, data)
- [ ] No iniciado - Implementar deleteSession(id)
- [ ] No iniciado - Implementar searchSessions(filters)

### 2. Types (src/types)
#### 2.1 Crear psychology.ts
- [ ] No iniciado - Definir interface PsychologySession
- [ ] No iniciado - Definir interface CreatePsychologySessionData
- [ ] No iniciado - Definir interface UpdatePsychologySessionData
- [ ] No iniciado - Definir interface PsychologySessionSearchParams
- [ ] No iniciado - Definir interface PsychologySessionApiResponse

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear psychologyFlow.ts
- [ ] No iniciado - Crear carpeta psychology en flows
- [ ] No iniciado - Implementar getAllSessions()
- [ ] No iniciado - Implementar getSessionById()
- [ ] No iniciado - Implementar getSessionsByPatient()
- [ ] No iniciado - Implementar createSession()
- [ ] No iniciado - Implementar updateSession()
- [ ] No iniciado - Implementar deleteSession()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/psychology)
#### 4.1 Crear PsychologyListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de sesiones
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 4.2 Crear CreatePsychologySessionPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Agregar campos de sesion
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Agregar manejo de errores
- [ ] No iniciado - Considerar confidencialidad de datos

#### 4.3 Crear EditPsychologySessionPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewPsychologySessionPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa de la sesion
- [ ] No iniciado - Mostrar informacion del paciente
- [ ] No iniciado - Agregar opciones de edicion y eliminacion
- [ ] No iniciado - Considerar permisos de visualizacion

#### 4.5 Crear PsychologyDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Mostrar sesiones del dia
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar navegacion a otras vistas

#### 4.6 Crear PatientPsychologyHistory.tsx
- [ ] No iniciado - Crear vista de historial por paciente
- [ ] No iniciado - Mostrar timeline de sesiones
- [ ] No iniciado - Agregar filtros temporales
- [ ] No iniciado - Permitir exportar historial

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear PsychologySessionCard.tsx
- [ ] No iniciado - Crear PsychologySessionForm.tsx
- [ ] No iniciado - Crear PsychologySessionFilters.tsx
- [ ] No iniciado - Crear PsychologyTimeline.tsx

### 6. Integracion
#### 6.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /psychology
- [ ] No iniciado - Agregar ruta /psychology/create
- [ ] No iniciado - Agregar ruta /psychology/edit/:id
- [ ] No iniciado - Agregar ruta /psychology/view/:id
- [ ] No iniciado - Agregar ruta /psychology/patient/:patientId

#### 6.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para psychologyService
- [ ] No iniciado - Tests para psychologyFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- psy_date (DATE)
- psy_session_number (INT)
- psy_intervention_type (VARCHAR)
- psy_topics_addressed (TEXT)
- psy_patient_mood (VARCHAR)
- psy_progress_assessment (TEXT)
- psy_observations (TEXT)
- psy_next_session_plan (TEXT)
- psy_psychologist_name (VARCHAR)
- create_at (DATETIME)
- id_older_adult (FK a older_adult)

## Notas
- Revisar psychology.controller.ts en el backend para endpoints exactos
- Datos sensibles - considerar permisos estrictos de acceso
- Las sesiones son independientes pero relacionadas con pacientes
- Considerar mostrar progreso del paciente a lo largo de las sesiones
- Considerar permisos de usuario (solo psicologos y admins)
- Integrar con el modulo de adultos mayores
- Asegurar confidencialidad de la informacion
