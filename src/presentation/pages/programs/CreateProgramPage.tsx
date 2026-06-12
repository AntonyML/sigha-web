import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateProgramData } from '../../../types/program';
import { programService } from '../../../services/programService';

export default function CreateProgramPage() {
  const [formData, setFormData] = useState<CreateProgramData>({ pName: '' });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  function onInputChange(field: keyof CreateProgramData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.pName.trim()) {
      alert('El nombre del programa es requerido');
      return;
    }
    try {
      setLoading(true);
      setSubmitError('');
      await programService.createProgram(formData);
      navigate('/programs');
    } catch (error: unknown) {
      console.error('Error creando programa:', error);
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setSubmitError('Ya existe un programa con ese nombre. Por favor elija un nombre diferente.');
      } else {
        setSubmitError('Error al crear el programa. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">
            <i className="bi bi-plus-lg me-2"></i>
            Crear Nuevo Programa
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
                      onChange={(e) => onInputChange('pName', e.target.value)}
                      placeholder="Ingrese el nombre del programa"
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
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Crear Programa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
