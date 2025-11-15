import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { nursingService } from '../../../services/nursingService';
import type { Patient, AppointmentType } from '../../../types/nursing';

interface AppointmentForm {
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: AppointmentType;
  reason: string;
  symptoms: string;
}

const defaultAppointmentForm: AppointmentForm = {
  patientId: '',
  appointmentDate: '',
  appointmentTime: '',
  type: 'consultation',
  reason: '',
  symptoms: ''
};

interface ValidationErrors {
  patientId?: string;
  appointmentType?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
}

export default function ScheduleAppointment() {
  const [formData, setFormData] = useState<AppointmentForm>(defaultAppointmentForm);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  useEffect(() => {
    loadPatients();
    if (preselectedPatientId) {
      setFormData(prev => ({ ...prev, patientId: preselectedPatientId }));
    }
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData(prev => ({
      ...prev,
      appointmentDate: tomorrow.toISOString().split('T')[0],
      appointmentTime: '09:00'
    }));
  }, [preselectedPatientId]);

  useEffect(() => {
    if (formData.patientId && patients.length > 0) {
      const patient = patients.find(p => p.id.toString() === formData.patientId);
      setSelectedPatient(patient || null);
    }
  }, [formData.patientId, patients]);

  const loadPatients = async () => {
    try {
      const data = await nursingService.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Error al cargar la lista de pacientes',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const now = new Date();
    const selectedDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);

    if (!formData.patientId) {
      newErrors.patientId = 'Debe seleccionar un paciente';
    }

    if (!formData.type) {
      newErrors.appointmentType = 'Debe seleccionar el tipo de cita';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'La fecha de la cita es obligatoria';
    } else if (selectedDateTime <= now) {
      newErrors.appointmentDate = 'La fecha y hora debe ser futura';
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'La hora de la cita es obligatoria';
    }

    if (!formData.reason?.trim()) {
      newErrors.reason = 'El motivo de la cita es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof AppointmentForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
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
      title: '¿Confirmar cita?',
      html: `
        <div class="text-start">
          <p><strong>Paciente:</strong> ${selectedPatient?.name} ${selectedPatient?.firstLastName}</p>
          <p><strong>Fecha:</strong> ${new Date(formData.appointmentDate + 'T' + formData.appointmentTime).toLocaleString('es-ES')}</p>
          <p><strong>Tipo:</strong> ${getTypeLabel(formData.type)}</p>
          <p><strong>Motivo:</strong> ${formData.reason}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, agendar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const payload = {
        patientId: parseInt(formData.patientId),
        appointmentType: formData.type,
        scheduledDate: formData.appointmentDate,
        scheduledTime: formData.appointmentTime,
        reason: formData.reason,
        notes: formData.symptoms || undefined
      };

      await nursingService.createAppointment(payload);
      
      await Swal.fire({
        title: '¡Cita agendada!',
        text: 'La cita se ha registrado correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 3000,
        timerProgressBar: true
      });

      navigate('/nursing');
    } catch (error) {
      console.error('Error creating appointment:', error);
      await Swal.fire({
        title: 'Error al agendar',
        text: 'Ocurrió un error al agendar la cita. Por favor intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: AppointmentType) => {
    const labels = {
      consultation: 'Consulta',
      medication: 'Medicación',
      vital_signs: 'Signos Vitales',
      treatment: 'Tratamiento',
      follow_up: 'Seguimiento',
      emergency: 'Emergencia'
    };
    return labels[type];
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container py-4">
      <form onSubmit={handleSubmit}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">
            <i className="bi bi-calendar-plus me-2 text-primary"></i>
            Agendar Nueva Cita
          </h3>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/nursing')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-person me-2"></i>
              Información del Paciente
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="patientId" className="form-label">Paciente *</label>
                <select
                  id="patientId"
                  className={`form-select ${errors.patientId ? 'is-invalid' : ''}`}
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  required
                >
                  <option value="">Seleccione un paciente</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id.toString()}>
                      {patient.name} {patient.firstLastName} - ID: {patient.identification}
                    </option>
                  ))}
                </select>
                {errors.patientId && <div className="invalid-feedback">{errors.patientId}</div>}
              </div>

              {selectedPatient && (
                <div className="col-12">
                  <div className="alert alert-info">
                    <strong>Paciente seleccionado:</strong><br />
                    {selectedPatient.name} {selectedPatient.firstLastName} {selectedPatient.secondLastName}<br />
                    <strong>Edad:</strong> {calculateAge(selectedPatient.birthDate)} años<br />
                    <strong>ID:</strong> {selectedPatient.identification}<br />
                    {selectedPatient.phone && <><strong>Teléfono:</strong> {selectedPatient.phone}<br /></>}
                    {selectedPatient.medicalConditions && <><strong>Condiciones médicas:</strong> {selectedPatient.medicalConditions}<br /></>}
                    {selectedPatient.allergies && <><strong>Alergias:</strong> {selectedPatient.allergies}</>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-calendar me-2"></i>
              Detalles de la Cita
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="type" className="form-label">Tipo de Cita *</label>
                <select
                  id="type"
                  className={`form-select ${errors.appointmentType ? 'is-invalid' : ''}`}
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as AppointmentType)}
                  required
                >
                  <option value="consultation">Consulta</option>
                  <option value="medication">Medicación</option>
                  <option value="vital_signs">Signos Vitales</option>
                  <option value="treatment">Tratamiento</option>
                  <option value="follow_up">Seguimiento</option>
                  <option value="emergency">Emergencia</option>
                </select>
                {errors.appointmentType && <div className="invalid-feedback">{errors.appointmentType}</div>}
              </div>

              <div className="col-md-3">
                <label htmlFor="appointmentDate" className="form-label">Fecha *</label>
                <input
                  id="appointmentDate"
                  type="date"
                  className={`form-control ${errors.appointmentDate ? 'is-invalid' : ''}`}
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                {errors.appointmentDate && <div className="invalid-feedback">{errors.appointmentDate}</div>}
              </div>

              <div className="col-md-3">
                <label htmlFor="appointmentTime" className="form-label">Hora *</label>
                <input
                  id="appointmentTime"
                  type="time"
                  className={`form-control ${errors.appointmentTime ? 'is-invalid' : ''}`}
                  value={formData.appointmentTime}
                  onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                  required
                />
                {errors.appointmentTime && <div className="invalid-feedback">{errors.appointmentTime}</div>}
              </div>

              <div className="col-12">
                <label htmlFor="reason" className="form-label">Motivo de la Cita *</label>
                <textarea
                  id="reason"
                  className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Describa el motivo de la cita..."
                  required
                />
                {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
              </div>

              <div className="col-12">
                <label htmlFor="symptoms" className="form-label">Síntomas o Notas Adicionales</label>
                <textarea
                  id="symptoms"
                  className="form-control"
                  rows={3}
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  placeholder="Describa síntomas o información adicional relevante (opcional)..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Agendando...
              </>
            ) : (
              <>
                <i className="bi bi-calendar-check me-2"></i>
                Agendar Cita
              </>
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/nursing')}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}