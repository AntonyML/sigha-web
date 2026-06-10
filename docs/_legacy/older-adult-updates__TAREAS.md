# Tareas - Actualizaciones de Adultos Mayores (Older Adult Updates)

## Informacion del Modulo
- **Tabla DB**: older_adult_updates
- **Controlador Backend**: Verificar en backend
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)
  - Relacionado con users (usuario que hace la actualizacion)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Analisis de Implementacion Actual
#### 1.1 Revisar implementacion existente
- [ ] No iniciado - Verificar si existe carpeta older-adult-updates en pages
- [ ] No iniciado - Verificar si hay componentes relacionados
- [ ] No iniciado - Identificar que esta implementado y que falta

### 2. Servicios (src/services)
#### 2.1 Crear olderAdultUpdateService.ts
- [ ] No iniciado - Crear archivo olderAdultUpdateService.ts
- [ ] No iniciado - Implementar getAllUpdates()
- [ ] No iniciado - Implementar getUpdateById(id)
- [ ] No iniciado - Implementar getUpdatesByPatient(olderAdultId)
- [ ] No iniciado - Implementar createUpdate(data)
- [ ] No iniciado - Implementar updateUpdate(id, data)
- [ ] No iniciado - Implementar deleteUpdate(id)
- [ ] No iniciado - Implementar searchUpdates(filters)

### 3. Types (src/types)
#### 3.1 Crear olderAdultUpdate.ts
- [ ] No iniciado - Definir interface OlderAdultUpdate
- [ ] No iniciado - Definir interface CreateOlderAdultUpdateData
- [ ] No iniciado - Definir interface UpdateOlderAdultUpdateData
- [ ] No iniciado - Definir interface OlderAdultUpdateSearchParams
- [ ] No iniciado - Definir interface OlderAdultUpdateApiResponse

### 4. Flows (src/infrastructure/flows)
#### 4.1 Crear olderAdultUpdateFlow.ts
- [ ] No iniciado - Crear carpeta older-adult-update en flows
- [ ] No iniciado - Implementar getAllUpdates()
- [ ] No iniciado - Implementar getUpdateById()
- [ ] No iniciado - Implementar getUpdatesByPatient()
- [ ] No iniciado - Implementar createUpdate()
- [ ] No iniciado - Implementar updateUpdate()
- [ ] No iniciado - Implementar deleteUpdate()
- [ ] No iniciado - Agregar validaciones de negocio

### 5. Paginas (src/presentation/pages/older-adult-updates)
#### 5.1 Crear UpdatesListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de actualizaciones
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 5.2 Crear CreateUpdatePage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Agregar campos de actualizacion
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Agregar manejo de errores

#### 5.3 Crear EditUpdatePage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 5.4 Crear ViewUpdatePage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa de la actualizacion
- [ ] No iniciado - Mostrar informacion del paciente
- [ ] No iniciado - Mostrar quien hizo la actualizacion
- [ ] No iniciado - Agregar opciones de edicion y eliminacion

#### 5.5 Crear UpdatesDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Mostrar actualizaciones recientes
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar navegacion a otras vistas

#### 5.6 Crear PatientUpdatesHistory.tsx
- [ ] No iniciado - Crear vista de historial por paciente
- [ ] No iniciado - Mostrar timeline de actualizaciones
- [ ] No iniciado - Agregar filtros temporales
- [ ] No iniciado - Permitir exportar historial

### 6. Componentes Reutilizables
#### 6.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear UpdateCard.tsx
- [ ] No iniciado - Crear UpdateForm.tsx
- [ ] No iniciado - Crear UpdateFilters.tsx
- [ ] No iniciado - Crear UpdateTimeline.tsx

### 7. Integracion
#### 7.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /older-adult-updates
- [ ] No iniciado - Agregar ruta /older-adult-updates/create
- [ ] No iniciado - Agregar ruta /older-adult-updates/edit/:id
- [ ] No iniciado - Agregar ruta /older-adult-updates/view/:id
- [ ] No iniciado - Agregar ruta /older-adult-updates/patient/:patientId

#### 7.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

#### 7.3 Integracion con modulo de adultos mayores
- [ ] No iniciado - Agregar seccion de actualizaciones en ViewAdultsPage
- [ ] No iniciado - Permitir crear actualizacion desde perfil de adulto mayor
- [ ] No iniciado - Mostrar ultima actualizacion en lista de adultos mayores

### 8. Testing
#### 8.1 Tests unitarios
- [ ] No iniciado - Tests para olderAdultUpdateService
- [ ] No iniciado - Tests para olderAdultUpdateFlow
- [ ] No iniciado - Tests para componentes

#### 8.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- oau_update_type (ENUM: 'status', 'health', 'accommodation', 'other')
- oau_description (TEXT)
- oau_previous_value (TEXT)
- oau_new_value (TEXT)
- oau_observations (TEXT)
- update_at (DATETIME)
- id_older_adult (FK a older_adult)
- id_user (FK a users) - quien hizo la actualizacion

## Notas
- Verificar controlador exacto en el backend
- Las actualizaciones son importantes para seguimiento de cambios
- Registra quien hizo cada actualizacion
- Tipos de actualizacion: status, health, accommodation, other
- Guardar valor anterior y nuevo valor
- Integrar estrechamente con modulo de adultos mayores
- Considerar permisos de usuario para CRUD
- Mostrar timeline de cambios en perfil del paciente
