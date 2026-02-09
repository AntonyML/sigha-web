# Tareas - Registros de Enfermeria (Nursing Records)

## Informacion del Modulo
- **Tabla DB**: nursing_records
- **Controlador Backend**: nursing.controller.ts
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Analisis de Implementacion Actual
#### 1.1 Revisar implementacion existente
- [ ] No iniciado - Revisar nursingService.ts existente
- [ ] No iniciado - Revisar paginas existentes en pages/nursing
- [ ] No iniciado - Identificar que esta implementado y que falta
- [ ] No iniciado - Revisar tipos definidos para nursing

### 2. Servicios (src/services)
#### 2.1 Completar nursingService.ts
- [ ] No iniciado - Verificar getAllRecords()
- [ ] No iniciado - Verificar getRecordById(id)
- [ ] No iniciado - Verificar getRecordsByPatient(olderAdultId)
- [ ] No iniciado - Verificar createRecord(data)
- [ ] No iniciado - Verificar updateRecord(id, data)
- [ ] No iniciado - Verificar deleteRecord(id)
- [ ] No iniciado - Verificar searchRecords(filters)
- [ ] No iniciado - Agregar metodos faltantes si es necesario

### 3. Types (src/types)
#### 3.1 Completar nursing.ts
- [ ] No iniciado - Verificar interface NursingRecord
- [ ] No iniciado - Verificar interface CreateNursingRecordData
- [ ] No iniciado - Verificar interface UpdateNursingRecordData
- [ ] No iniciado - Verificar interface NursingRecordSearchParams
- [ ] No iniciado - Verificar interface NursingRecordApiResponse
- [ ] No iniciado - Agregar tipos faltantes si es necesario

### 4. Flows (src/infrastructure/flows)
#### 4.1 Crear o completar nursingFlow.ts
- [ ] No iniciado - Verificar si existe carpeta nursing en flows
- [ ] No iniciado - Implementar getAllRecords()
- [ ] No iniciado - Implementar getRecordById()
- [ ] No iniciado - Implementar getRecordsByPatient()
- [ ] No iniciado - Implementar createRecord()
- [ ] No iniciado - Implementar updateRecord()
- [ ] No iniciado - Implementar deleteRecord()
- [ ] No iniciado - Agregar validaciones de negocio

### 5. Paginas (src/presentation/pages/nursing)
#### 5.1 Revisar y completar paginas existentes
- [ ] No iniciado - Revisar NursingDashboard.tsx
- [ ] No iniciado - Revisar AppointmentDetail.tsx
- [ ] No iniciado - Revisar AppointmentHistory.tsx
- [ ] No iniciado - Revisar AppointmentResults.tsx
- [ ] No iniciado - Revisar CompleteAppointment.tsx
- [ ] No iniciado - Revisar PatientAppointments.tsx
- [ ] No iniciado - Revisar ScheduleAppointment.tsx

#### 5.2 Crear paginas faltantes si es necesario
- [ ] No iniciado - Verificar si falta NursingRecordsListPage.tsx
- [ ] No iniciado - Verificar si falta CreateNursingRecordPage.tsx
- [ ] No iniciado - Verificar si falta EditNursingRecordPage.tsx
- [ ] No iniciado - Verificar si falta ViewNursingRecordPage.tsx

### 6. Componentes Reutilizables
#### 6.1 Crear componentes especificos del modulo si faltan
- [ ] No iniciado - Verificar NursingRecordCard.tsx
- [ ] No iniciado - Verificar NursingRecordForm.tsx
- [ ] No iniciado - Verificar NursingRecordFilters.tsx
- [ ] No iniciado - Crear componentes faltantes

### 7. Integracion
#### 7.1 Verificar rutas en App.tsx
- [ ] No iniciado - Verificar ruta /nursing
- [ ] No iniciado - Verificar rutas de appointments
- [ ] No iniciado - Agregar rutas faltantes

#### 7.2 Verificar menu principal
- [ ] No iniciado - Verificar opcion en DashboardPage
- [ ] No iniciado - Verificar icono correspondiente

### 8. Testing
#### 8.1 Tests unitarios
- [ ] No iniciado - Tests para nursingService
- [ ] No iniciado - Tests para nursingFlow
- [ ] No iniciado - Tests para componentes

#### 8.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- nr_date (DATE)
- nr_time (TIME)
- nr_vital_signs (TEXT)
- nr_observations (TEXT)
- nr_medications_administered (TEXT)
- nr_patient_status (VARCHAR)
- nr_nurse_name (VARCHAR)
- create_at (DATETIME)
- id_older_adult (FK a older_adult)

## Notas Importantes
- Este modulo YA TIENE implementacion parcial
- Revisar nursingService.ts para ver que endpoints estan disponibles
- Las paginas actuales parecen enfocadas en appointments, no en nursing_records
- Puede haber confusion entre nursing appointments y nursing records
- Verificar en backend si hay endpoints separados para records vs appointments
- Considerar si las appointments son realmente nursing_records o son specialized_appointments
- Priorizar completar funcionalidad basica de registros de enfermeria
