import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldPlus, ArrowLeft, Plus, Search, X, Pencil, Trash2 } from 'lucide-react'
import type { Vaccine } from '../../../types/vaccine'
import { vaccineService } from '../../../services/vaccineService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

export default function VaccineListPage() {
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  useEffect(() => { loadVaccines() }, [])

  async function loadVaccines() {
    setLoading(true)
    try {
      const data = await vaccineService.getAllVaccines()
      setVaccines(data)
    } catch (err) {
      console.error(err)
      feedback.error('Error al cargar las vacunas', 'Error de carga')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    const ok = await feedback.confirm('¿Está seguro de que desea eliminar esta vacuna?', 'Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await vaccineService.deleteVaccine(id)
      await loadVaccines()
      feedback.success('Vacuna eliminada exitosamente')
      feedback.showNotification({ title: 'Vacuna eliminada', message: 'La vacuna ha sido eliminada del sistema', variant: 'success' })
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar la vacuna', 'Error de eliminación')
    }
  }

  const filtered = vaccines.filter(v =>
    v.vName && v.vName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <ShieldPlus size={22} color="#2563eb" />
          Gestión de Vacunas
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Menú Principal
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/vaccines/create')}>
            <Plus size={16} /> Nueva Vacuna
          </button>
        </div>
      </div>

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar vacunas..."
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

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando vacunas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <ShieldPlus size={48} className="lp-empty__icon" />
          <p>{searchTerm ? 'No se encontraron vacunas con esa búsqueda.' : 'No hay vacunas registradas.'}</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>ID</th>
                  <th>Nombre de la Vacuna</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(vaccine => (
                  <tr key={vaccine.id}>
                    <td><span className="lp-badge lp-badge--id">{vaccine.id}</span></td>
                    <td><strong>{vaccine.vName}</strong></td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/vaccines/edit/${vaccine.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(vaccine.id!)}
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
      {!loading && <div className="lp-count">Total: {filtered.length} vacuna(s)</div>}
    </div>
  )
}