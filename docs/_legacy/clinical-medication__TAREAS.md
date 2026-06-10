# Tareas - Medicamentos Clinicos (Clinical Medication)

## Informacion del Modulo
- **Tabla DB**: clinical_medication
- **Controlador Backend**: nursing.controller.ts (posiblemente)
- **Relaciones**: 
  - Relacionado con clinical_history

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear clinicalMedicationService.ts
- [ ] No iniciado - Crear archivo clinicalMedicationService.ts
- [ ] No iniciado - Implementar getAllMedications()
- [ ] No iniciado - Implementar getMedicationById(id)
- [ ] No iniciado - Implementar getMedicationsByHistory(historyId)
- [ ] No iniciado - Implementar createMedication(data)
- [ ] No iniciado - Implementar updateMedication(id, data)
- [ ] No iniciado - Implementar deleteMedication(id)
- [ ] No iniciado - Implementar searchMedications(filters)

### 2. Types (src/types)
#### 2.1 Crear clinicalMedication.ts
- [ ] No iniciado - Definir interface ClinicalMedication
- [ ] No iniciado - Definir interface CreateClinicalMedicationData
- [ ] No iniciado - Definir interface UpdateClinicalMedicationData
- [ ] No iniciado - Definir interface ClinicalMedicationSearchParams
- [ ] No iniciado - Definir interface ClinicalMedicationApiResponse

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear clinicalMedicationFlow.ts
- [ ] No iniciado - Crear carpeta clinical-medication en flows
- [ ] No iniciado - Implementar getAllMedications()
- [ ] No iniciado - Implementar getMedicationById()
- [ ] No iniciado - Implementar getMedicationsByHistory()
- [ ] No iniciado - Implementar createMedication()
- [ ] No iniciado - Implementar updateMedication()
- [ ] No iniciado - Implementar deleteMedication()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/clinical-medication)
#### 4.1 Crear ClinicalMedicationListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de medicamentos
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 4.2 Crear CreateClinicalMedicationPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar campos de medicamento
- [ ] No iniciado - Implementar campos de dosis y frecuencia
- [ ] No iniciado - Agregar manejo de errores

#### 4.3 Crear EditClinicalMedicationPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewClinicalMedicationPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa del medicamento
- [ ] No iniciado - Agregar opciones de edicion y eliminacion

#### 4.5 Crear ClinicalMedicationDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar navegacion a otras vistas

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear MedicationCard.tsx
- [ ] No iniciado - Crear MedicationForm.tsx
- [ ] No iniciado - Crear MedicationFilters.tsx
- [ ] No iniciado - Crear MedicationSchedule.tsx

### 6. Integracion
#### 6.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /clinical-medication
- [ ] No iniciado - Agregar ruta /clinical-medication/create
- [ ] No iniciado - Agregar ruta /clinical-medication/edit/:id
- [ ] No iniciado - Agregar ruta /clinical-medication/view/:id

#### 6.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para clinicalMedicationService
- [ ] No iniciado - Tests para clinicalMedicationFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- cm_medication_name (VARCHAR)
- cm_dosage (VARCHAR)
- cm_frequency (VARCHAR)
- cm_start_date (DATE)
- cm_end_date (DATE)
- cm_observations (TEXT)
- create_at (DATETIME)
- id_clinical_history (FK a clinical_history)

## Notas
- Verificar controlador exacto en el backend
- Los medicamentos estan relacionados con el historial clinico
- Necesita integracion con el modulo de historial clinico
- Considerar alertas para fechas de fin de medicacion
- Considerar permisos de usuario para CRUD
