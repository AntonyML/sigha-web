import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components'

interface VirtualFile {
  id: string
  title: string
  patientName?: string
  createdAt?: string
  description?: string
}

export default function ListVirtualFile() {
  const [items, setItems] = useState<VirtualFile[]>([
    { id: '1', title: 'Historia Clínica - Juan Pérez', patientName: 'Juan Pérez', createdAt: new Date().toISOString(), description: 'Registro inicial' },
    { id: '2', title: 'Historia Clínica - María López', patientName: 'María López', createdAt: new Date().toISOString(), description: 'Seguimiento' },
  ])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [canDelete, setCanDelete] = useState(true)
  const [canEdit, setCanEdit] = useState(true)
  const [canCreate, setCanCreate] = useState(true)
  const [canView, setCanView] = useState(true)

  if (!canView) return null

  const handleView = (item: VirtualFile) => {
    navigate(`/virtualfiles/view/${item.id}`)
  }

  const handleEdit = (item: VirtualFile) => {
    navigate(`/virtualfiles/edit/${item.id}`)
  }
  

  const handleDeleteClick = (item: VirtualFile) => {
    if (!canDelete) {
      window.alert('No tienes permiso para eliminar.')
      return
    }

    const ok = window.confirm(`¿Estás seguro que deseas eliminar "${item.title}"?`)
    if (!ok) return

    setItems((prev) => prev.filter((p) => p.id !== item.id))
  }

  if (loading) return <div>Cargando archivos virtuales...</div>

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Listado de Archivos Virtuales</h2>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/home')}>Regresar</Button>
          {canCreate && (
            <Button variant="primary" onClick={() => navigate('/dashboard')}>Crear ficha</Button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Título</th>
              <th>Paciente</th>
              <th>Fecha</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4}>No se encontraron archivos virtuales.</td>
              </tr>
            )}
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.title}</td>
                <td>{it.patientName}</td>
                <td>{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</td>
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="link" onClick={() => handleView(it)}>Ver</Button>
                    {canEdit && <Button variant="secondary" onClick={() => handleEdit(it)}>Editar</Button>}
                    {canDelete && <Button variant="danger" onClick={() => handleDeleteClick(it)}>Eliminar</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
