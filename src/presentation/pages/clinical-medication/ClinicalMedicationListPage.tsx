import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pill, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { clinicalMedicationService } from '../../../services/clinicalMedicationService'
import type { ClinicalMedicationApi } from '../../../types/clinicalMedication'
import { TreatmentType } from '../../../types/clinicalMedication'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const treatmentLabels: Record<TreatmentType, string> = {
  [TreatmentType.TEMPORARY]: 'Temporal',
  [TreatmentType.CHRONIC]: 'Crónico',
  [TreatmentType.PREVENTIVE]: 'Preventivo',
  [TreatmentType.OTHER]: 'Otro',
}

export default function ClinicalMedicationListPage() {
  const [items, setItems] = useState<ClinicalMedicationApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await clinicalMedicationService.getAll())
    } catch {
      setError('Error al cargar medicamentos clínicos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar medicamento', '¿Eliminar este medicamento?')
    if (!ok) return
    try {
      await clinicalMedicationService.remove(id)
      setItems(prev => prev.filter(i => i.id !== id))
      feedback.success('Medicamento eliminado exitosamente.')
    } catch {
      feedback.error('Error al eliminar el medicamento')
    }
  }

  const filtered = items.filter(i =>
    !search.trim() ||
    i.mMedication.toLowerCase().includes(search.toLowerCase()) ||
    i.mDosage.toLowerCase().includes(search.toLowerCase())
  )

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Pill size={22} color="#2563eb" />
          Medicamentos Clínicos
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/clinical-medication/create')}>
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
            placeholder="Buscar por medicamento o dosis..."
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
          <Pill size={48} className="lp-empty__icon" />
          <p>{search ? 'No se encontraron resultados.' : 'No hay medicamentos registrados.'}</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>ID</th>
                  <th>Medicamento</th>
                  <th>Dosis</th>
                  <th>Tipo Tratamiento</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(item => (
                  <tr key={item.id}>
                    <td><span className="lp-badge lp-badge--id">{item.id}</span></td>
                    <td>{item.mMedication}</td>
                    <td>{item.mDosage}</td>
                    <td>
                      {item.mTreatmentType
                        ? <span className="lp-badge lp-badge--info">{treatmentLabels[item.mTreatmentType] ?? item.mTreatmentType}</span>
                        : <span className="lp-muted"></span>}
                    </td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/clinical-medication/edit/${item.id}`)}
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