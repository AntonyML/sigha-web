# Tareas - Registros Medicos (Medical Records)

## Informacion del Modulo
- **Tabla DB**: medical_record
- **Controlador Backend**: medical-record.controller.ts
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear medicalRecordService.ts
- [ ] No iniciado - Crear archivo medicalRecordService.ts
- [ ] No iniciado - Implementar getAllMedicalRecords()
- [ ] No iniciado - Implementar getMedicalRecordById(id)
- [ ] No iniciado - Implementar getMedicalRecordsByPatient(olderAdultId)
- [ ] No iniciado - Implementar createMedicalRecord(data)
- [ ] No iniciado - Implementar updateMedicalRecord(id, data)
- [ ] No iniciado - Implementar deleteMedicalRecord(id)
- [ ] No iniciado - Implementar searchMedicalRecords(filters)

### 2. Types (src/types)
#### 2.1 Crear medicalRecord.ts
- [ ] No iniciado - Definir interface MedicalRecord
- [ ] No iniciado - Definir interface CreateMedicalRecordData
- [ ] No iniciado - Definir interface UpdateMedicalRecordData
- [ ] No iniciado - Definir interface MedicalRecordSearchParams
- [ ] No iniciado - Definir interface MedicalRecordApiResponse

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear medicalRecordFlow.ts
- [ ] No iniciado - Crear carpeta medical-record en flows
- [ ] No iniciado - Implementar getAllMedicalRecords()
- [ ] No iniciado - Implementar getMedicalRecordById()
- [ ] No iniciado - Implementar getMedicalRecordsByPatient()
- [ ] No iniciado - Implementar createMedicalRecord()
- [ ] No iniciado - Implementar updateMedicalRecord()
- [ ] No iniciado - Implementar deleteMedicalRecord()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/medical-records)
#### 4.1 Crear MedicalRecordsListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de registros medicos
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 4.2 Crear CreateMedicalRecordPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Agregar campos de diagnostico
- [ ] No iniciado - Agregar campos de tratamiento
- [ ] No iniciado - Agregar manejo de errores

#### 4.3 Crear EditMedicalRecordPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewMedicalRecordPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa del registro
- [ ] No iniciado - Mostrar informacion del paciente
- [ ] No iniciado - Agregar opciones de edicion y eliminacion
- [ ] No iniciado - Agregar opcion de imprimir

#### 4.5 Crear MedicalRecordsDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Agregar estadisticas de registros
- [ ] No iniciado - Agregar navegacion a otras vistas
- [ ] No iniciado - Mostrar ultimos registros

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear MedicalRecordCard.tsx
- [ ] No iniciado - Crear MedicalRecordForm.tsx
- [ ] No iniciado - Crear MedicalRecordFilters.tsx
- [ ] No iniciado - Crear MedicalRecordTimeline.tsx

### 6. Integracion
#### 6.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /medical-records
- [ ] No iniciado - Agregar ruta /medical-records/create
- [ ] No iniciado - Agregar ruta /medical-records/edit/:id
- [ ] No iniciado - Agregar ruta /medical-records/view/:id
- [ ] No iniciado - Agregar ruta /medical-records/patient/:patientId

#### 6.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para medicalRecordService
- [ ] No iniciado - Tests para medicalRecordFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- mr_date (DATE)
- mr_vital_signs (TEXT)
- mr_symptoms (TEXT)
- mr_diagnosis (TEXT)
- mr_treatment (TEXT)
- mr_observations (TEXT)
- mr_doctor_name (VARCHAR)
- create_at (DATETIME)
- id_older_adult (FK a older_adult)

## Notas
- Revisar medical-record.controller.ts en el backend para endpoints exactos
- Los registros medicos son independientes del historial clinico
- Necesita integracion con el modulo de adultos mayores
- Considerar permisos de usuario para CRUD
- Puede mostrar timeline de registros por paciente
