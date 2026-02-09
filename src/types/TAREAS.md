# Tareas - Types y Interfaces

## Estado General
- [ ] No iniciado
- [ ] En progreso
- [ ] Finalizado

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
- [ ] No iniciado - Crear archivo clinicalHistory.ts
- [ ] No iniciado - Definir interface ClinicalHistory
- [ ] No iniciado - Definir interface CreateClinicalHistoryData
- [ ] No iniciado - Definir interface UpdateClinicalHistoryData
- [ ] No iniciado - Definir interface ClinicalHistorySearchParams
- [ ] No iniciado - Definir interface ClinicalHistoryApiResponse
- [ ] No iniciado - Definir constantes si es necesario

### 2. medicalRecord.ts
- [ ] No iniciado - Crear archivo medicalRecord.ts
- [ ] No iniciado - Definir interface MedicalRecord
- [ ] No iniciado - Definir interface CreateMedicalRecordData
- [ ] No iniciado - Definir interface UpdateMedicalRecordData
- [ ] No iniciado - Definir interface MedicalRecordSearchParams
- [ ] No iniciado - Definir interface MedicalRecordApiResponse
- [ ] No iniciado - Definir constantes si es necesario

### 3. clinicalMedication.ts
- [ ] No iniciado - Crear archivo clinicalMedication.ts
- [ ] No iniciado - Definir interface ClinicalMedication
- [ ] No iniciado - Definir interface CreateClinicalMedicationData
- [ ] No iniciado - Definir interface UpdateClinicalMedicationData
- [ ] No iniciado - Definir interface ClinicalMedicationSearchParams
- [ ] No iniciado - Definir interface ClinicalMedicationApiResponse
- [ ] No iniciado - Definir constantes para frecuencias de medicacion

### 4. specializedArea.ts
- [ ] No iniciado - Crear archivo specializedArea.ts
- [ ] No iniciado - Definir interface SpecializedArea
- [ ] No iniciado - Definir interface CreateSpecializedAreaData
- [ ] No iniciado - Definir interface UpdateSpecializedAreaData
- [ ] No iniciado - Definir interface SpecializedAreaSearchParams
- [ ] No iniciado - Definir interface SpecializedAreaApiResponse

### 5. specializedAppointment.ts
- [ ] No iniciado - Crear archivo specializedAppointment.ts
- [ ] No iniciado - Definir interface SpecializedAppointment
- [ ] No iniciado - Definir interface CreateSpecializedAppointmentData
- [ ] No iniciado - Definir interface UpdateSpecializedAppointmentData
- [ ] No iniciado - Definir interface SpecializedAppointmentSearchParams
- [ ] No iniciado - Definir interface SpecializedAppointmentApiResponse
- [ ] No iniciado - Definir enum AppointmentStatus (scheduled, completed, cancelled, no show)

### 6. physiotherapy.ts
- [ ] No iniciado - Crear archivo physiotherapy.ts
- [ ] No iniciado - Definir interface PhysiotherapySession
- [ ] No iniciado - Definir interface CreatePhysiotherapySessionData
- [ ] No iniciado - Definir interface UpdatePhysiotherapySessionData
- [ ] No iniciado - Definir interface PhysiotherapySessionSearchParams
- [ ] No iniciado - Definir interface PhysiotherapySessionApiResponse

### 7. psychology.ts
- [ ] No iniciado - Crear archivo psychology.ts
- [ ] No iniciado - Definir interface PsychologySession
- [ ] No iniciado - Definir interface CreatePsychologySessionData
- [ ] No iniciado - Definir interface UpdatePsychologySessionData
- [ ] No iniciado - Definir interface PsychologySessionSearchParams
- [ ] No iniciado - Definir interface PsychologySessionApiResponse

### 8. socialWork.ts
- [ ] No iniciado - Crear archivo socialWork.ts
- [ ] No iniciado - Definir interface SocialWorkReport
- [ ] No iniciado - Definir interface CreateSocialWorkReportData
- [ ] No iniciado - Definir interface UpdateSocialWorkReportData
- [ ] No iniciado - Definir interface SocialWorkReportSearchParams
- [ ] No iniciado - Definir interface SocialWorkReportApiResponse

### 9. emergencyContact.ts
- [ ] No iniciado - Crear archivo emergencyContact.ts
- [ ] No iniciado - Definir interface EmergencyContact
- [ ] No iniciado - Definir interface CreateEmergencyContactData
- [ ] No iniciado - Definir interface UpdateEmergencyContactData
- [ ] No iniciado - Definir interface EmergencyContactSearchParams
- [ ] No iniciado - Definir interface EmergencyContactApiResponse

### 10. olderAdultUpdate.ts
- [ ] No iniciado - Crear archivo olderAdultUpdate.ts
- [ ] No iniciado - Definir interface OlderAdultUpdate
- [ ] No iniciado - Definir interface CreateOlderAdultUpdateData
- [ ] No iniciado - Definir interface UpdateOlderAdultUpdateData
- [ ] No iniciado - Definir interface OlderAdultUpdateSearchParams
- [ ] No iniciado - Definir interface OlderAdultUpdateApiResponse
- [ ] No iniciado - Definir enum UpdateType (status, health, accommodation, other)

### 11. olderAdultFamily.ts
- [ ] No iniciado - Crear archivo olderAdultFamily.ts
- [ ] No iniciado - Definir interface OlderAdultFamily
- [ ] No iniciado - Definir interface CreateOlderAdultFamilyData
- [ ] No iniciado - Definir interface UpdateOlderAdultFamilyData
- [ ] No iniciado - Definir interface OlderAdultFamilySearchParams
- [ ] No iniciado - Definir interface OlderAdultFamilyApiResponse
- [ ] No iniciado - Definir enum KinshipType (son, daughter, grandson, etc)

## Tareas de Revision

### 1. Revisar nursing.ts
- [ ] No iniciado - Verificar interfaces completas
- [ ] No iniciado - Agregar tipos faltantes si es necesario
- [ ] No iniciado - Documentar interfaces

### 2. Actualizar index.ts
- [ ] No iniciado - Exportar todos los nuevos tipos
- [ ] No iniciado - Mantener organizacion alfabetica

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
