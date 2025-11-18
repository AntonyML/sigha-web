import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateVaccineData } from '../../../types/vaccine';
import { vaccineService } from '../../../services/vaccineService';
import { defaultVaccine, COMMON_VACCINES } from '../../../types/vaccine';

export default function CreateVaccinePage() {
  const [formData, setFormData] = useState<CreateVaccineData>(defaultVaccine);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function onInputChange(field: keyof CreateVaccineData, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function selectCommonVaccine(vaccineName: string) {
    setFormData(prev => ({ ...prev, vName: vaccineName }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.vName.trim()) {
      alert('El nombre de la vacuna es requeridoo');
      return;
    }



    try {
      setLoading(true);
      console.log('Creando vacuna:', formData);
      
      await vaccineService.createVaccine(formData);
      
      alert('Vacuna creada exitosamente');
      navigate('/vaccines');
    } catch (error) {
      console.error(' Error creando vacuna:', error);
      alert('Error al crear la vacuna. Por favor, inténtelo de nuevo.');
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
            Crear Nueva Vacuna
          </h2>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/vaccines')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Información de la Vacuna</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="v_name" className="form-label">
                      Nombre de la Vacuna <span className="text-danger">*</span>
                    </label>
                    <input
                      id="v_name"
                      type="text"
                      className="form-control"
                      value={formData.vName}
                      onChange={(e) => onInputChange('vName', e.target.value)}
                      placeholder="Ingrese el nombre de la vacuna"
                      required
                    />
                    <div className="form-text">
                      Ejemplo: Influenza, Neumococo, COVID-19, Hepatitis B, etc.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h6 className="mb-0">Vacunas Comunes</h6>
              </div>
              <div className="card-body">
                <p className="text-muted small mb-3">
                  Haga clic en una vacuna común para llenar automáticamente el nombre:
                </p>
                <div className="d-grid gap-1">
                  {COMMON_VACCINES.map((vaccine, index) => (
                    <button
                      key={index}
                      type="button"
                      className="btn btn-outline-primary btn-sm text-start"
                      onClick={() => selectCommonVaccine(vaccine)}
                    >
                      {vaccine}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card mt-3">
              <div className="card-header">
                <h6 className="mb-0">Información</h6>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Campo requerido:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Nombre de la vacuna</li>
                  </ul>
                </div>
                
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Nota:</strong> El backend aún no está implementado. Los datos se guardan temporalmente.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/vaccines')}
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
                Crear Vacuna
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}