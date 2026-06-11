import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateProgramData, SubProgram } from '../../../types/program';
import { programService } from '../../../services/programService';
import { defaultProgram, PROGRAM_TYPE_MAP, PROGRAM_STATUS_MAP } from '../../../types/program';

export default function CreateProgramPage() {
  const [formData, setFormData] = useState<CreateProgramData>(defaultProgram);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [subPrograms, setSubPrograms] = useState<Pick<SubProgram, 'spName'>[]>([]);
  const [newSubProgramName, setNewSubProgramName] = useState('');
  const navigate = useNavigate();

  function onInputChange(field: keyof CreateProgramData, value: string | number) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function addSubProgram() {
    if (!newSubProgramName.trim()) {
      alert('Ingrese un nombre para el subprograma');
      return;
    }
    
    setSubPrograms(prev => [...prev, { spName: newSubProgramName.trim() }]);
    setNewSubProgramName('');
  }

  // Eliminar subprograma
  function removeSubProgram(index: number) {
    setSubPrograms(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.p_name.trim()) {
      alert('El nombre del programa es requerido');
      return;
    }

    if (!formData.p_description.trim()) {
      alert('La descripción del programa es requerida');
      return;
    }

    if (!formData.p_start_date) {
      alert('La fecha de inicio es requerida');
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      console.log('📤 Creando programa:', formData);

      await programService.createProgram(formData);

      navigate('/programs');
    } catch (error: any) {
      console.error('❌ Error creando programa:', error);
      const status = error?.response?.status
      if (status === 409) {
        setSubmitError('Ya existe un programa con ese nombre. Por favor elija un nombre diferente.')
      } else {
        setSubmitError('Error al crear el programa. Por favor, inténtelo de nuevo.')
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
                    <label htmlFor="p_name" className="form-label">
                      Nombre del Programa <span className="text-danger">*</span>
                    </label>
                    <input
                      id="p_name"
                      type="text"
                      className="form-control"
                      value={formData.p_name}
                      onChange={(e) => onInputChange('p_name', e.target.value)}
                      placeholder="Ingrese el nombre del programa"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="p_type" className="form-label">
                      Tipo de Programa <span className="text-danger">*</span>
                    </label>
                    <select
                      id="p_type"
                      className="form-select"
                      value={formData.p_type}
                      onChange={(e) => onInputChange('p_type', e.target.value)}
                      required
                    >
                      {Object.entries(PROGRAM_TYPE_MAP).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="p_status" className="form-label">
                      Estado <span className="text-danger">*</span>
                    </label>
                    <select
                      id="p_status"
                      className="form-select"
                      value={formData.p_status}
                      onChange={(e) => onInputChange('p_status', e.target.value)}
                      required
                    >
                      {Object.entries(PROGRAM_STATUS_MAP).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label htmlFor="p_description" className="form-label">
                      Descripción <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="p_description"
                      className="form-control"
                      rows={4}
                      value={formData.p_description}
                      onChange={(e) => onInputChange('p_description', e.target.value)}
                      placeholder="Describa los objetivos y actividades del programa"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="p_start_date" className="form-label">
                      Fecha de Inicio <span className="text-danger">*</span>
                    </label>
                    <input
                      id="p_start_date"
                      type="date"
                      className="form-control"
                      value={formData.p_start_date}
                      onChange={(e) => onInputChange('p_start_date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="p_end_date" className="form-label">
                      Fecha de Finalización
                    </label>
                    <input
                      id="p_end_date"
                      type="date"
                      className="form-control"
                      value={formData.p_end_date || ''}
                      onChange={(e) => onInputChange('p_end_date', e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="p_budget" className="form-label">
                      Presupuesto (₡)
                    </label>
                    <input
                      id="p_budget"
                      type="number"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={formData.p_budget || ''}
                      onChange={(e) => onInputChange('p_budget', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="p_observations" className="form-label">
                      Observaciones
                    </label>
                    <textarea
                      id="p_observations"
                      className="form-control"
                      rows={3}
                      value={formData.p_observations || ''}
                      onChange={(e) => onInputChange('p_observations', e.target.value)}
                      placeholder="Notas adicionales sobre el programa"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Subprogramas */}
            <div className="card mt-3">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-diagram-3 me-2"></i>
                  Subprogramas (Opcional)
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted small">
                  Agregue subprogramas específicos que pertenezcan a este programa principal.
                </p>
                
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre del subprograma"
                    value={newSubProgramName}
                    onChange={(e) => setNewSubProgramName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubProgram())}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={addSubProgram}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>

                {subPrograms.length > 0 && (
                  <div className="mb-3">
                    <label className="form-label">Subprogramas agregados:</label>
                    <ul className="list-group">
                      {subPrograms.map((subProgram, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>{subProgram.spName}</span>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeSubProgram(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subPrograms.length === 0 && (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-diagram-3 fs-1 d-block mb-2"></i>
                    <small>No hay subprogramas agregados</small>
                  </div>
                )}
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
                  <strong>Campos requeridos:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Nombre del programa</li>
                    <li>Tipo de programa</li>
                    <li>Descripción</li>
                    <li>Fecha de inicio</li>
                  </ul>
                </div>
                
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>Subprogramas:</strong> Puede agregar subprogramas específicos que se asociarán a este programa.
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