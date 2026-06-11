import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { olderAdultFamilyService } from '../../../services/olderAdultFamilyService'
import type { OlderAdultFamilyApi } from '../../../types/olderAdultFamily'
import { KinshipTypeApi } from '../../../types/olderAdultFamily'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const kinshipLabels: Record<KinshipTypeApi, string> = {
  [KinshipTypeApi.SON]: 'Hijo',
  [KinshipTypeApi.DAUGHTER]: 'Hija',
  [KinshipTypeApi.GRANDSON]: 'Nieto',
  [KinshipTypeApi.GRANDDAUGHTER]: 'Nieta',
  [KinshipTypeApi.BROTHER]: 'Hermano',
  [KinshipTypeApi.SISTER]: 'Hermana',
  [KinshipTypeApi.NEPHEW]: 'Sobrino',
  [KinshipTypeApi.NIECE]: 'Sobrina',
  [KinshipTypeApi.HUSBAND]: 'Esposo',
  [KinshipTypeApi.WIFE]: 'Esposa',
  [KinshipTypeApi.LEGAL_GUARDIAN]: 'Tutor Legal',
  [KinshipTypeApi.OTHER]: 'Otro',
  [KinshipTypeApi.NOT_SPECIFIED]: 'No especificado',
}

export default function OlderAdultFamilyListPage() {
  const [items, setItems] = useState<OlderAdultFamilyApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await olderAdultFamilyService.getAll())
    } catch {
      setError('Error al cargar familiares')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar familiar', '¿Eliminar este familiar?')
    if (!ok) return
    try {
      await olderAdultFamilyService.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
      feedback.success('Familiar eliminado exitosamente.')
    } catch {
      feedback.error('Error al eliminar el familiar')
    }
  }

  const filtered = items.filter(i => {
    if (!search.trim()) return true
    const t = search.toLowerCase()
    return (
      i.pfName.toLowerCase().includes(t) ||
      i.pfFLastName.toLowerCase().includes(t) ||
      i.pfIdentification.toLowerCase().includes(t)
    )
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Users size={22} color="#16a34a" />
          Familiares de Adultos Mayores
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/older-adult-family/create')}>
            <Plus size={16} /> Nuevo
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
            placeholder="Buscar por nombre, apellido o cédula..."
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
          <Users size={48} className="lp-empty__icon" />
          <p>{search ? 'No se encontraron resultados.' : 'No hay familiares registrados.'}</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Primer Apellido</th>
                  <th>Segundo Apellido</th>
                  <th>Parentesco</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.pfIdentification}</td>
                    <td>{item.pfName}</td>
                    <td>{item.pfFLastName}</td>
                    <td>{item.pfSLastName}</td>
                    <td>
                      <span className="lp-badge lp-badge--success">
                        {kinshipLabels[item.pfKinship] ?? item.pfKinship}
                      </span>
                    </td>
                    <td>{item.pfPhoneNumber ?? <span className="lp-muted"></span>}</td>
                    <td>{item.pfEmail ?? <span className="lp-muted"></span>}</td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/older-adult-family/edit/${item.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(item.id)}
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