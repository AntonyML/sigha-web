import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateProgramData } from '../../../types/program';
import { programService } from '../../../services/programService';

export default function EditProgramPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateProgramData>({ pName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const programId = Number(id);
    if (!programId) {
      navigate('/programs');
      return;
    }
    programService
      .getProgramById(programId)
      .then((program) => setFormData({ pName: program.pName }))
      .catch(() => setLoadError('No se pudo cargar el programa. Puede que haya sido eliminado.'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  function onInputChange(value: string) {
    setFormData((prev) => ({ ...prev, pName: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.pName?.trim()) {
      alert('El nombre del programa es requerido');
      return;
    }
    const programId = Number(id);
    try {
      setSaving(true);
      setSubmitError('');
      await programService.updateProgram(programId, { pName: formData.pName.trim() });
      navigate('/programs');
    } catch (error: unknown) {
      console.error('Error actualizando programa:', error);
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setSubmitError('Ya existe un programa con ese nombre. Por favor elija un nombre diferente.');
      } else if (status === 404) {
        setSubmitError('El programa no existe o fue eliminado.');
      } else {
        setSubmitError('Error al actualizar el programa. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  }

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
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">
            <i className="bi bi-pencil-square me-2"></i>
            Editar Programa
          </h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/programs')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>

        {loadError && (
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {loadError}
          </div>
        )}

        {submitError && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {submitError}
            <button type="button" className="btn-close" onClick={() => setSubmitError('')} />
          </div>
        )}

        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Información del Programa</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="pName" className="form-label">
                      Nombre del Programa <span className="text-danger">*</span>
                    </label>
                    <input
                      id="pName"
                      type="text"
                      className="form-control"
                      maxLength={300}
                      value={formData.pName}
                      onChange={(e) => onInputChange(e.target.value)}
                      placeholder="Ingrese el nombre del programa"
                      disabled={saving}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Información</h6>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Campo requerido:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Nombre del programa</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/programs')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || Boolean(loadError)}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
