import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { nursingService } from '../../../services/nursingService';
import { virtualFileService } from '../../../services/virtualFileService';
import type { AppointmentType, AppointmentPriority, CreateAppointmentDto } from '../../../types/nursing';
import { appointmentTypeLabels, appointmentPriorityLabels } from '../../../types/nursing';
import type { PatientBasicInfo } from '../../../types/virtualFile';

interface AppointmentForm {
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: AppointmentType;
  priority: AppointmentPriority;
  reason: string;
  notes: string;
}

const defaultAppointmentForm: AppointmentForm = {
  patientId: '',
  appointmentDate: '',
  appointmentTime: '',
  type: 'checkup',
  priority: 'medium',
  reason: '',
  notes: ''
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
  const [patients, setPatients] = useState<PatientBasicInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientBasicInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId');

  useEffect(() => {
    // Si hay un paciente preseleccionado, cargarlo
    if (preselectedPatientId) {
      loadPreselectedPatient(preselectedPatientId);
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

  const loadPreselectedPatient = async (patientId: string) => {
    setSearchLoading(true);
    try {
      // Buscar el paciente por ID usando una búsqueda vacía que traerá resultados
      // Luego filtrar por ID. Como no hay endpoint directo para obtener un paciente por ID,
      // usamos el historial de citas para obtener la info del paciente
      const appointments = await nursingService.getAppointmentsByPatientId(parseInt(patientId));
      if (appointments && appointments.length > 0 && appointments[0].patient) {
        const patientInfo: PatientBasicInfo = {
          id: parseInt(patientId),
          identification: appointments[0].patient.identification,
          name: appointments[0].patient.name,
          firstLastName: appointments[0].patient.firstLastName,
          secondLastName: appointments[0].patient.secondLastName,
          fullName: `${appointments[0].patient.name} ${appointments[0].patient.firstLastName} ${appointments[0].patient.secondLastName}`,
          birthdate: '',
          gender: '',
          phone: '',
          email: '',
          status: 'alive'
        };
        setPatients([patientInfo]);
        setSelectedPatient(patientInfo);
      }
    } catch (error) {
      console.warn('No se pudo cargar el paciente preseleccionado:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadPatients = async () => {
    if (!searchTerm.trim()) {
      setPatients([]);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await virtualFileService.searchPatientsBasic(searchTerm);
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Error al buscar pacientes',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchPatients = () => {
    loadPatients();
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Debe seleccionar un paciente';
    }

    if (!formData.type) {
      newErrors.appointmentType = 'Debe seleccionar el tipo de cita';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'La fecha de la cita es obligatoria';
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
          <p><strong>Paciente:</strong> ${selectedPatient?.fullName}</p>
          <p><strong>Fecha:</strong> ${new Date(formData.appointmentDate + 'T' + formData.appointmentTime).toLocaleString('es-ES')}</p>
          <p><strong>Tipo:</strong> ${appointmentTypeLabels[formData.type]}</p>
          <p><strong>Prioridad:</strong> ${appointmentPriorityLabels[formData.priority]}</p>
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
      const payload: CreateAppointmentDto = {
        saAppointmentDate: `${formData.appointmentDate} ${formData.appointmentTime}`,
        saAppointmentType: formData.type,
        saPriority: formData.priority,
        saNotes: formData.reason + (formData.notes ? `\n\n${formData.notes}` : ''),
        saDurationMinutes: 30,
        idArea: 1,
        idPatient: parseInt(formData.patientId),
        idStaff: 1
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
            className="btn btn-outline-secondary"
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
              Seleccionar Paciente
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="searchTerm" className="form-label">Buscar Paciente *</label>
                <div className="input-group">
                  <input
                    id="searchTerm"
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre o identificación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchPatients()}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="button"
                    onClick={handleSearchPatients}
                    disabled={searchLoading || !searchTerm.trim()}
                  >
                    {searchLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <><i className="bi bi-search me-1"></i>Buscar</>
                    )}
                  </button>
                </div>
              </div>

              {patients.length > 0 && (
                <div className="col-12">
                  <label className="form-label">Seleccione un paciente de los resultados</label>
                  <div className="list-group">
                    {patients.map(patient => (
                      <button
                        key={patient.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${formData.patientId === patient.id.toString() ? 'active' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, patientId: patient.id.toString() }));
                          setSelectedPatient(patient);
                          setErrors(prev => ({ ...prev, patientId: undefined }));
                        }}
                      >
                        <div className="d-flex w-100 justify-content-between">
                          <h6 className="mb-1">{patient.fullName}</h6>
                          <small>{patient.birthdate ? `${calculateAge(patient.birthdate)} años` : ''}</small>
                        </div>
                        <p className="mb-1">
                          <small><strong>ID:</strong> {patient.identification}</small>
                          {patient.phone && <small className="ms-3"><strong>Tel:</strong> {patient.phone}</small>}
                          {patient.email && <small className="ms-3"><strong>Email:</strong> {patient.email}</small>}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedPatient && (
                <div className="col-12">
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    <strong>Paciente seleccionado:</strong> {selectedPatient.fullName} (ID: {selectedPatient.identification})
                  </div>
                </div>
              )}

              {errors.patientId && <div className="col-12"><div className="text-danger"><small>{errors.patientId}</small></div></div>}
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
              <div className="col-md-4">
                <label htmlFor="type" className="form-label">Tipo de Cita *</label>
                <select
                  id="type"
                  className={`form-select ${errors.appointmentType ? 'is-invalid' : ''}`}
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value as AppointmentType)}
                  required
                >
                  <option value="checkup">Chequeo</option>
                  <option value="evaluation">Evaluación</option>
                  <option value="therapy">Terapia</option>
                  <option value="follow_up">Seguimiento</option>
                  <option value="emergency">Emergencia</option>
                </select>
                {errors.appointmentType && <div className="invalid-feedback">{errors.appointmentType}</div>}
              </div>

              <div className="col-md-2">
                <label htmlFor="priority" className="form-label">Prioridad *</label>
                <select
                  id="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value as AppointmentPriority)}
                  required
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
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
                <label htmlFor="reason" className="form-label">Motivo Principal de la Cita *</label>
                <textarea
                  id="reason"
                  className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  placeholder="Ej: Chequeo de rutina, evaluación de estado físico, etc."
                  required
                />
                {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
              </div>

              <div className="col-12">
                <label htmlFor="notes" className="form-label">Notas Adicionales</label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Síntomas, observaciones, información adicional relevante (opcional)..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-success" 
            style={{ backgroundColor: '#198754', borderColor: '#198754', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#157347'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#198754'}
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
            className="btn btn-outline-secondary"
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