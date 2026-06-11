import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clinicalConditionService } from '../../../services/clinicalConditionService';
import type { CreateClinicalConditionData } from '../../../types/clinicalCondition';

const initialForm: CreateClinicalConditionData = {
  ccName: '',
};

export default function CreateClinicalConditionPage() {
  const [form, setForm] = useState<CreateClinicalConditionData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ccName.trim()) {
      setError('El nombre de la condición clínica es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await clinicalConditionService.createClinicalCondition(form);
      setSuccess('Condición clínica creada exitosamente');
      setTimeout(() => navigate('/clinical-history'), 1500);
    } catch (err: any) {
      console.error('Error creating clinical condition:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Error al crear la condición clínica';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <div className="d-flex align-items-center mb-4 gap-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/clinical-history')}
          type="button"
        >
          <i className="bi bi-arrow-left me-1"></i>Regresar
        </button>
        <h2 className="mb-0">
          <i className="bi bi-clipboard2-plus me-2 text-primary"></i>
          Nueva Condición Clínica
        </h2>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success d-flex align-items-center">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold" htmlFor="ccName">
                Nombre de la Condición Clínica <span className="text-danger">*</span>
              </label>
              <input
                id="ccName"
                name="ccName"
                type="text"
                className="form-control"
                placeholder="Ej: Hipertensión Arterial (HTA)"
                value={form.ccName}
                onChange={handleChange}
                disabled={loading}
                maxLength={200}
                autoFocus
              />
              <div className="form-text">
                Ingrese el nombre completo o abreviatura de la condición clínica.
              </div>
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/clinical-history')}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
