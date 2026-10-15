
export * from '@/shared/types/auth';

export * from '@/shared/types/twoFactor';

export * from '@/shared/types/user';

export * from '@/shared/types/virtualFile';

export * from '@/shared/types/formData';

export * from '@/shared/types/clinicalCondition';

export * from '@/shared/types/clinicalHistory';

export * from '@/shared/types/clinicalMedication';

export * from '@/shared/types/audit';

export * from '@/shared/types/permissions';

export * from '@/shared/types/permissionEntity';

export * from '@/shared/types/physiotherapy';

export * from '@/shared/types/program';

export * from '@/shared/types/psychology';

export * from '@/shared/types/roleChanges';

export * from '@/shared/types/socialWork';

export * from '@/shared/types/specializedArea';

// ⚠️ specializedAppointment.ts contiene enums legacy con nombres que colisionan con nursing.ts.
// Se importa explícitamente desde './types/specializedAppointment' en los consumidores que lo
// necesiten. Los nombres AppointmentStatus/Type/Priority exportados desde este módulo son los
// definidos en nursing.ts (la fuente de verdad sincronizada con el backend).

export * from '@/shared/types/entranceExit';

export * from '@/shared/types/emergencyContact';

export * from '@/shared/types/entranceExitApi';

export * from '@/shared/types/vaccine';

export * from '@/shared/types/medicalRecord';

export * from '@/shared/types/notifuse';

export * from '@/shared/types/email';

export * from '@/shared/types/nursing';

export * from '@/shared/types/olderAdultUpdate';

export * from '@/shared/types/olderAdultFamily';

export * from '@/shared/types/globalSettings';
