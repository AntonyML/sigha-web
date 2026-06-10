# Tareas - Areas Especializadas (Specialized Areas)

## Informacion del Modulo
- **Tabla DB**: specialized_area
- **Controlador Backend**: Verificar en backend
- **Relaciones**: 
  - Relacionado con specialized_appointment

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Servicios (src/services)
#### 1.1 Crear specializedAreaService.ts
- [ ] No iniciado - Crear archivo specializedAreaService.ts
- [ ] No iniciado - Implementar getAllAreas()
- [ ] No iniciado - Implementar getAreaById(id)
- [ ] No iniciado - Implementar createArea(data)
- [ ] No iniciado - Implementar updateArea(id, data)
- [ ] No iniciado - Implementar deleteArea(id)
- [ ] No iniciado - Implementar searchAreas(filters)

### 2. Types (src/types)
#### 2.1 Crear specializedArea.ts
- [ ] No iniciado - Definir interface SpecializedArea
- [ ] No iniciado - Definir interface CreateSpecializedAreaData
- [ ] No iniciado - Definir interface UpdateSpecializedAreaData
- [ ] No iniciado - Definir interface SpecializedAreaSearchParams
- [ ] No iniciado - Definir interface SpecializedAreaApiResponse

### 3. Flows (src/infrastructure/flows)
#### 3.1 Crear specializedAreaFlow.ts
- [ ] No iniciado - Crear carpeta specialized-area en flows
- [ ] No iniciado - Implementar getAllAreas()
- [ ] No iniciado - Implementar getAreaById()
- [ ] No iniciado - Implementar createArea()
- [ ] No iniciado - Implementar updateArea()
- [ ] No iniciado - Implementar deleteArea()
- [ ] No iniciado - Agregar validaciones de negocio

### 4. Paginas (src/presentation/pages/specialized-areas)
#### 4.1 Verificar y completar SpecializedAreasListPage.tsx
- [ ] No iniciado - Verificar si existe el componente de lista
- [ ] No iniciado - Implementar/actualizar tabla de areas
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 4.2 Crear CreateSpecializedAreaPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar campos del area
- [ ] No iniciado - Agregar manejo de errores

#### 4.3 Crear EditSpecializedAreaPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 4.4 Crear ViewSpecializedAreaPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion del area
- [ ] No iniciado - Mostrar citas relacionadas
- [ ] No iniciado - Agregar opciones de edicion y eliminacion

#### 4.5 Verificar SpecializedAreasDashboard.tsx
- [ ] No iniciado - Verificar si existe dashboard
- [ ] No iniciado - Agregar estadisticas
- [ ] No iniciado - Agregar navegacion a otras vistas

### 5. Componentes Reutilizables
#### 5.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear AreaCard.tsx
- [ ] No iniciado - Crear AreaForm.tsx
- [ ] No iniciado - Crear AreaFilters.tsx

### 6. Integracion
#### 6.1 Verificar rutas en App.tsx
- [ ] No iniciado - Verificar ruta /specialized-areas
- [ ] No iniciado - Agregar ruta /specialized-areas/create
- [ ] No iniciado - Agregar ruta /specialized-areas/edit/:id
- [ ] No iniciado - Agregar ruta /specialized-areas/view/:id

#### 6.2 Verificar menu principal
- [ ] No iniciado - Verificar opcion en DashboardPage
- [ ] No iniciado - Verificar icono correspondiente

### 7. Testing
#### 7.1 Tests unitarios
- [ ] No iniciado - Tests para specializedAreaService
- [ ] No iniciado - Tests para specializedAreaFlow
- [ ] No iniciado - Tests para componentes

#### 7.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- sa_name (VARCHAR)
- sa_description (TEXT)
- sa_is_active (BOOLEAN)
- create_at (DATETIME)

## Notas
- Verificar si ya existe implementacion parcial en specialized-areas
- Las areas especializadas se usan para las citas especializadas
- Considerar permisos de usuario para CRUD
- Solo administradores deberian poder gestionar areas
