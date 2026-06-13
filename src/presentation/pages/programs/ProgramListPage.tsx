import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, ArrowLeft, Plus, Search, X, AlertCircle, Eye, Pencil, GitBranch, Trash2 } from 'lucide-react'
import type { Program } from '../../../types/program'
import { programService } from '../../../services/programService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

export default function ProgramListPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  useEffect(() => { loadPrograms() }, [])

  async function loadPrograms() {
    setLoading(true)
    setError('')
    try {
      const data = await programService.getAllPrograms()
      setPrograms(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los programas')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    const ok = await feedback.confirm('Eliminar programa', '¿Está seguro de que desea eliminar este programa?')
    if (!ok) return
    feedback.error('La eliminación de programas no está disponible en esta versión.')
  }

  const filtered = programs.filter(p =>
    p.pName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <LayoutGrid size={22} color="#2563eb" />
          Gestión de Programas
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Menú Principal
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/programs/create')}>
            <Plus size={16} /> Nuevo Programa
          </button>
        </div>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={loadPrograms}>Reintentar</button>
        </div>
      )}

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar programas..."
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
          <span>Cargando programas...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <LayoutGrid size={48} className="lp-empty__icon" />
          <p>{searchTerm ? 'No se encontraron programas con esa búsqueda.' : 'No hay programas registrados.'}</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>Nombre</th>
                  <th>Fecha Creación</th>
                  <th>Subprogramas</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(program => (
                  <tr key={program.id}>
                    <td>
                      <strong>{program.pName}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        Creado {program.createAt ? new Date(program.createAt).toLocaleDateString() : 'N/A'}
                      </div>
                      {program.subPrograms && program.subPrograms.length > 0 && (
                        <div style={{ fontSize: '0.78rem', color: '#0891b2', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <GitBranch size={11} />
                          {program.subPrograms.map(sp => sp.spName).join(', ')}
                        </div>
                      )}
                    </td>
                    <td>{program.createAt ? new Date(program.createAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className="lp-badge lp-badge--info">
                        {program.subPrograms?.length ?? 0} subprogramas
                      </span>
                    </td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn lp-icon-btn--view"
                          title="Ver detalles"
                          onClick={() => navigate(`/programs/view/${program.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/programs/edit/${program.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete()}
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
      {!loading && <div className="lp-count">Total: {filtered.length} programa(s)</div>}
    </div>
  )
}