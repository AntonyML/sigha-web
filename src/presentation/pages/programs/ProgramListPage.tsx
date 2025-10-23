import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Program } from '../../../types/program';
import { programService } from '../../../services/programService';

export default function ProgramListPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    try {
      setLoading(true);
      const data = await programService.getAllPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('❌ Error cargando programas:', error);
      alert('Error al cargar los programas');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (window.confirm('¿Está seguro de que desea eliminar este programa?')) {
      try {
        await programService.deleteProgram(id);
        await loadPrograms();
        alert('Programa eliminado exitosamente');
      } catch (error) {
        console.error('❌ Error eliminando programa:', error);
        alert('Error al eliminar el programa');
      }
    }
  }

  const filteredPrograms = programs.filter(program =>
    program.pName.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-diagram-3 me-2"></i>
          Gestión de Programas
        </h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/programs/create')}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nuevo Programa
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
            <div className="col-md-6">
              <h5 className="mb-0">Lista de Programas</h5>
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar programas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center p-4">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="mt-3 text-muted">
                {searchTerm ? 'No se encontraron programas que coincidan con la búsqueda' : 'No hay programas registrados'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha Creación</th>
                    <th>Subprogramas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((program) => (
                    <tr key={program.id}>
                      <td>
                        <div>
                          <strong>{program.pName}</strong>
                          <div className="text-muted small">
                            Programa creado el {program.createAt ? new Date(program.createAt).toLocaleDateString() : 'N/A'}
                          </div>
                          {program.subPrograms && program.subPrograms.length > 0 && (
                            <div className="mt-1">
                              <small className="text-info">
                                <i className="bi bi-diagram-3 me-1"></i>
                                Subprogramas: {program.subPrograms?.map(sp => sp.spName).join(', ') || 'Ninguno'}
                              </small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {program.createAt ? new Date(program.createAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {program.subPrograms?.length || 0} subprogramas
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/programs/view/${program.id}`)}
                            title="Ver detalles"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => navigate(`/programs/edit/${program.id}`)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(program.id!)}
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
        Total: {filteredPrograms.length} programa(s)
      </div>
    </div>
  );
}