# Tareas - Reportes de Trabajo Social (Social Work Reports)

## Informacion del Modulo
- **Tabla DB**: social_work_reports
- **Controlador Backend**: social-work.controller.ts
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear socialWorkService.ts
- [ ] No iniciado - Crear archivo socialWorkService.ts
- [ ] No iniciado - Implementar getAllReports()
- [ ] No iniciado - Implementar getReportById(id)
- [ ] No iniciado - Implementar getReportsByPatient(olderAdultId)
- [ ] No iniciado - Implementar createReport(data)
- [ ] No iniciado - Implementar updateReport(id, data)
- [ ] No iniciado - Implementar deleteReport(id)
- [ ] No iniciado - Implementar searchReports(filters)

### 2. Types (src/types)
#### 2.1 Crear socialWork.ts
- [ ] No iniciado - Definir interface SocialWorkReport
- [ ] No iniciado - Definir interface CreateSocialWorkReportData
- [ ] No iniciado - Definir interface UpdateSocialWorkReportData
- [ ] No iniciado - Definir interface SocialWorkReportSearchParams
- [ ] No iniciado - Definir interface SocialWorkReportApiResponse

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear socialWorkFlow.ts
- [ ] No iniciado - Crear carpeta social-work en flows
- [ ] No iniciado - Implementar getAllReports()
- [ ] No iniciado - Implementar getReportById()
- [ ] No iniciado - Implementar getReportsByPatient()
- [ ] No iniciado - Implementar createReport()
- [ ] No iniciado - Implementar updateReport()
- [ ] No iniciado - Implementar deleteReport()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/social-work)
#### 4.1 Crear SocialWorkListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de reportes
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 4.2 Crear CreateSocialWorkReportPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Agregar campos de reporte
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Agregar manejo de errores

#### 4.3 Crear EditSocialWorkReportPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewSocialWorkReportPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa del reporte
- [ ] No iniciado - Mostrar informacion del paciente
- [ ] No iniciado - Agregar opciones de edicion y eliminacion
- [ ] No iniciado - Agregar opcion de imprimir reporte

#### 4.5 Crear SocialWorkDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Mostrar reportes recientes
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar navegacion a otras vistas

#### 4.6 Crear PatientSocialWorkHistory.tsx
- [ ] No iniciado - Crear vista de historial por paciente
- [ ] No iniciado - Mostrar timeline de reportes
- [ ] No iniciado - Agregar filtros temporales
- [ ] No iniciado - Permitir exportar historial

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear SocialWorkReportCard.tsx
- [ ] No iniciado - Crear SocialWorkReportForm.tsx
- [ ] No iniciado - Crear SocialWorkReportFilters.tsx
- [ ] No iniciado - Crear SocialWorkTimeline.tsx

### 6. Integracion
#### 6.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /social-work
- [ ] No iniciado - Agregar ruta /social-work/create
- [ ] No iniciado - Agregar ruta /social-work/edit/:id
- [ ] No iniciado - Agregar ruta /social-work/view/:id
- [ ] No iniciado - Agregar ruta /social-work/patient/:patientId

#### 6.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para socialWorkService
- [ ] No iniciado - Tests para socialWorkFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- swr_date (DATE)
- swr_home_visit (BOOLEAN)
- swr_family_situation (TEXT)
- swr_economic_situation (TEXT)
- swr_social_support (TEXT)
- swr_needs_identified (TEXT)
- swr_interventions_performed (TEXT)
- swr_recommendations (TEXT)
- swr_observations (TEXT)
- swr_social_worker_name (VARCHAR)
- create_at (DATETIME)
- id_older_adult (FK a older_adult)

## Notas
- Revisar social-work.controller.ts en el backend para endpoints exactos
- Los reportes son importantes para seguimiento social del paciente
- Considerar mostrar historial de visitas domiciliarias
- Considerar permisos de usuario (solo trabajadores sociales y admins)
- Integrar con el modulo de adultos mayores
- Considerar generar reportes en PDF
