import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import type { SubProgram } from '../../../types/subProgram'
import type { Program } from '../../../types/program'
import { subProgramService } from '../../../services/subProgramService'
import { programService } from '../../../services/programService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

export default function SubProgramListPage() {
  const [subPrograms, setSubPrograms] = useState<SubProgram[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterByProgram, setFilterByProgram] = useState<number | ''>('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [subProgramsData, programsData] = await Promise.all([
        subProgramService.getAllSubPrograms(),
        programService.getAllPrograms(),
      ])
      setSubPrograms(subProgramsData)
      setPrograms(programsData)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    const ok = await feedback.confirm('Eliminar subprograma', '¿Está seguro de que desea eliminar este subprograma?')
    if (!ok) return
    try {
      await subProgramService.deleteSubProgram(id)
      await loadData()
      feedback.success('Subprograma eliminado exitosamente.')
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar el subprograma')
    }
  }

  function getProgramName(programId: number): string {
    const program = programs.find(p => p.id === programId)
    return program ? program.pName : 'Programa no encontrado'
  }

  const filtered = subPrograms.filter(sp => {
    const matchesSearch = sp.spName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProgram = filterByProgram === '' || sp.programId === filterByProgram
    return matchesSearch && matchesProgram
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <GitBranch size={22} color="#2563eb" />
          Gestión de Subprogramas
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Menú Principal
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/sub-programs/create')}>
            <Plus size={16} /> Nuevo Subprograma
          </button>
        </div>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={loadData}>Reintentar</button>
        </div>
      )}

      <div className="lp-search-card">
        <div className="lp-search-row">
          <div className="lp-search-wrap">
            <Search size={16} className="lp-search-icon" />
            <input
              type="text"
              className="lp-search-input"
              placeholder="Buscar subprogramas..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="lp-search-clear" onClick={() => setSearchTerm('')}>
                <X size={15} />
              </button>
            )}
          </div>
          <select
            className="lp-select"
            value={filterByProgram}
            onChange={e => setFilterByProgram(e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">Todos los programas</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.pName}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <GitBranch size={48} className="lp-empty__icon" />
          <p>{(searchTerm || filterByProgram) ? 'No se encontraron subprogramas con esos filtros.' : 'No hay subprogramas registrados.'}</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>ID</th>
                  <th>Nombre del Subprograma</th>
                  <th>Programa Padre</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(sp => (
                  <tr key={sp.id}>
                    <td><span className="lp-badge lp-badge--id">{sp.id}</span></td>
                    <td><strong>{sp.spName}</strong></td>
                    <td><span className="lp-badge lp-badge--primary">{getProgramName(sp.programId)}</span></td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/sub-programs/edit/${sp.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(sp.id!)}
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

      {!loading && (
        <div className="lp-count">
          Total: {filtered.length} subprograma(s)
          {filterByProgram && <span>  Filtrado por: {getProgramName(filterByProgram as number)}</span>}
        </div>
      )}
    </div>
  )
}