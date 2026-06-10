// Auth flows
export { authFlow } from './auth';

// User management flows
export { userManagementFlow } from './userManagement';

// Role flows
export { roleFlow } from './role';

// Audit flows
export { auditFlow } from './audit';

// Two factor flows
export { twoFactorFlow } from './twoFactor';

// Profile flows
export { profileFlow } from './profile';

// Permission flows
export { permissionFlow } from './permission';

// Password recovery flows
export { passwordRecoveryFlow } from './passwordRecovery';

// Virtual file flows (pending implementation)
// export { virtualFileFlow } from './virtualFile';

// Email flows (Resend-backed). Replaces the legacy notifuseFlow.
export { emailFlow } from './email';

// Clinical flows (EPICA 3).
export { clinicalHistoryFlow } from './clinical-history';
export { clinicalMedicationFlow } from './clinical-medication';
export { emergencyContactFlow } from './emergency-contact';
export { medicalRecordFlow } from './medical-record';
export { nursingFlow } from './nursing';
export { olderAdultFamilyFlow } from './older-adult-family';
export { olderAdultUpdateFlow } from './older-adult-update';
export { physiotherapyFlow } from './physiotherapy';
export { psychologyFlow } from './psychology';
export { socialWorkFlow } from './social-work';
export { specializedAppointmentFlow } from './specialized-appointment';
export { specializedAreaFlow } from './specialized-area';