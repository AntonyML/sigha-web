# Tareas - Citas Especializadas (Specialized Appointments)

## Informacion del Modulo
- **Tabla DB**: specialized_appointment
- **Controlador Backend**: Verificar en backend
- **Relaciones**: 
  - Relacionado con specialized_area
  - Relacionado con older_adult (pacientes)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear specializedAppointmentService.ts
- [ ] No iniciado - Crear archivo specializedAppointmentService.ts
- [ ] No iniciado - Implementar getAllAppointments()
- [ ] No iniciado - Implementar getAppointmentById(id)
- [ ] No iniciado - Implementar getAppointmentsByPatient(olderAdultId)
- [ ] No iniciado - Implementar getAppointmentsByArea(areaId)
- [ ] No iniciado - Implementar createAppointment(data)
- [ ] No iniciado - Implementar updateAppointment(id, data)
- [ ] No iniciado - Implementar deleteAppointment(id)
- [ ] No iniciado - Implementar cancelAppointment(id)
- [ ] No iniciado - Implementar completeAppointment(id)
- [ ] No iniciado - Implementar searchAppointments(filters)

### 2. Types (src/types)
#### 2.1 Crear specializedAppointment.ts
- [ ] No iniciado - Definir interface SpecializedAppointment
- [ ] No iniciado - Definir interface CreateSpecializedAppointmentData
- [ ] No iniciado - Definir interface UpdateSpecializedAppointmentData
- [ ] No iniciado - Definir interface SpecializedAppointmentSearchParams
- [ ] No iniciado - Definir interface SpecializedAppointmentApiResponse
- [ ] No iniciado - Definir enums para estados de cita

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear specializedAppointmentFlow.ts
- [ ] No iniciado - Crear carpeta specialized-appointment en flows
- [ ] No iniciado - Implementar getAllAppointments()
- [ ] No iniciado - Implementar getAppointmentById()
- [ ] No iniciado - Implementar getAppointmentsByPatient()
- [ ] No iniciado - Implementar createAppointment()
- [ ] No iniciado - Implementar updateAppointment()
- [ ] No iniciado - Implementar cancelAppointment()
- [ ] No iniciado - Implementar completeAppointment()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/specialized-appointments)
#### 4.1 Verificar y completar AppointmentsListPage.tsx
- [ ] No iniciado - Verificar si existe el componente de lista
- [ ] No iniciado - Implementar/actualizar tabla de citas
- [ ] No iniciado - Agregar filtros de busqueda (fecha, area, paciente, estado)
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, cancelar, completar)
- [ ] No iniciado - Agregar vista de calendario

#### 4.2 Crear ScheduleAppointmentPage.tsx
- [ ] No iniciado - Crear formulario de agendamiento
- [ ] No iniciado - Implementar selector de area especializada
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Implementar selector de fecha y hora
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Verificar disponibilidad
- [ ] No iniciado - Agregar manejo de errores

#### 4.3 Crear EditAppointmentPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewAppointmentPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa de la cita
- [ ] No iniciado - Mostrar informacion del paciente
- [ ] No iniciado - Mostrar informacion del area
- [ ] No iniciado - Agregar opciones de edicion, cancelacion y completado

#### 4.5 Crear AppointmentsDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Mostrar citas del dia
- [ ] No iniciado - Mostrar citas proximas
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar calendario interactivo

#### 4.6 Crear AppointmentCalendarPage.tsx
- [ ] No iniciado - Crear vista de calendario
- [ ] No iniciado - Integrar libreria de calendario
- [ ] No iniciado - Mostrar citas por fecha
- [ ] No iniciado - Permitir crear citas desde el calendario

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear AppointmentCard.tsx
- [ ] No iniciado - Crear AppointmentForm.tsx
- [ ] No iniciado - Crear AppointmentFilters.tsx
- [ ] No iniciado - Crear AppointmentCalendar.tsx
- [ ] No iniciado - Crear AppointmentStatusBadge.tsx

### 6. Integracion
#### 6.1 Verificar rutas en App.tsx
- [ ] No iniciado - Verificar ruta /specialized-appointments
- [ ] No iniciado - Agregar ruta /specialized-appointments/schedule
- [ ] No iniciado - Agregar ruta /specialized-appointments/edit/:id
- [ ] No iniciado - Agregar ruta /specialized-appointments/view/:id
- [ ] No iniciado - Agregar ruta /specialized-appointments/calendar

#### 6.2 Verificar menu principal
- [ ] No iniciado - Verificar opcion en DashboardPage
- [ ] No iniciado - Verificar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para specializedAppointmentService
- [ ] No iniciado - Tests para specializedAppointmentFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo de agendamiento

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- spa_date (DATE)
- spa_time (TIME)
- spa_reason (TEXT)
- spa_status (ENUM: 'scheduled', 'completed', 'cancelled', 'no show')
- spa_observations (TEXT)
- spa_attended_by (VARCHAR)
- create_at (DATETIME)
- id_specialized_area (FK a specialized_area)
- id_older_adult (FK a older_adult)

## Notas
- Verificar si ya existe implementacion parcial en specialized-appointments
- Las citas se relacionan con areas especializadas y pacientes
- Considerar notificaciones para recordatorios de citas
- Implementar validacion de horarios disponibles
- Considerar permisos de usuario para CRUD
- Integrar con sistema de notificaciones existente
