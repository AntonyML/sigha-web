import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SubProgram } from '../../../types/subProgram';
import type { Program } from '../../../types/program';
import { subProgramService } from '../../../services/subProgramService';
import { programService } from '../../../services/programService';

export default function SubProgramListPage() {
  const [subPrograms, setSubPrograms] = useState<SubProgram[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByProgram, setFilterByProgram] = useState<number | ''>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [subProgramsData, programsData] = await Promise.all([
        subProgramService.getAllSubPrograms(),
        programService.getAllPrograms()
      ]);
      setSubPrograms(subProgramsData);
      setPrograms(programsData);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('¿Está seguro de que desea eliminar este subprograma?')) {
      try {
        await subProgramService.deleteSubProgram(id);
        await loadData();
        alert('Subprograma eliminado exitosamente');
      } catch (error) {
        console.error('❌ Error eliminando subprograma:', error);
        alert('Error al eliminar el subprograma');
      }
    }
  }

  const filteredSubPrograms = subPrograms.filter(subProgram => {
    const matchesSearch = subProgram.spName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = filterByProgram === '' || subProgram.programId === filterByProgram;
    return matchesSearch && matchesProgram;
  });

  function getProgramName(programId: number): string {
    const program = programs.find(p => p.id === programId);
    return program ? program.pName : 'Programa no encontrado';
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-diagram-2 me-2"></i>
          Gestión de Subprogramas
        </h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/sub-programs/create')}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nuevo Subprograma
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/main-menu')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Menú Principal
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h5 className="mb-0">Lista de Subprogramas</h5>
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar subprogramas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterByProgram}
                onChange={(e) => setFilterByProgram(e.target.value ? parseInt(e.target.value) : '')}
              >
                <option value="">Todos los programas</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.pName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : filteredSubPrograms.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="mt-3 text-muted">
                {searchTerm || filterByProgram ? 'No se encontraron subprogramas que coincidan con los filtros' : 'No hay subprogramas registrados'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nombre del Subprograma</th>
                    <th>Programa Padre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubPrograms.map((subProgram) => (
                    <tr key={subProgram.id}>
                      <td>
                        <span className="badge bg-secondary">{subProgram.id}</span>
                      </td>
                      <td>
                        <strong>{subProgram.spName}</strong>
                      </td>
                      <td>
                        <span className="badge bg-primary">
                          {getProgramName(subProgram.programId)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-success"
                            onClick={() => navigate(`/sub-programs/edit/${subProgram.id}`)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(subProgram.id!)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-muted small">
        Total: {filteredSubPrograms.length} subprograma(s)
        {filterByProgram && (
          <span> • Filtrado por: {getProgramName(filterByProgram)}</span>
        )}
      </div>
    </div>
  );
}