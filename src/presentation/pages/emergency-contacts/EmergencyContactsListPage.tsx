import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { emergencyContactService } from '../../../services/emergencyContactService'
import type { EmergencyContactApi } from '../../../services/emergencyContactService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

export default function EmergencyContactsListPage() {
  const [items, setItems] = useState<EmergencyContactApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await emergencyContactService.getAll())
    } catch {
      setError('Error al cargar contactos de emergencia')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar contacto', '¿Eliminar este contacto de emergencia?')
    if (!ok) return
    try {
      await emergencyContactService.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
      feedback.success('Contacto eliminado exitosamente.')
    } catch {
      feedback.error('Error al eliminar el contacto')
    }
  }

  const filtered = items.filter(i =>
    !search.trim() || i.enPhoneNumber.toLowerCase().includes(search.toLowerCase())
  )

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Phone size={22} color="#dc2626" />
          Contactos de Emergencia
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/emergency-contacts/create')}>
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
            placeholder="Buscar por teléfono..."
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
          <Phone size={48} className="lp-empty__icon" />
          <p>{search ? 'No se encontraron resultados.' : 'No hay contactos registrados.'}</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-cards-grid" style={{ padding: '1rem' }}>
            {paginatedItems.map(item => (
              <div key={item.id} className="lp-item-card">
                <div className="lp-item-card__header">
                  <div
                    className="lp-item-card__avatar"
                    style={{ background: '#fee2e2' }}
                  >
                    <Phone size={20} color="#dc2626" />
                  </div>
                  <div>
                    <strong>{item.enPhoneNumber}</strong>
                    {item.idOlderAdult && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Adulto mayor ID: {item.idOlderAdult}
                      </div>
                    )}
                  </div>
                </div>
                <div className="lp-item-card__footer">
                  <button
                    className="lp-btn lp-btn--back lp-btn--sm"
                    onClick={() => navigate(`/emergency-contacts/edit/${item.id}`)}
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    className="lp-btn lp-btn--danger lp-btn--sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}