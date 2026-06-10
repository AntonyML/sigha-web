# Tareas - Familia de Adultos Mayores (Older Adult Family)

## Informacion del Modulo
- **Tabla DB**: older_adult_family
- **Controlador Backend**: Verificar en backend
- **Relaciones**: 
  - Puede relacionarse con older_adult (aunque no hay FK explicita en schema)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Analisis de Implementacion Actual
#### 1.1 Revisar implementacion existente
- [ ] No iniciado - Verificar si existe servicio o componentes relacionados
- [ ] No iniciado - Identificar que esta implementado y que falta
- [ ] No iniciado - Revisar schema DB para entender relaciones

### 2. Servicios (src/services)
#### 2.1 Crear olderAdultFamilyService.ts
- [ ] No iniciado - Crear archivo olderAdultFamilyService.ts
- [ ] No iniciado - Implementar getAllFamilyMembers()
- [ ] No iniciado - Implementar getFamilyMemberById(id)
- [ ] No iniciado - Implementar getFamilyMembersByPatient(olderAdultId)
- [ ] No iniciado - Implementar createFamilyMember(data)
- [ ] No iniciado - Implementar updateFamilyMember(id, data)
- [ ] No iniciado - Implementar deleteFamilyMember(id)
- [ ] No iniciado - Implementar searchFamilyMembers(filters)

### 3. Types (src/types)
#### 3.1 Crear olderAdultFamily.ts
- [ ] No iniciado - Definir interface OlderAdultFamily
- [ ] No iniciado - Definir interface CreateOlderAdultFamilyData
- [ ] No iniciado - Definir interface UpdateOlderAdultFamilyData
- [ ] No iniciado - Definir interface OlderAdultFamilySearchParams
- [ ] No iniciado - Definir interface OlderAdultFamilyApiResponse
- [ ] No iniciado - Definir enum KinshipType con valores del DB

### 4. Flows (src/infrastructure/flows)
#### 4.1 Crear olderAdultFamilyFlow.ts
- [ ] No iniciado - Crear carpeta older-adult-family en flows
- [ ] No iniciado - Implementar getAllFamilyMembers()
- [ ] No iniciado - Implementar getFamilyMemberById()
- [ ] No iniciado - Implementar getFamilyMembersByPatient()
- [ ] No iniciado - Implementar createFamilyMember()
- [ ] No iniciado - Implementar updateFamilyMember()
- [ ] No iniciado - Implementar deleteFamilyMember()
- [ ] No iniciado - Agregar validaciones de negocio

### 5. Paginas (src/presentation/pages/older-adult-family)
#### 5.1 Crear FamilyMembersListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de familiares
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 5.2 Crear CreateFamilyMemberPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Implementar campos de familiar
- [ ] No iniciado - Implementar selector de parentesco
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Agregar manejo de errores

#### 5.3 Crear EditFamilyMemberPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 5.4 Crear ViewFamilyMemberPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa del familiar
- [ ] No iniciado - Mostrar pacientes relacionados
- [ ] No iniciado - Agregar opciones de edicion y eliminacion

#### 5.5 Crear FamilyMembersDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Mostrar estadisticas de familiares
- [ ] No iniciado - Agregar busqueda rapida
- [ ] No iniciado - Agregar navegacion a otras vistas

### 6. Componentes Reutilizables
#### 6.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear FamilyMemberCard.tsx
- [ ] No iniciado - Crear FamilyMemberForm.tsx
- [ ] No iniciado - Crear FamilyMemberFilters.tsx
- [ ] No iniciado - Crear KinshipBadge.tsx

### 7. Integracion
#### 7.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /family-members
- [ ] No iniciado - Agregar ruta /family-members/create
- [ ] No iniciado - Agregar ruta /family-members/edit/:id
- [ ] No iniciado - Agregar ruta /family-members/view/:id

#### 7.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

#### 7.3 Integracion con modulo de adultos mayores
- [ ] No iniciado - Agregar seccion de familiares en CreateVirtualRecordPage
- [ ] No iniciado - Agregar seccion de familiares en ViewAdultsPage
- [ ] No iniciado - Permitir vincular familiar a adulto mayor

### 8. Testing
#### 8.1 Tests unitarios
- [ ] No iniciado - Tests para olderAdultFamilyService
- [ ] No iniciado - Tests para olderAdultFamilyFlow
- [ ] No iniciado - Tests para componentes

#### 8.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- pf_identification (VARCHAR) - Cedula del familiar
- pf_name (VARCHAR)
- pf_f_last_name (VARCHAR) - Primer apellido
- pf_s_last_name (VARCHAR) - Segundo apellido
- pf_phone_number (VARCHAR)
- pf_email (VARCHAR)
- pf_kinship (ENUM) - Parentesco: son, daughter, grandson, granddaughter, brother, sister, nephew, niece, husband, wife, legal guardian, other, not specified
- create_at (DATETIME)

## Notas Importantes
- La tabla NO tiene FK directa a older_adult en el schema
- Verificar en backend como se relaciona con adultos mayores
- Puede ser una tabla independiente de familiares que se vincula en otra parte
- Verificar si existe tabla intermedia para relacion many-to-many
- Los familiares pueden estar asociados a multiples adultos mayores
- Considerar permisos de usuario para CRUD
- Integrar con modulo de adultos mayores
- Considerar si esto es diferente a emergency_contacts
