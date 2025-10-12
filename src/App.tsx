import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './presentation/pages/auth/LoginPage'
import Dashboard from './presentation/pages/dashboard/DashboardPage'
import ListVirtualFile from './presentation/pages/older-adults/OlderAdultsListPage'
import EditVirtualFile from './presentation/pages/older-adults/EditVirtualRecordPage'
import ListUser from './presentation/pages/users/UserListPage'
import MainMenuPage from './presentation/pages/main-menu/MainMenuPage'
import ViewAdultsPage from './presentation/pages/older-adults/ViewAdultsPage'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/virtualFiles" element={<ListVirtualFile />} />
      <Route path="/virtualFiles/edit/:id" element={<EditVirtualFile />} />
      <Route path="/users" element={<ListUser />} />
      <Route path="/main-menu" element={<MainMenuPage />} />
      <Route path="/virtualFiles/view/:id" element={<ViewAdultsPage />} />
    </Routes>
  )
}
