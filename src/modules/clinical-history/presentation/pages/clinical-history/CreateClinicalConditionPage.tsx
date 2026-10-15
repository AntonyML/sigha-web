import { getApiErrorMessage } from '@/shared/lib/apiError';
import { useState } from 'react';
import { useNavigate } from '@/shared/navigation';
import { clinicalConditionService } from '@/infrastructure/api/services/clinicalConditionService';
import type { CreateClinicalConditionData } from '@/shared/types/clinicalCondition';

const initialForm: CreateClinicalConditionData = {
  ccName: '',
};

const ICD10_COMMON_CONDITIONS = [
  { code: 'I10', name: 'Hipertensión esencial (primaria)' },
  { code: 'E11', name: 'Diabetes mellitus tipo 2' },
  { code: 'E78.0', name: 'Hipercolesterolemia pura / Dislipidemia' },
  { code: 'N18', name: 'Enfermedad renal crónica' },
  { code: 'I25', name: 'Enfermedad isquémica crónica del corazón' },
  { code: 'I64', name: 'Accidente vascular encefálico (ACV)' },
  { code: 'G20', name: 'Enfermedad de Parkinson' },
  { code: 'F03', name: 'Demencia, no especificada' },
  { code: 'N40', name: 'Hiperplasia de la próstata' },
  { code: 'R32', name: 'Incontinencia urinaria, no especificada' },
  { code: 'R29.6', name: 'Tendencia a las caídas' },
  { code: 'M81', name: 'Osteoporosis sin fractura patológica' },
  { code: 'J44', name: 'Enfermedad pulmonar obstructiva crónica (EPOC)' },
  { code: 'F32', name: 'Episodio depresivo' },
  { code: 'H54', name: 'Ceguera y disminución de la agudeza visual' },
  { code: 'Z89', name: 'Amputación de miembro' },
  { code: 'F17', name: 'Dependencia al tabaco' },
  { code: 'F10', name: 'Dependencia al alcohol' },
];

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
    } catch (err: unknown) {
      console.error('Error creating clinical condition:', err);
      setError(getApiErrorMessage(err, 'Error al crear la condición clínica'));
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
                Nombre de la Condición Clínica (CIE-10) <span className="text-danger">*</span>
              </label>
              <input
                id="ccName"
                name="ccName"
                list="icd10-catalog"
                type="text"
                className="form-control"
                placeholder="Buscar por código o descripción... Ej: I10 - Hipertensión"
                value={form.ccName}
                onChange={handleChange}
                disabled={loading}
                maxLength={200}
                autoFocus
              />
              <datalist id="icd10-catalog">
                {ICD10_COMMON_CONDITIONS.map(c => (
                  <option key={c.code} value={`${c.name} (${c.code})`} />
                ))}
              </datalist>
              <div className="form-text">
                Seleccione una patología estándar según CIE-10 (OMS) o ingrese una condición personalizada.
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
