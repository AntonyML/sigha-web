import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { nursingService } from '../../../services/nursingService';
import type { NursingAppointment, CompleteAppointmentDto, Mobility, QualityLevel } from '../../../types/nursing';
import { 
  appointmentStatusLabels, 
  appointmentTypeLabels,
  appointmentStatusColors
} from '../../../types/nursing';

export default function CompleteAppointment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<NursingAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<CompleteAppointmentDto>({
    nrTemperature: undefined,
    nrBloodPressure: '',
    nrHeartRate: undefined,
    nrPainLevel: 0,
    nrMobility: 'independent',
    nrAppetite: 'good',
    nrSleepQuality: 'good',
    nrNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadAppointmentDetails();
    }
  }, [id]);

  const loadAppointmentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await nursingService.getNursingAppointments();
      const found = data.find(apt => apt.id === parseInt(id!));
      if (found) {
        setAppointment(found);
        if (found.status === 'completed') {
          setError('Esta cita ya ha sido completada');
        } else if (found.status === 'cancelled') {
          setError('Esta cita ha sido cancelada');
        }
      } else {
        setError('Cita no encontrada');
      }
    } catch (err) {
      console.error('Error loading appointment:', err);
      setError('Error al cargar los detalles de la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompleteAppointmentDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.nrTemperature && (formData.nrTemperature < 30 || formData.nrTemperature > 45)) {
      newErrors.nrTemperature = 'Temperatura fuera de rango válido (30-45°C)';
    }

    if (formData.nrBloodPressure && !formData.nrBloodPressure.match(/^\d{2,3}\/\d{2,3}$/)) {
      newErrors.nrBloodPressure = 'Formato inválido. Use formato: 120/80';
    }

    if (formData.nrHeartRate && (formData.nrHeartRate < 30 || formData.nrHeartRate > 200)) {
      newErrors.nrHeartRate = 'Frecuencia cardíaca fuera de rango válido (30-200 bpm)';
    }

    if (formData.nrPainLevel !== undefined && (formData.nrPainLevel < 0 || formData.nrPainLevel > 10)) {
      newErrors.nrPainLevel = 'Nivel de dolor debe estar entre 0 y 10';
    }

    if (!formData.nrNotes?.trim()) {
      newErrors.nrNotes = 'Las notas son obligatorias';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      await Swal.fire({
        title: 'Errores en el formulario',
        text: 'Por favor corrige los errores antes de continuar',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Completar cita?',
      html: `
        <div class="text-start">
          <p><strong>Paciente:</strong> ${appointment?.patient?.name} ${appointment?.patient?.firstLastName}</p>
          <p><strong>Tipo:</strong> ${appointment ? appointmentTypeLabels[appointment.appointmentType] : ''}</p>
          <p class="text-muted small">Esta acción marcará la cita como completada y guardará el registro de enfermería.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);

    try {
      await nursingService.completeAppointment(parseInt(id!), formData);
      
      await Swal.fire({
        title: '¡Cita completada!',
        text: 'La cita se ha completado y el registro de enfermería ha sido guardado',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });

      navigate('/nursing');
    } catch (err) {
      console.error('Error completing appointment:', err);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo completar la cita. Intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || 'No se pudo cargar la información de la cita'}
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/nursing')}>
          <i className="bi bi-arrow-left me-2"></i>
          Regresar
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">
            <i className="bi bi-check-circle me-2 text-success"></i>
            Completar Cita de Enfermería
          </h3>
          <button 
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/nursing')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>

        {/* Información de la Cita */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-info bg-opacity-10">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Información de la Cita
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <p className="mb-2">
                  <strong>Paciente:</strong><br />
                  {appointment.patient?.name} {appointment.patient?.firstLastName} {appointment.patient?.secondLastName}
                </p>
                <p className="mb-0">
                  <strong>ID:</strong> {appointment.patient?.identification}
                </p>
              </div>
              <div className="col-md-4">
                <p className="mb-2">
                  <strong>Tipo de Cita:</strong><br />
                  <span className="badge bg-primary">
                    {appointmentTypeLabels[appointment.appointmentType]}
                  </span>
                </p>
                <p className="mb-0">
                  <strong>Estado:</strong>{' '}
                  <span className={`badge bg-${appointmentStatusColors[appointment.status]}`}>
                    {appointmentStatusLabels[appointment.status]}
                  </span>
                </p>
              </div>
              <div className="col-md-4">
                <p className="mb-2">
                  <strong>Fecha y Hora:</strong><br />
                  {formatDateTime(appointment.appointmentDate)}
                </p>
                <p className="mb-0">
                  <strong>Área:</strong> {appointment.area?.name || 'No especificada'}
                </p>
              </div>
            </div>
            {appointment.notes && (
              <div className="row mt-3">
                <div className="col-12">
                  <p className="mb-1"><strong>Notas de la cita:</strong></p>
                  <div className="alert alert-light mb-0">
                    {appointment.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Signos Vitales */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-danger bg-opacity-10">
            <h6 className="mb-0">
              <i className="bi bi-heart-pulse me-2"></i>
              Signos Vitales
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="temperature" className="form-label">
                  Temperatura (°C)
                  <i className="bi bi-info-circle ms-1 text-muted" title="Rango normal: 36-37.5°C"></i>
                </label>
                <input
                  id="temperature"
                  type="number"
                  step="0.1"
                  className={`form-control ${errors.nrTemperature ? 'is-invalid' : ''}`}
                  value={formData.nrTemperature || ''}
                  onChange={(e) => handleInputChange('nrTemperature', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="36.5"
                />
                {errors.nrTemperature && <div className="invalid-feedback">{errors.nrTemperature}</div>}
              </div>

              <div className="col-md-3">
                <label htmlFor="bloodPressure" className="form-label">
                  Presión Arterial
                  <i className="bi bi-info-circle ms-1 text-muted" title="Formato: 120/80"></i>
                </label>
                <input
                  id="bloodPressure"
                  type="text"
                  className={`form-control ${errors.nrBloodPressure ? 'is-invalid' : ''}`}
                  value={formData.nrBloodPressure || ''}
                  onChange={(e) => handleInputChange('nrBloodPressure', e.target.value)}
                  placeholder="120/80"
                />
                {errors.nrBloodPressure && <div className="invalid-feedback">{errors.nrBloodPressure}</div>}
              </div>

              <div className="col-md-3">
                <label htmlFor="heartRate" className="form-label">
                  Frecuencia Cardíaca (bpm)
                  <i className="bi bi-info-circle ms-1 text-muted" title="Rango normal: 60-100 bpm"></i>
                </label>
                <input
                  id="heartRate"
                  type="number"
                  className={`form-control ${errors.nrHeartRate ? 'is-invalid' : ''}`}
                  value={formData.nrHeartRate || ''}
                  onChange={(e) => handleInputChange('nrHeartRate', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="75"
                />
                {errors.nrHeartRate && <div className="invalid-feedback">{errors.nrHeartRate}</div>}
              </div>

              <div className="col-md-3">
                <label htmlFor="painLevel" className="form-label">
                  Nivel de Dolor (0-10) *
                </label>
                <input
                  id="painLevel"
                  type="range"
                  className="form-range"
                  min="0"
                  max="10"
                  value={formData.nrPainLevel || 0}
                  onChange={(e) => handleInputChange('nrPainLevel', parseInt(e.target.value))}
                />
                <div className="text-center">
                  <span className="badge bg-primary fs-6">{formData.nrPainLevel || 0}/10</span>
                </div>
                {errors.nrPainLevel && <div className="text-danger small">{errors.nrPainLevel}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Evaluación del Paciente */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary bg-opacity-10">
            <h6 className="mb-0">
              <i className="bi bi-clipboard-check me-2"></i>
              Evaluación del Paciente
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="mobility" className="form-label">Movilidad *</label>
                <select
                  id="mobility"
                  className="form-select"
                  value={formData.nrMobility || 'independent'}
                  onChange={(e) => handleInputChange('nrMobility', e.target.value as Mobility)}
                  required
                >
                  <option value="independent">Independiente</option>
                  <option value="assisted">Asistido</option>
                  <option value="bedridden">Postrado en cama</option>
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="appetite" className="form-label">Apetito *</label>
                <select
                  id="appetite"
                  className="form-select"
                  value={formData.nrAppetite || 'good'}
                  onChange={(e) => handleInputChange('nrAppetite', e.target.value as QualityLevel)}
                  required
                >
                  <option value="good">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="poor">Malo</option>
                </select>
              </div>

              <div className="col-md-4">
                <label htmlFor="sleepQuality" className="form-label">Calidad del Sueño *</label>
                <select
                  id="sleepQuality"
                  className="form-select"
                  value={formData.nrSleepQuality || 'good'}
                  onChange={(e) => handleInputChange('nrSleepQuality', e.target.value as QualityLevel)}
                  required
                >
                  <option value="good">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="poor">Malo</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notas del Registro */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-warning bg-opacity-10">
            <h6 className="mb-0">
              <i className="bi bi-journal-text me-2"></i>
              Notas del Registro de Enfermería
            </h6>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="notes" className="form-label">
                Observaciones y Notas *
                <small className="text-muted ms-2">(Describa el estado general, observaciones importantes, recomendaciones)</small>
              </label>
              <textarea
                id="notes"
                className={`form-control ${errors.nrNotes ? 'is-invalid' : ''}`}
                rows={5}
                value={formData.nrNotes || ''}
                onChange={(e) => handleInputChange('nrNotes', e.target.value)}
                placeholder="Paciente en condiciones estables. Signos vitales normales. Continuar con tratamiento actual..."
                required
              />
              {errors.nrNotes && <div className="invalid-feedback">{errors.nrNotes}</div>}
            </div>
            <div className="alert alert-info mb-0">
              <i className="bi bi-lightbulb me-2"></i>
              <strong>Sugerencia:</strong> Incluya información sobre el estado general del paciente, cualquier cambio observado, 
              reacciones a medicamentos, y recomendaciones para el cuidado continuo.
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-success btn-lg"
            style={{ backgroundColor: '#198754', borderColor: '#198754', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#157347'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#198754'}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Completando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Completar Cita
              </>
            )}
          </button>
          <button 
            type="button"
            className="btn btn-outline-secondary btn-lg"
            onClick={() => navigate('/nursing')}
            disabled={submitting}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </button>
        </div>

        <div className="alert alert-warning mt-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <strong>Importante:</strong> Una vez completada la cita, esta acción no se puede deshacer. 
          Asegúrese de que toda la información sea correcta antes de continuar.
        </div>
      </form>
    </div>
  );
}
