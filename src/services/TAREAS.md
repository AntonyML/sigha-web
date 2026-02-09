# Tareas - Servicios del Frontend

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

## Servicios Existentes
- [x] auditService.ts - Completo
- [x] authService.ts - Completo
- [x] clinicalConditionService.ts - Completo
- [x] entranceExitService.ts - Completo
- [x] notifuseService.ts - Completo
- [x] nursingService.ts - Verificar completitud
- [x] permissionEntityService.ts - Completo
- [x] permissionService.ts - Completo
- [x] profileService.ts - Completo
- [x] programService.ts - Completo
- [x] roleChangesService.ts - Completo
- [x] roleService.ts - Completo
- [x] subProgramService.ts - Completo
- [x] twoFactorService.ts - Completo
- [x] userManagementService.ts - Completo
- [x] vaccineService.ts - Completo
- [x] virtualFileService.ts - Completo

## Servicios Faltantes

### 1. clinicalHistoryService.ts
- [ ] No iniciado - Crear servicio para historial clinico
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar gestion de condiciones clinicas
- [ ] No iniciado - Implementar gestion de vacunas

### 2. medicalRecordService.ts
- [ ] No iniciado - Crear servicio para registros medicos
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por paciente
- [ ] No iniciado - Implementar filtros avanzados

### 3. clinicalMedicationService.ts
- [ ] No iniciado - Crear servicio para medicamentos clinicos
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por historial
- [ ] No iniciado - Implementar filtros de medicamentos

### 4. specializedAreaService.ts
- [ ] No iniciado - Crear servicio para areas especializadas
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar activacion/desactivacion

### 5. specializedAppointmentService.ts
- [ ] No iniciado - Crear servicio para citas especializadas
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar cambio de estado (cancelar, completar)
- [ ] No iniciado - Implementar busqueda por area
- [ ] No iniciado - Implementar busqueda por paciente

### 6. physiotherapyService.ts
- [ ] No iniciado - Crear servicio para sesiones de fisioterapia
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por paciente
- [ ] No iniciado - Implementar estadisticas

### 7. psychologyService.ts
- [ ] No iniciado - Crear servicio para sesiones de psicologia
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por paciente
- [ ] No iniciado - Implementar estadisticas

### 8. socialWorkService.ts
- [ ] No iniciado - Crear servicio para reportes de trabajo social
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por paciente
- [ ] No iniciado - Implementar filtros de visitas domiciliarias

### 9. emergencyContactService.ts
- [ ] No iniciado - Crear servicio para contactos de emergencia
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por paciente
- [ ] No iniciado - Implementar gestion de contacto primario

### 10. olderAdultUpdateService.ts
- [ ] No iniciado - Crear servicio para actualizaciones de adultos mayores
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por paciente
- [ ] No iniciado - Implementar filtros por tipo de actualizacion

### 11. olderAdultFamilyService.ts
- [ ] No iniciado - Crear servicio para familiares de adultos mayores
- [ ] No iniciado - Implementar operaciones CRUD
- [ ] No iniciado - Implementar busqueda por paciente
- [ ] No iniciado - Implementar filtros por parentesco

## Tareas de Revision

### 1. Revisar nursingService.ts
- [ ] No iniciado - Verificar que endpoints implementados
- [ ] No iniciado - Verificar que metodos estan completos
- [ ] No iniciado - Agregar metodos faltantes si es necesario
- [ ] No iniciado - Documentar metodos

## Estructura General de Servicios

Cada servicio debe seguir esta estructura:
```typescript
import axios from 'axios';
import { config } from '../config/app.config';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para auth token

export const [moduleName]Service = {
  getAll: async () => {...},
  getById: async (id: number) => {...},
  create: async (data: Create[ModuleName]Data) => {...},
  update: async (id: number, data: Update[ModuleName]Data) => {...},
  delete: async (id: number) => {...},
  search: async (filters: [ModuleName]SearchParams) => {...},
};
```

## Notas
- Todos los servicios deben usar axios para llamadas HTTP
- Configurar interceptors para agregar token de autenticacion
- Manejar errores de forma consistente
- Usar tipos TypeScript para requests y responses
- Verificar endpoints en backend antes de implementar
