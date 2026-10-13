import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@/shared/navigation';
import { GitBranch } from 'lucide-react';
import type { Program } from '@/shared/types/program';
import { programService } from '@/infrastructure/api/services/programService';

export default function ViewProgramPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const programId = Number(id);
    if (!programId) {
      navigate('/programs');
      return;
    }
    programService
      .getProgramById(programId)
      .then(setProgram)
      .catch(() => setError('No se pudo cargar el programa. Puede que haya sido eliminado.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando programa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-eye me-2"></i>
          Detalle del Programa
        </h2>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/programs')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
          {program && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/programs/edit/${program.id}`)}
            >
              <i className="bi bi-pencil-square me-2"></i>
              Editar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {program && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Información del Programa</h5>
          </div>
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-sm-3">Nombre</dt>
              <dd className="col-sm-9">
                <strong>{program.pName}</strong>
              </dd>

              <dt className="col-sm-3">Fecha de Creación</dt>
              <dd className="col-sm-9">
                {program.createAt ? new Date(program.createAt).toLocaleDateString() : 'N/A'}
              </dd>

              <dt className="col-sm-3">Subprogramas</dt>
              <dd className="col-sm-9">
                {program.subPrograms && program.subPrograms.length > 0 ? (
                  <ul className="list-unstyled mb-0">
                    {program.subPrograms.map((subProgram) => (
                      <li key={subProgram.id} className="d-flex align-items-center gap-2">
                        <GitBranch size={14} />
                        {subProgram.spName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted">Sin subprogramas asociados</span>
                )}
              </dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
