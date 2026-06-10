# Tareas - Historial Clinico (Clinical History)

## Informacion del Modulo
- **Tabla DB**: clinical_history
- **Controlador Backend**: nursing.controller.ts
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)
  - Relacionado con clinical_conditions (tabla pivot: clinical_history_and_conditions)
  - Relacionado con vaccines (tabla pivot: vaccines_and_clinical_history)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear clinicalHistoryService.ts
- [ ] No iniciado - Crear archivo clinicalHistoryService.ts
- [ ] No iniciado - Implementar getClinicalHistory(olderAdultId)
- [ ] No iniciado - Implementar getClinicalHistoryById(id)
- [ ] No iniciado - Implementar createClinicalHistory(data)
- [ ] No iniciado - Implementar updateClinicalHistory(id, data)
- [ ] No iniciado - Implementar deleteClinicalHistory(id)
- [ ] No iniciado - Implementar addConditionToHistory(historyId, conditionId)
- [ ] No iniciado - Implementar removeConditionFromHistory(historyId, conditionId)
- [ ] No iniciado - Implementar addVaccineToHistory(historyId, vaccineId)
- [ ] No iniciado - Implementar removeVaccineFromHistory(historyId, vaccineId)

### 2. Types (src/types)
#### 2.1 Crear clinicalHistory.ts
- [ ] No iniciado - Definir interface ClinicalHistory
- [ ] No iniciado - Definir interface CreateClinicalHistoryData
- [ ] No iniciado - Definir interface UpdateClinicalHistoryData
- [ ] No iniciado - Definir interface ClinicalHistorySearchParams
- [ ] No iniciado - Definir interface ClinicalHistoryApiResponse

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear clinicalHistoryFlow.ts
- [ ] No iniciado - Crear carpeta clinical-history en flows
- [ ] No iniciado - Implementar getClinicalHistory()
- [ ] No iniciado - Implementar getClinicalHistoryById()
- [ ] No iniciado - Implementar createClinicalHistory()
- [ ] No iniciado - Implementar updateClinicalHistory()
- [ ] No iniciado - Implementar deleteClinicalHistory()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/clinical-history)
#### 4.1 Crear ClinicalHistoryListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de historiales clinicos
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 4.2 Crear CreateClinicalHistoryPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Implementar selector de condiciones clinicas
- [ ] No iniciado - Implementar selector de vacunas
- [ ] No iniciado - Agregar manejo de errores

#### 4.3 Crear EditClinicalHistoryPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewClinicalHistoryPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion del historial
- [ ] No iniciado - Mostrar condiciones clinicas asociadas
- [ ] No iniciado - Mostrar vacunas asociadas
- [ ] No iniciado - Agregar opciones de edicion y eliminacion

#### 4.5 Crear ClinicalHistoryDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar navegacion a otras vistas

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear ClinicalHistoryCard.tsx
- [ ] No iniciado - Crear ClinicalHistoryForm.tsx
- [ ] No iniciado - Crear ClinicalHistoryFilters.tsx

### 6. Integracion
#### 6.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /clinical-history
- [ ] No iniciado - Agregar ruta /clinical-history/create
- [ ] No iniciado - Agregar ruta /clinical-history/edit/:id
- [ ] No iniciado - Agregar ruta /clinical-history/view/:id

#### 6.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para clinicalHistoryService
- [ ] No iniciado - Tests para clinicalHistoryFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- ch_date (DATE)
- ch_reason (VARCHAR)
- ch_physical_exam (TEXT)
- ch_diagnosis (TEXT)
- ch_treatment (TEXT)
- ch_observations (TEXT)
- ch_doctor_name (VARCHAR)
- ch_next_appointment (DATE)
- create_at (DATETIME)
- id_older_adult (FK a older_adult)

## Notas
- Revisar nursing.controller.ts en el backend para endpoints exactos
- El historial clinico esta relacionado con condiciones clinicas y vacunas
- Necesita integracion con el modulo de adultos mayores
- Considerar permisos de usuario para CRUD
