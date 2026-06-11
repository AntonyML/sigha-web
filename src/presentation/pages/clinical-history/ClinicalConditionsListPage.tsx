import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, ArrowLeft, Plus, Search, X, AlertCircle } from 'lucide-react'
import { clinicalConditionService } from '../../../services/clinicalConditionService'
import type { ClinicalCondition } from '../../../types/clinicalCondition'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

export default function ClinicalConditionsListPage() {
  const [conditions, setConditions] = useState<ClinicalCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const loadConditions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await clinicalConditionService.getAllClinicalConditions()
      setConditions(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las condiciones clínicas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadConditions() }, [loadConditions])

  const filtered = conditions.filter(c =>
    !searchTerm.trim() || c.ccName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered, 24)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <HeartPulse size={22} color="#2563eb" />
          Condiciones Clínicas
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/clinical-history/create')}>
            <Plus size={16} /> Nueva Condición
          </button>
        </div>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={loadConditions}>Reintentar</button>
        </div>
      )}

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="lp-search-clear" onClick={() => setSearchTerm('')}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {!loading && (
        <div className="lp-count">
          {filtered.length} condición{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </div>
      )}

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando condiciones clínicas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <HeartPulse size={48} className="lp-empty__icon" />
          <p>{searchTerm ? 'No se encontraron condiciones con ese término.' : 'No hay condiciones clínicas registradas.'}</p>
          {!searchTerm && (
            <button className="lp-btn lp-btn--primary" onClick={() => navigate('/clinical-history/create')}>
              <Plus size={15} /> Agregar Primera Condición
            </button>
          )}
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-cards-grid" style={{ padding: '1rem' }}>
            {paginatedItems.map((condition, idx) => (
              <div key={condition.id ?? idx} className="lp-item-card">
                <div className="lp-item-card__header">
                  <div
                    className="lp-item-card__avatar"
                    style={{ background: '#dbeafe' }}
                  >
                    <HeartPulse size={20} color="#2563eb" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{condition.ccName}</strong>
                    {condition.id && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {condition.id}</div>}
                  </div>
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