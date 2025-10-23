import { Routes, Route, Navigate } from 'react-router-dom'

import LoginForm from './presentation/pages/auth/LoginPageNew'

import MainMenuPage from './presentation/pages/main-menu/MainMenuPage'

//Older Adults
import Dashboard from './presentation/pages/dashboard/DashboardPage'
import ListVirtualFile from './presentation/pages/older-adults/OlderAdultsListPage'
import EditVirtualFile from './presentation/pages/older-adults/EditVirtualRecordPage'
import ViewAdultsPage from './presentation/pages/older-adults/ViewAdultsPage'

//Users
import ListUser from './presentation/pages/users/UserListPage'
import CreateUser from './presentation/pages/users/CreateUserPage'
import ViewUserPage from './presentation/pages/users/ViewUserPage'
import EditUserPage from './presentation/pages/users/EditUserPage'

//Two Factor
import TwoFactorPage from './presentation/pages/two-factor/TwoFactorPage'
import EntranceExitDashboard from './presentation/pages/entrance-exit/EntranceExitDashboard'
import RegisterEntranceExit from './presentation/pages/entrance-exit/RegisterEntranceExit'
import EntranceExitHistory from './presentation/pages/entrance-exit/EntranceExitHistory'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm />} />

      <Route path="/main-menu" element={<MainMenuPage />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/virtualFiles" element={<ListVirtualFile />} />
      <Route path="/virtualFiles/edit/:id" element={<EditVirtualFile />} />
      <Route path="/virtualFiles/view/:id" element={<ViewAdultsPage />} />


      <Route path="/users" element={<ListUser />} />
      <Route path="/users/create" element={<CreateUser />} />
      <Route path="/users/view/:id" element={<ViewUserPage />} />
      <Route path="/users/edit/:id" element={<EditUserPage />} />

      <Route path="/two-factor" element={<TwoFactorPage />} />
      <Route path="/entrance-exit" element={<EntranceExitDashboard />} />
      <Route path="/entrance-exit/register" element={<RegisterEntranceExit />} />
      <Route path="/entrance-exit/history" element={<EntranceExitHistory />} />
    </Routes>
  )
}
