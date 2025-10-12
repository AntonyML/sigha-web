import React, { useState, useEffect } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<VirtualFile[]>(items)
  const navigate = useNavigate()
  const [canDelete, setCanDelete] = useState(true)
  const [canEdit, setCanEdit] = useState(true)
  const [canCreate, setCanCreate] = useState(true)
  const [canView, setCanView] = useState(true)

  // Efecto para filtrar los items basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items)
    } else {
      const filtered = items.filter(item => 
        item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredItems(filtered)
    }
  }, [items, searchTerm])

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  if (!canView) return null

  const handleView = (item: VirtualFile) => {
    navigate(`/virtualFiles/view/${item.id}`)
  }

  const handleEdit = (item: VirtualFile) => {
    navigate(`/virtualFiles/edit/${item.id}`)
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
          <Button variant="secondary" onClick={() => navigate('/main-menu')}>
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </Button>
          {canCreate && (
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              <i className="bi bi-plus-circle me-2"></i>
              Crear ficha
            </Button>
          )}
        </div>
      </div>

      {/* Buscador de pacientes */}
      <div className="row mb-4">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre de paciente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleClearSearch}
                title="Limpiar búsqueda"
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
          {searchTerm && (
            <small className="text-muted mt-1 d-block">
              Mostrando {filteredItems.length} de {items.length} registros
            </small>
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
            {filteredItems.length === 0 && searchTerm && (
              <tr>
                <td colSpan={4}>No se encontraron resultados para "{searchTerm}".</td>
              </tr>
            )}
            {filteredItems.length === 0 && !searchTerm && (
              <tr>
                <td colSpan={4}>No se encontraron archivos virtuales.</td>
              </tr>
            )}
            {filteredItems.map((it) => (
              <tr key={it.id}>
                <td>{it.title}</td>
                <td>{it.patientName}</td>
                <td>{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</td>
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="info" onClick={() => handleView(it)}>
                      <i className="bi bi-eye me-1"></i>
                      Ver
                    </Button>
                    {canEdit && (
                      <Button variant="secondary" onClick={() => handleEdit(it)}>
                        <i className="bi bi-pencil-square me-2"></i>
                        Editar
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="danger" onClick={() => handleDeleteClick(it)}>
                        <i className="bi bi-trash me-1"></i>
                        Eliminar
                      </Button>
                    )}
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
