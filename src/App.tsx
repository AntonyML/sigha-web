import { Routes, Route, Navigate } from 'react-router-dom'

import LoginForm from './presentation/pages/auth/LoginPage'

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
    </Routes>
  )
}
