import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './pages/auth/LoginForm'
import Dashboard from './pages/Dashboard'
import ListVirtualFile from './pages/virtualFile/ListVirtualFile'
import EditVirtualFile from './pages/virtualFile/EditVirtualFile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/virtualFiles" element={<ListVirtualFile />} />
      <Route path="/virtualFiles/edit/:id" element={<EditVirtualFile />} />
    </Routes>
  )
}