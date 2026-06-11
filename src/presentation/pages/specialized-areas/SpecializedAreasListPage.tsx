import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { specializedAreasService } from '../../../services/specializedAreasService'
import type { SpecializedAreaApi } from '../../../types/specializedArea'
import { SpecializedAreaName } from '../../../types/specializedArea'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const areaLabel: Record<string, string> = {
  [SpecializedAreaName.NURSING]: 'Enfermería',
  [SpecializedAreaName.PHYSIOTHERAPY]: 'Fisioterapia',
  [SpecializedAreaName.PSYCHOLOGY]: 'Psicología',
  [SpecializedAreaName.SOCIAL_WORK]: 'Trabajo Social',
  [SpecializedAreaName.NOT_SPECIFIED]: 'No especificado',
}

export default function SpecializedAreasListPage() {
  const [items, setItems] = useState<SpecializedAreaApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await specializedAreasService.getAll())
    } catch {
      setError('Error al cargar áreas especializadas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar área', '¿Confirmar eliminación?')
    if (!ok) return
    try {
      await specializedAreasService.remove(id)
      load()
    } catch (err: any) {
      feedback.error(err?.response?.data?.message ?? 'Error al eliminar')
    }
  }

  const filtered = items.filter(i => {
    if (!search.trim()) return true
    const t = search.toLowerCase()
    return (
      (i.saName ?? '').toLowerCase().includes(t) ||
      (i.saDescription ?? '').toLowerCase().includes(t) ||
      (i.saContactEmail ?? '').toLowerCase().includes(t)
    )
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Building2 size={22} color="#2563eb" />
          Áreas Especializadas
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--success" onClick={() => navigate('/specialized-areas/create')}>
            <Plus size={16} /> Nueva Área
          </button>
        </div>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={load}>Reintentar</button>
        </div>
      )}

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="lp-search-clear" onClick={() => setSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <Building2 size={48} className="lp-empty__icon" />
          <p>{search ? 'No se encontraron resultados.' : 'No hay áreas registradas.'}</p>
          {!search && (
            <button className="lp-btn lp-btn--success" onClick={() => navigate('/specialized-areas/create')}>
              <Plus size={15} /> Crear primera área
            </button>
          )}
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(item => (
                  <tr key={item.id}>
                    <td><span className="lp-badge lp-badge--id">{item.id}</span></td>
                    <td><strong>{areaLabel[item.saName ?? ''] ?? item.saName}</strong></td>
                    <td><small style={{ color: '#64748b' }}>{item.saDescription ?? ''}</small></td>
                    <td>{item.saContactEmail ?? <span className="lp-muted"></span>}</td>
                    <td>{item.saContactPhone ?? <span className="lp-muted"></span>}</td>
                    <td>
                      <span className={`lp-badge ${item.saIsActive ? 'lp-badge--success' : 'lp-badge--secondary'}`}>
                        {item.saIsActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/specialized-areas/edit/${item.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(item.id!)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}