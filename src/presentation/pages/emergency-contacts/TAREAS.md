# Tareas - Contactos de Emergencia (Emergency Contacts)

## Informacion del Modulo
- **Tabla DB**: emergency_contacts
- **Controlador Backend**: Verificar en backend
- **Relaciones**: 
  - Relacionado con older_adult (pacientes)

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Tareas Especificas

### 1. Analisis de Implementacion Actual
#### 1.1 Revisar implementacion existente
- [ ] No iniciado - Verificar si existe carpeta emergency-contacts en pages
- [ ] No iniciado - Verificar si hay componentes relacionados
- [ ] No iniciado - Identificar que esta implementado y que falta

### 2. Servicios (src/services)
#### 2.1 Crear emergencyContactService.ts
- [ ] No iniciado - Crear archivo emergencyContactService.ts
- [ ] No iniciado - Implementar getAllContacts()
- [ ] No iniciado - Implementar getContactById(id)
- [ ] No iniciado - Implementar getContactsByPatient(olderAdultId)
- [ ] No iniciado - Implementar createContact(data)
- [ ] No iniciado - Implementar updateContact(id, data)
- [ ] No iniciado - Implementar deleteContact(id)
- [ ] No iniciado - Implementar searchContacts(filters)

### 3. Types (src/types)
#### 3.1 Crear emergencyContact.ts
- [ ] No iniciado - Definir interface EmergencyContact
- [ ] No iniciado - Definir interface CreateEmergencyContactData
- [ ] No iniciado - Definir interface UpdateEmergencyContactData
- [ ] No iniciado - Definir interface EmergencyContactSearchParams
- [ ] No iniciado - Definir interface EmergencyContactApiResponse
- [ ] No iniciado - Definir enums para tipos de relacion

### 4. Flows (src/infrastructure/flows)
#### 4.1 Crear emergencyContactFlow.ts
- [ ] No iniciado - Crear carpeta emergency-contact en flows
- [ ] No iniciado - Implementar getAllContacts()
- [ ] No iniciado - Implementar getContactById()
- [ ] No iniciado - Implementar getContactsByPatient()
- [ ] No iniciado - Implementar createContact()
- [ ] No iniciado - Implementar updateContact()
- [ ] No iniciado - Implementar deleteContact()
- [ ] No iniciado - Agregar validaciones de negocio

### 5. Paginas (src/presentation/pages/emergency-contacts)
#### 5.1 Crear EmergencyContactsListPage.tsx
- [ ] No iniciado - Crear componente de lista
- [ ] No iniciado - Implementar tabla de contactos
- [ ] No iniciado - Agregar filtros de busqueda
- [ ] No iniciado - Agregar paginacion
- [ ] No iniciado - Agregar acciones (ver, editar, eliminar)

#### 5.2 Crear CreateEmergencyContactPage.tsx
- [ ] No iniciado - Crear formulario de creacion
- [ ] No iniciado - Implementar selector de paciente
- [ ] No iniciado - Agregar campos de contacto
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Agregar manejo de errores

#### 5.3 Crear EditEmergencyContactPage.tsx
- [ ] No iniciado - Crear formulario de edicion
- [ ] No iniciado - Cargar datos existentes
- [ ] No iniciado - Agregar validaciones
- [ ] No iniciado - Implementar actualizacion
- [ ] No iniciado - Agregar manejo de errores

#### 5.4 Crear ViewEmergencyContactPage.tsx
- [ ] No iniciado - Crear vista de detalle
- [ ] No iniciado - Mostrar informacion completa del contacto
- [ ] No iniciado - Mostrar informacion del paciente relacionado
- [ ] No iniciado - Agregar opciones de edicion y eliminacion
- [ ] No iniciado - Agregar boton de llamada rapida

#### 5.5 Crear EmergencyContactsDashboard.tsx
- [ ] No iniciado - Crear dashboard principal
- [ ] No iniciado - Mostrar contactos por paciente
- [ ] No iniciado - Agregar busqueda rapida
- [ ] No iniciado - Agregar navegacion a otras vistas

### 6. Componentes Reutilizables
#### 6.1 Crear componentes especificos del modulo
- [ ] No iniciado - Crear EmergencyContactCard.tsx
- [ ] No iniciado - Crear EmergencyContactForm.tsx
- [ ] No iniciado - Crear EmergencyContactFilters.tsx
- [ ] No iniciado - Crear QuickContactList.tsx

### 7. Integracion
#### 7.1 Agregar rutas en App.tsx
- [ ] No iniciado - Agregar ruta /emergency-contacts
- [ ] No iniciado - Agregar ruta /emergency-contacts/create
- [ ] No iniciado - Agregar ruta /emergency-contacts/edit/:id
- [ ] No iniciado - Agregar ruta /emergency-contacts/view/:id
- [ ] No iniciado - Agregar ruta /emergency-contacts/patient/:patientId

#### 7.2 Agregar al menu principal
- [ ] No iniciado - Agregar opcion en DashboardPage
- [ ] No iniciado - Agregar icono correspondiente

#### 7.3 Integracion con modulo de adultos mayores
- [ ] No iniciado - Agregar seccion de contactos en ViewAdultsPage
- [ ] No iniciado - Permitir crear contacto desde perfil de adulto mayor

### 8. Testing
#### 8.1 Tests unitarios
- [ ] No iniciado - Tests para emergencyContactService
- [ ] No iniciado - Tests para emergencyContactFlow
- [ ] No iniciado - Tests para componentes

#### 8.2 Tests de integracion
- [ ] No iniciado - Tests E2E para flujo completo

## Campos de la Tabla DB
Segun scriptDBCompleta.sql:
- id (INT, PK, AUTO_INCREMENT)
- ec_name (VARCHAR)
- ec_relationship (VARCHAR)
- ec_phone_primary (VARCHAR)
- ec_phone_secondary (VARCHAR)
- ec_email (VARCHAR)
- ec_address (TEXT)
- ec_is_primary (BOOLEAN)
- ec_observations (TEXT)
- create_at (DATETIME)
- id_older_adult (FK a older_adult)

## Notas
- Verificar controlador exacto en el backend
- Los contactos son criticos para emergencias
- Considerar destacar contacto primario
- Integrar estrechamente con modulo de adultos mayores
- Considerar permisos de usuario para CRUD
- Puede mostrarse en el perfil del adulto mayor
