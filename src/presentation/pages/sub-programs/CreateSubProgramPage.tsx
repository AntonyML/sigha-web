import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateSubProgramData } from '../../../types/subProgram';
import type { Program } from '../../../types/program';
import { subProgramService } from '../../../services/subProgramService';
import { programService } from '../../../services/programService';
import { defaultSubProgram } from '../../../types/subProgram';

export default function CreateSubProgramPage() {
  const [formData, setFormData] = useState<CreateSubProgramData>(defaultSubProgram);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    try {
      setLoadingPrograms(true);
      const programsData = await programService.getAllPrograms();
      setPrograms(programsData);
      
      // Seleccionar el primer programa por defecto
      if (programsData.length > 0 && programsData[0].id) {
        setFormData(prev => ({ ...prev, id_program: programsData[0].id! }));
      }
    } catch (error) {
      console.error('❌ Error cargando programas:', error);
      alert('Error al cargar los programas');
    } finally {
      setLoadingPrograms(false);
    }
  }

  function onInputChange(field: keyof CreateSubProgramData, value: string | number) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.spName.trim()) {
      alert('El nombre del subprograma es requerido');
      return;
    }

    if (!formData.programId) {
      alert('Debe seleccionar un programa padre');
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Creando subprograma:', formData);
      
      await subProgramService.createSubProgram(formData);
      
      alert('Subprograma creado exitosamente');
      navigate('/sub-programs');
    } catch (error) {
      console.error('❌ Error creando subprograma:', error);
      alert('Error al crear el subprograma. Por favor, inténtelo de nuevo.');
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
            Crear Nuevo Subprograma
          </h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/sub-programs')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Información del Subprograma</h5>
              </div>
              <div className="card-body">
                {loadingPrograms ? (
                  <div className="text-center p-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Cargando programas...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="spName" className="form-label">
                        Nombre del Subprograma <span className="text-danger">*</span>
                      </label>
                      <input
                        id="spName"
                        type="text"
                        className="form-control"
                        value={formData.spName}
                        onChange={(e) => onInputChange('spName', e.target.value)}
                        placeholder="Ingrese el nombre del subprograma"
                        required
                      />
                      <div className="form-text">
                        Ejemplo: Terapia Física, Actividades Grupales, Atención Médica Diaria, etc.
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="programId" className="form-label">
                        Programa Padre <span className="text-danger">*</span>
                      </label>
                      <select
                        id="programId"
                        className="form-select"
                        value={formData.programId}
                        onChange={(e) => onInputChange('programId', parseInt(e.target.value))}
                        required
                      >
                        <option value={0}>Seleccionar programa...</option>
                        {programs.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.pName}
                          </option>
                        ))}
                      </select>
                      <div className="form-text">
                        Seleccione el programa al que pertenecerá este subprograma
                      </div>
                    </div>
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
                    <li>Nombre del subprograma</li>
                    <li>Programa padre</li>
                  </ul>
                </div>
                
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Nota:</strong> Los subprogramas son actividades específicas dentro de un programa general.
                </div>

                <div className="alert alert-secondary">
                  <i className="bi bi-lightbulb me-2"></i>
                  <strong>Tip:</strong> Si no hay programas disponibles, 
                  <a href="/programs" target="_blank" className="alert-link ms-1">
                    cree uno primero
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/sub-programs')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || loadingPrograms || programs.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Crear Subprograma
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}