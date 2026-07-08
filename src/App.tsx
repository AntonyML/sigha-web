import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import { AppLayout } from './presentation/components/organisms'
import { NotificationProvider } from './presentation/components/organisms/NotificationCenter'
import { TwoFactorProvider } from './infrastructure/flows/twoFactor'
import { PermissionUtils } from './utils/permissionUtils';
import InterfaceSettingsPage from './presentation/pages/settings/InterfaceSettingsPage';
import GeneralSettingsPage from './presentation/pages/settings/GeneralSettingsPage';

/* ─── Route guard: bloquea acceso si el usuario no tiene permiso sobre el módulo ── */

function ProtectedRoute({ module, children }: { module: string; children: React.ReactNode }) {
  const [, force] = useState(0)
  const [loaded, setLoaded] = useState(PermissionUtils.isLoaded())

  useEffect(() => {
    let cancelled = false
    const ensureLoaded = async () => {
      if (PermissionUtils.isLoaded()) {
        if (!cancelled) setLoaded(true)
        return
      }
      await PermissionUtils.load()
      if (!cancelled) setLoaded(true)
    }
    ensureLoaded()
    const unsubscribe = PermissionUtils.subscribe(() => force(n => n + 1))
    return () => { cancelled = true; unsubscribe() }
  }, [])

  if (!loaded) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando…</span>
          </div>
          <p className="text-muted">Verificando permisos…</p>
        </div>
      </div>
    )
  }

  if (!PermissionUtils.canAccessModule(module)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

import LoginForm from './presentation/pages/login/LoginPage'
import PasswordRecoveryRequestPage from './presentation/pages/login/PasswordRecoveryRequestPage'
import PasswordRecoveryVerifyPage from './presentation/pages/login/PasswordRecoveryVerifyPage'
import PasswordRecoveryResetPage from './presentation/pages/login/PasswordRecoveryResetPage'
import TwoFactorVerificationPage from './presentation/pages/login/TwoFactorVerificationPage'
import CreateUserPage from './presentation/pages/login/CreateUserPage'

// Hubs
import AdminHubPage from './presentation/pages/admin/AdminHubPage'
import SettingsHubPage from './presentation/pages/settings/SettingsHubPage'

//Older Adults
import Dashboard from './presentation/pages/dashboard/DashboardPage'
import ListVirtualFile from './presentation/pages/older-adults/OlderAdultsListPage'
import CreateVirtualFile from './presentation/pages/older-adults/CreateVirtualRecordPage'
import EditVirtualFile from './presentation/pages/older-adults/EditVirtualRecordPage'
import ViewAdultsPage from './presentation/pages/older-adults/ViewAdultsPage'

//Users
import ListUser from './presentation/pages/users/UserListPage'
import CreateUser from './presentation/pages/users/CreateUserPage'
import ViewUserPage from './presentation/pages/users/ViewUserPage'
import EditUserPage from './presentation/pages/users/EditUserPage'
import DeletedUsersPage from './presentation/pages/users/DeletedUsersPage'

//Profile
import ProfilePage from './presentation/pages/profile/ProfilePage';
import EditProfilePage from './presentation/pages/profile/EditProfilePage'

//Roles
import RoleListPage from './presentation/pages/roles/RoleListPage'
import CreateRolePage from './presentation/pages/roles/CreateRolePage'
import ViewRolePage from './presentation/pages/roles/ViewRolePage'
import EditRolePage from './presentation/pages/roles/EditRolePage'

//Permissions
import PermissionListPage from './presentation/pages/permissions/PermissionListPage'
import CreatePermissionPage from './presentation/pages/permissions/CreatePermissionPage'
import ViewPermissionPage from './presentation/pages/permissions/ViewPermissionPage'
import EditPermissionPage from './presentation/pages/permissions/EditPermissionPage'

//Programs
import ProgramListPage from './presentation/pages/programs/ProgramListPage'
import CreateProgramPage from './presentation/pages/programs/CreateProgramPage'

//Vaccines
import VaccineListPage from './presentation/pages/vaccines/VaccineListPage'
import CreateVaccinePage from './presentation/pages/vaccines/CreateVaccinePage'

//SubPrograms
import SubProgramListPage from './presentation/pages/sub-programs/SubProgramListPage'
import CreateSubProgramPage from './presentation/pages/sub-programs/CreateSubProgramPage'

//Two Factor
import TwoFactorPage from './presentation/pages/two-factor/TwoFactorPage'

//Entrance Exit
import EntranceExitDashboard from './presentation/pages/entrance-exit/EntranceExitDashboard'
import RegisterEntranceExit from './presentation/pages/entrance-exit/RegisterEntranceExit'
import EntranceExitHistory from './presentation/pages/entrance-exit/EntranceExitHistory'

//Nursing
import NursingDashboard from './presentation/pages/nursing/NursingDashboard'
import ScheduleAppointment from './presentation/pages/nursing/ScheduleAppointment'
import AppointmentHistory from './presentation/pages/nursing/AppointmentHistory'
import AppointmentDetail from './presentation/pages/nursing/AppointmentDetail'
import AppointmentResults from './presentation/pages/nursing/AppointmentResults'
import CompleteAppointment from './presentation/pages/nursing/CompleteAppointment'
import PatientAppointments from './presentation/pages/nursing/PatientAppointments'

//Audit
import AuditMenuPage from './presentation/pages/audit/AuditMenuPage'
import AuditListPage from './presentation/pages/audit/AuditListPage'
import ViewAuditPage from './presentation/pages/audit/ViewAuditPage'
import AuditDashboardPage from './presentation/pages/audit/AuditDashboardPage'
import ActivityLogsPage from './presentation/pages/audit/ActivityLogsPage'
import SecurityAuditPage from './presentation/pages/audit/SecurityAuditPage'
import SystemHealthPage from './presentation/pages/audit/SystemHealthPage'

//Medical Records
import MedicalRecordsListPage from './presentation/pages/medical-records/MedicalRecordsListPage'
import CreateMedicalRecordPage from './presentation/pages/medical-records/CreateMedicalRecordPage'
import EditMedicalRecordPage from './presentation/pages/medical-records/EditMedicalRecordPage'
import ViewMedicalRecordPage from './presentation/pages/medical-records/ViewMedicalRecordPage'

//Physiotherapy
import PhysiotherapySessionsListPage from './presentation/pages/physiotherapy/PhysiotherapySessionsListPage'
import CreatePhysiotherapySessionPage from './presentation/pages/physiotherapy/CreatePhysiotherapySessionPage'
import EditPhysiotherapySessionPage from './presentation/pages/physiotherapy/EditPhysiotherapySessionPage'
import ViewPhysiotherapySessionPage from './presentation/pages/physiotherapy/ViewPhysiotherapySessionPage'

//Psychology
import PsychologySessionsListPage from './presentation/pages/psychology/PsychologySessionsListPage'
import CreatePsychologySessionPage from './presentation/pages/psychology/CreatePsychologySessionPage'
import EditPsychologySessionPage from './presentation/pages/psychology/EditPsychologySessionPage'
import ViewPsychologySessionPage from './presentation/pages/psychology/ViewPsychologySessionPage'

//Social Work
import SocialWorkReportsListPage from './presentation/pages/social-work/SocialWorkReportsListPage'
import CreateSocialWorkReportPage from './presentation/pages/social-work/CreateSocialWorkReportPage'
import EditSocialWorkReportPage from './presentation/pages/social-work/EditSocialWorkReportPage'
import ViewSocialWorkReportPage from './presentation/pages/social-work/ViewSocialWorkReportPage'

//Notifications
import NotificationsListPage from './presentation/pages/notifications/NotificationsListPage'

//Role Changes
import RoleChangesListPage from './presentation/pages/role-changes/RoleChangesListPage'
import CreateNotificationPage from './presentation/pages/notifications/CreateNotificationPage'
import ViewNotificationPage from './presentation/pages/notifications/ViewNotificationPage'

//Clinical History (Condiciones Clínicas)
import ClinicalConditionsListPage from './presentation/pages/clinical-history/ClinicalConditionsListPage'
import CreateClinicalConditionPage from './presentation/pages/clinical-history/CreateClinicalConditionPage'

//Clinical Medication
import ClinicalMedicationListPage from './presentation/pages/clinical-medication/ClinicalMedicationListPage'
import CreateClinicalMedicationPage from './presentation/pages/clinical-medication/CreateClinicalMedicationPage'
import EditClinicalMedicationPage from './presentation/pages/clinical-medication/EditClinicalMedicationPage'

//Emergency Contacts
import EmergencyContactsListPage from './presentation/pages/emergency-contacts/EmergencyContactsListPage'
import CreateEmergencyContactPage from './presentation/pages/emergency-contacts/CreateEmergencyContactPage'
import EditEmergencyContactPage from './presentation/pages/emergency-contacts/EditEmergencyContactPage'

//Older Adult Family
import OlderAdultFamilyListPage from './presentation/pages/older-adult-family/OlderAdultFamilyListPage'
import CreateOlderAdultFamilyPage from './presentation/pages/older-adult-family/CreateOlderAdultFamilyPage'
import EditOlderAdultFamilyPage from './presentation/pages/older-adult-family/EditOlderAdultFamilyPage'

//Older Adult Updates
import OlderAdultUpdatesListPage from './presentation/pages/older-adult-updates/OlderAdultUpdatesListPage'

//Specialized Areas
import SpecializedAreasListPage from './presentation/pages/specialized-areas/SpecializedAreasListPage'
import CreateSpecializedAreaPage from './presentation/pages/specialized-areas/CreateSpecializedAreaPage'
import EditSpecializedAreaPage from './presentation/pages/specialized-areas/EditSpecializedAreaPage'

//Specialized Appointments
import SpecializedAppointmentsListPage from './presentation/pages/specialized-appointments/SpecializedAppointmentsListPage'
import CreateSpecializedAppointmentPage from './presentation/pages/specialized-appointments/CreateSpecializedAppointmentPage'
import EditSpecializedAppointmentPage from './presentation/pages/specialized-appointments/EditSpecializedAppointmentPage'

export default function App() {
  return (
    <NotificationProvider>
      <TwoFactorProvider>
        <Routes>
        {/* Authentication Routes - No Layout */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/auth/forgot-password" element={<PasswordRecoveryRequestPage />} />
        <Route path="/auth/recovery/verify" element={<PasswordRecoveryVerifyPage />} />
        <Route path="/auth/recovery/reset" element={<PasswordRecoveryResetPage />} />
        <Route path="/auth/verify-2fa" element={<TwoFactorVerificationPage />} />
        <Route path="/auth/create-user" element={<CreateUserPage />} />

        {/* Main Application Routes - With Layout */}
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admin" element={<AdminHubPage />} />
              <Route path="settings" element={<SettingsHubPage />} />
              <Route path="settings/general" element={<GeneralSettingsPage />} />
              <Route path="settings/interface" element={<InterfaceSettingsPage />} />
              <Route path="virtualFiles" element={<ListVirtualFile />} />
              <Route path="virtualFiles/create" element={<CreateVirtualFile />} />
              <Route path="virtualFiles/edit/:id" element={<EditVirtualFile />} />
              <Route path="virtualFiles/view/:id" element={<ViewAdultsPage />} />

              <Route path="users" element={<ProtectedRoute module="users"><ListUser /></ProtectedRoute>} />
              <Route path="users/create" element={<ProtectedRoute module="users"><CreateUser /></ProtectedRoute>} />
              <Route path="users/view/:id" element={<ProtectedRoute module="users"><ViewUserPage /></ProtectedRoute>} />
              <Route path="users/edit/:id" element={<ProtectedRoute module="users"><EditUserPage /></ProtectedRoute>} />
              <Route path="users/deleted" element={<ProtectedRoute module="users"><DeletedUsersPage /></ProtectedRoute>} />

              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<EditProfilePage />} />

              <Route path="roles" element={<ProtectedRoute module="roles"><RoleListPage /></ProtectedRoute>} />
              <Route path="roles/create" element={<ProtectedRoute module="roles"><CreateRolePage /></ProtectedRoute>} />
              <Route path="roles/view/:id" element={<ProtectedRoute module="roles"><ViewRolePage /></ProtectedRoute>} />
              <Route path="roles/edit/:id" element={<ProtectedRoute module="roles"><EditRolePage /></ProtectedRoute>} />

              <Route path="permissions" element={<ProtectedRoute module="permissions"><PermissionListPage /></ProtectedRoute>} />
              <Route path="permissions/create" element={<ProtectedRoute module="permissions"><CreatePermissionPage /></ProtectedRoute>} />
              <Route path="permissions/view/:id" element={<ProtectedRoute module="permissions"><ViewPermissionPage /></ProtectedRoute>} />
              <Route path="permissions/edit/:id" element={<ProtectedRoute module="permissions"><EditPermissionPage /></ProtectedRoute>} />

              <Route path="programs" element={<ProgramListPage />} />
              <Route path="programs/create" element={<CreateProgramPage />} />

              <Route path="vaccines" element={<VaccineListPage />} />
              <Route path="vaccines/create" element={<CreateVaccinePage />} />

              <Route path="sub-programs" element={<SubProgramListPage />} />
              <Route path="sub-programs/create" element={<CreateSubProgramPage />} />

              <Route path="two-factor" element={<TwoFactorPage />} />

              <Route path="entrance-exit" element={<EntranceExitDashboard />} />
              <Route path="entrance-exit/register" element={<RegisterEntranceExit />} />
              <Route path="entrance-exit/history" element={<EntranceExitHistory />} />

              <Route path="nursing" element={<NursingDashboard />} />
              <Route path="nursing/appointments/new" element={<ScheduleAppointment />} />
              <Route path="nursing/appointments/history" element={<AppointmentHistory />} />
              <Route path="nursing/appointments/:id/view" element={<AppointmentDetail />} />
              <Route path="nursing/appointments/:id/results" element={<AppointmentResults />} />
              <Route path="nursing/appointments/:id/complete" element={<CompleteAppointment />} />
              <Route path="nursing/patients/:patientId/appointments" element={<PatientAppointments />} />

              <Route path="audits" element={<ProtectedRoute module="audits"><AuditMenuPage /></ProtectedRoute>} />
              <Route path="audits/list" element={<ProtectedRoute module="audits"><AuditListPage /></ProtectedRoute>} />
              <Route path="audits/view/:id" element={<ProtectedRoute module="audits"><ViewAuditPage /></ProtectedRoute>} />
              <Route path="audits/dashboard" element={<ProtectedRoute module="audits"><AuditDashboardPage /></ProtectedRoute>} />
              <Route path="audits/activity-logs" element={<ProtectedRoute module="audits"><ActivityLogsPage /></ProtectedRoute>} />
              <Route path="audits/security" element={<ProtectedRoute module="audits"><SecurityAuditPage /></ProtectedRoute>} />
              <Route path="audits/system-health" element={<ProtectedRoute module="audits"><SystemHealthPage /></ProtectedRoute>} />

              <Route path="medical-records" element={<MedicalRecordsListPage />} />
              <Route path="medical-records/create" element={<CreateMedicalRecordPage />} />
              <Route path="medical-records/view/:id" element={<ViewMedicalRecordPage />} />
              <Route path="medical-records/edit/:id" element={<EditMedicalRecordPage />} />

              <Route path="physiotherapy" element={<PhysiotherapySessionsListPage />} />
              <Route path="physiotherapy/create" element={<CreatePhysiotherapySessionPage />} />
              <Route path="physiotherapy/view/:id" element={<ViewPhysiotherapySessionPage />} />
              <Route path="physiotherapy/edit/:id" element={<EditPhysiotherapySessionPage />} />

              <Route path="psychology" element={<PsychologySessionsListPage />} />
              <Route path="psychology/create" element={<CreatePsychologySessionPage />} />
              <Route path="psychology/view/:id" element={<ViewPsychologySessionPage />} />
              <Route path="psychology/edit/:id" element={<EditPsychologySessionPage />} />

              <Route path="social-work" element={<SocialWorkReportsListPage />} />
              <Route path="social-work/create" element={<CreateSocialWorkReportPage />} />
              <Route path="social-work/view/:id" element={<ViewSocialWorkReportPage />} />
              <Route path="social-work/edit/:id" element={<EditSocialWorkReportPage />} />

              <Route path="notifications" element={<NotificationsListPage />} />
              <Route path="role-changes" element={<ProtectedRoute module="roles"><RoleChangesListPage /></ProtectedRoute>} />
              <Route path="notifications/create" element={<CreateNotificationPage />} />
              <Route path="notifications/view/:id" element={<ViewNotificationPage />} />

              <Route path="clinical-history" element={<ClinicalConditionsListPage />} />
              <Route path="clinical-history/create" element={<CreateClinicalConditionPage />} />

              <Route path="clinical-medication" element={<ClinicalMedicationListPage />} />
              <Route path="clinical-medication/create" element={<CreateClinicalMedicationPage />} />
              <Route path="clinical-medication/edit/:id" element={<EditClinicalMedicationPage />} />

              <Route path="emergency-contacts" element={<EmergencyContactsListPage />} />
              <Route path="emergency-contacts/create" element={<CreateEmergencyContactPage />} />
              <Route path="emergency-contacts/edit/:id" element={<EditEmergencyContactPage />} />

              <Route path="older-adult-family" element={<OlderAdultFamilyListPage />} />
              <Route path="older-adult-family/create" element={<CreateOlderAdultFamilyPage />} />
              <Route path="older-adult-family/edit/:id" element={<EditOlderAdultFamilyPage />} />

              <Route path="older-adult-updates" element={<OlderAdultUpdatesListPage />} />

              <Route path="specialized-areas" element={<SpecializedAreasListPage />} />
              <Route path="specialized-areas/create" element={<CreateSpecializedAreaPage />} />
              <Route path="specialized-areas/edit/:id" element={<EditSpecializedAreaPage />} />

              <Route path="specialized-appointments" element={<SpecializedAppointmentsListPage />} />
              <Route path="specialized-appointments/create" element={<CreateSpecializedAppointmentPage />} />
              <Route path="specialized-appointments/edit/:id" element={<EditSpecializedAppointmentPage />} />
            </Routes>
          </AppLayout>
        } />
      </Routes>
      </TwoFactorProvider>
    </NotificationProvider>
  )
}
