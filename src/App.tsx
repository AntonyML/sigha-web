import { Routes, Route, Navigate } from 'react-router-dom'

import { AppLayout } from './presentation/components/organisms'

import LoginForm from './presentation/pages/login/LoginPage'
import PasswordRecoveryRequestPage from './presentation/pages/login/PasswordRecoveryRequestPage'
import PasswordRecoveryVerifyPage from './presentation/pages/login/PasswordRecoveryVerifyPage'
import PasswordRecoveryResetPage from './presentation/pages/login/PasswordRecoveryResetPage'
import TwoFactorVerificationPage from './presentation/pages/login/TwoFactorVerificationPage'
import CreateUserPage from './presentation/pages/login/CreateUserPage'

import MainMenuPage from './presentation/pages/main-menu/MainMenuPage'

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

//Audit
import AuditMenuPage from './presentation/pages/audit/AuditMenuPage'
import AuditListPage from './presentation/pages/audit/AuditListPage'
import ViewAuditPage from './presentation/pages/audit/ViewAuditPage'
import AuditDashboardPage from './presentation/pages/audit/AuditDashboardPage'

export default function App() {
  return (
    <Routes>
      {/* Authentication Routes - No Layout */}
      <Route path="/" element={<Navigate to="/login" replace />} />
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
            <Route path="main-menu" element={<MainMenuPage />} />

            <Route path="dashboard" element={<Dashboard />} />
            <Route path="virtualFiles" element={<ListVirtualFile />} />
            <Route path="virtualFiles/create" element={<CreateVirtualFile />} />
            <Route path="virtualFiles/edit/:id" element={<EditVirtualFile />} />
            <Route path="virtualFiles/view/:id" element={<ViewAdultsPage />} />

            <Route path="users" element={<ListUser />} />
            <Route path="users/create" element={<CreateUser />} />
            <Route path="users/view/:id" element={<ViewUserPage />} />
            <Route path="users/edit/:id" element={<EditUserPage />} />
            <Route path="users/deleted" element={<DeletedUsersPage />} />

            <Route path="roles" element={<RoleListPage />} />
            <Route path="roles/create" element={<CreateRolePage />} />
            <Route path="roles/view/:id" element={<ViewRolePage />} />
            <Route path="roles/edit/:id" element={<EditRolePage />} />

            <Route path="permissions" element={<PermissionListPage />} />
            <Route path="permissions/create" element={<CreatePermissionPage />} />
            <Route path="permissions/view/:id" element={<ViewPermissionPage />} />
            <Route path="permissions/edit/:id" element={<EditPermissionPage />} />

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

            <Route path="audits" element={<AuditMenuPage />} />
            <Route path="audits/list" element={<AuditListPage />} />
            <Route path="audits/view/:id" element={<ViewAuditPage />} />
            <Route path="audits/dashboard" element={<AuditDashboardPage />} />
          </Routes>
        </AppLayout>
      } />
    </Routes>
  )
}
