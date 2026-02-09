# Tareas - Types y Interfaces

## Estado General
- [x] Finalizado - Todos los archivos de types han sido creados, configurados y revisados correctamente

## Types Existentes
- [x] audit.ts - Completo
- [x] auth.ts - Completo
- [x] clinicalCondition.ts - Completo
- [x] entranceExit.ts - Completo
- [x] entranceExitApi.ts - Completo
- [x] formData.ts - Completo
- [x] index.ts - Completo
- [x] notifuse.ts - Completo
- [x] nursing.ts - Verificar completitud
- [x] permissionEntity.ts - Completo
- [x] permissions.ts - Completo
- [x] program.ts - Completo
- [x] roleChanges.ts - Completo
- [x] subProgram.ts - Completo
- [x] twoFactor.ts - Completo
- [x] user.ts - Completo
- [x] vaccine.ts - Completo
- [x] virtualFile.ts - Completo

## Types Faltantes

### 1. clinicalHistory.ts
- [x] Finalizado - Crear archivo clinicalHistory.ts
- [x] Finalizado - Definir interface ClinicalHistory
- [x] Finalizado - Definir interface CreateClinicalHistoryData
- [x] Finalizado - Definir interface UpdateClinicalHistoryData
- [x] Finalizado - Definir interface ClinicalHistorySearchParams
- [x] Finalizado - Definir interface ClinicalHistoryApiResponse
- [x] Finalizado - Definir constantes si es necesario

### 2. medicalRecord.ts
- [x] Finalizado - Crear archivo medicalRecord.ts
- [x] Finalizado - Definir interface MedicalRecord
- [x] Finalizado - Definir interface CreateMedicalRecordData
- [x] Finalizado - Definir interface UpdateMedicalRecordData
- [x] Finalizado - Definir interface MedicalRecordSearchParams
- [x] Finalizado - Definir interface MedicalRecordApiResponse
- [x] Finalizado - Definir constantes si es necesario

### 3. clinicalMedication.ts
- [x] Finalizado - Crear archivo clinicalMedication.ts
- [x] Finalizado - Definir interface ClinicalMedication
- [x] Finalizado - Definir interface CreateClinicalMedicationData
- [x] Finalizado - Definir interface UpdateClinicalMedicationData
- [x] Finalizado - Definir interface ClinicalMedicationSearchParams
- [x] Finalizado - Definir interface ClinicalMedicationApiResponse
- [x] Finalizado - Definir constantes para frecuencias de medicacion

### 4. specializedArea.ts
- [x] Finalizado - Crear archivo specializedArea.ts
- [x] Finalizado - Definir interface SpecializedArea
- [x] Finalizado - Definir interface CreateSpecializedAreaData
- [x] Finalizado - Definir interface UpdateSpecializedAreaData
- [x] Finalizado - Definir interface SpecializedAreaSearchParams
- [x] Finalizado - Definir interface SpecializedAreaApiResponse

### 5. specializedAppointment.ts
- [x] Finalizado - Crear archivo specializedAppointment.ts
- [x] Finalizado - Definir interface SpecializedAppointment
- [x] Finalizado - Definir interface CreateSpecializedAppointmentData
- [x] Finalizado - Definir interface UpdateSpecializedAppointmentData
- [x] Finalizado - Definir interface SpecializedAppointmentSearchParams
- [x] Finalizado - Definir interface SpecializedAppointmentApiResponse
- [x] Finalizado - Definir enum AppointmentStatus (scheduled, completed, cancelled, no show)

### 6. physiotherapy.ts
- [x] Finalizado - Crear archivo physiotherapy.ts
- [x] Finalizado - Definir interface PhysiotherapySession
- [x] Finalizado - Definir interface CreatePhysiotherapySessionData
- [x] Finalizado - Definir interface UpdatePhysiotherapySessionData
- [x] Finalizado - Definir interface PhysiotherapySessionSearchParams
- [x] Finalizado - Definir interface PhysiotherapySessionApiResponse

### 7. psychology.ts
- [x] Finalizado - Crear archivo psychology.ts
- [x] Finalizado - Definir interface PsychologySession
- [x] Finalizado - Definir interface CreatePsychologySessionData
- [x] Finalizado - Definir interface UpdatePsychologySessionData
- [x] Finalizado - Definir interface PsychologySessionSearchParams
- [x] Finalizado - Definir interface PsychologySessionApiResponse

### 8. socialWork.ts
- [x] Finalizado - Crear archivo socialWork.ts
- [x] Finalizado - Definir interface SocialWorkReport
- [x] Finalizado - Definir interface CreateSocialWorkReportData
- [x] Finalizado - Definir interface UpdateSocialWorkReportData
- [x] Finalizado - Definir interface SocialWorkReportSearchParams
- [x] Finalizado - Definir interface SocialWorkReportApiResponse

### 9. emergencyContact.ts
- [x] Finalizado - Crear archivo emergencyContact.ts
- [x] Finalizado - Definir interface EmergencyContact
- [x] Finalizado - Definir interface CreateEmergencyContactData
- [x] Finalizado - Definir interface UpdateEmergencyContactData
- [x] Finalizado - Definir interface EmergencyContactSearchParams
- [x] Finalizado - Definir interface EmergencyContactApiResponse

### 10. olderAdultUpdate.ts
- [x] Finalizado - Crear archivo olderAdultUpdate.ts
- [x] Finalizado - Definir interface OlderAdultUpdate
- [x] Finalizado - Definir interface CreateOlderAdultUpdateData
- [x] Finalizado - Definir interface UpdateOlderAdultUpdateData
- [x] Finalizado - Definir interface OlderAdultUpdateSearchParams
- [x] Finalizado - Definir interface OlderAdultUpdateApiResponse
- [ ] No iniciado - Definir enum UpdateType (status, health, accommodation, other)

### 11. olderAdultFamily.ts
- [x] Finalizado - Crear archivo olderAdultFamily.ts
- [x] Finalizado - Definir interface OlderAdultFamily
- [x] Finalizado - Definir interface CreateOlderAdultFamilyData
- [x] Finalizado - Definir interface UpdateOlderAdultFamilyData
- [x] Finalizado - Definir interface OlderAdultFamilySearchParams
- [x] Finalizado - Definir interface OlderAdultFamilyApiResponse
- [x] Finalizado - Definir enum KinshipType (son, daughter, grandson, etc)

## Próximas Prioridades de Mejora

### Prioridad Alta: Reemplazar `any` con tipos específicos
- [ ] Reemplazar `any` en flows de infraestructura (audit, auth, clinical-*, etc.)
- [ ] Reemplazar `any` en servicios (clinicalConditionService, entranceExitService, etc.)
- [ ] Reemplazar `any` en types (auth.ts, olderAdultUpdate.ts, virtualFile.ts)
- [ ] Reemplazar `any` en componentes de presentación

### Prioridad Media: Limpiar variables no utilizadas
- [ ] Remover parámetros de funciones no utilizados
- [ ] Remover variables declaradas pero no utilizadas
- [ ] Remover imports no utilizados
- [ ] Limpiar código dead code

### Prioridad Baja: Corregir warnings de React hooks
- [ ] Agregar dependencias faltantes en useEffect
- [ ] Corregir reglas de fast refresh violadas
- [ ] Optimizar hooks de React para mejores prácticas

## Estructura General de Types

Cada archivo de types debe seguir esta estructura:
```typescript
// Interface principal de la entidad
export interface [EntityName] {
  id: number;
  // ... campos de la DB
  create_at?: string;
}

// Interface para crear nueva entidad
export interface Create[EntityName]Data {
  // ... campos requeridos sin id
}

// Interface para actualizar entidad
export interface Update[EntityName]Data {
  // ... campos opcionales
}

// Interface para parametros de busqueda
export interface [EntityName]SearchParams {
  // ... campos de filtro
}

// Interface para respuesta de API
export interface [EntityName]ApiResponse {
  data: [EntityName][];
  total: number;
  page: number;
  limit: number;
}

// Enums si son necesarios
export enum [EnumName] {
  VALUE1 = 'value1',
  VALUE2 = 'value2',
}

// Constantes por defecto si son necesarias
export const default[EntityName]: Create[EntityName]Data = {
  // ... valores por defecto
};
```

## Notas
- Seguir convenciones de nombres del proyecto
- Usar nombres de campos consistentes con el backend
- Documentar interfaces complejas
- Exportar todos los tipos en index.ts
- Mantener sincronizacion con schema de DB
