import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nursingService } from '../../../services/nursingService';
import type { Appointment, Patient, AppointmentStatus } from '../../../types/nursing';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const loadData = async () => {
    if (!patientId) return;

    setLoading(true);
    setError('');
    
    try {
      const [appointmentsData, patientData] = await Promise.all([
        nursingService.getAppointmentsByPatient(parseInt(patientId)),
        nursingService.getPatientById(parseInt(patientId))
      ]);
      
      // Sort appointments by date descending
      const sortedAppointments = appointmentsData.sort((a, b) => 
        new Date(b.scheduledDate + 'T' + b.scheduledTime).getTime() - 
        new Date(a.scheduledDate + 'T' + a.scheduledTime).getTime()
      );
      
      setAppointments(sortedAppointments);
      setPatient(patientData);
    } catch (err) {
      console.error('Error loading patient appointments:', err);
      setError('Error al cargar las citas del paciente');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: AppointmentStatus) => {
    const classes = {
      pending: 'bg-warning text-dark',
      completed: 'bg-success',
      cancelled: 'bg-danger',
      no_show: 'bg-secondary'
    };
    return `badge ${classes[status]}`;
  };

  const getTypeBadgeClass = (type: string) => {
    const classes = {
      consultation: 'bg-primary',
      medication: 'bg-info',
      vital_signs: 'bg-success',
      treatment: 'bg-warning text-dark',
      follow_up: 'bg-secondary',
      emergency: 'bg-danger'
    };
    return `badge ${classes[type as keyof typeof classes] || 'bg-light text-dark'}`;
  };

  const formatDateTime = (date: string, time: string) => {
    const appointmentDate = new Date(`${date}T${time}`);
    return appointmentDate.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      pending: 'Pendiente',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No se presentó'
    };
    return labels[status];
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      consultation: 'Consulta',
      medication: 'Medicación',
      vital_signs: 'Signos Vitales',
      treatment: 'Tratamiento',
      follow_up: 'Seguimiento',
      emergency: 'Emergencia'
    };
    return labels[type as keyof typeof labels] || type;
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

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button 
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/nursing')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Regresar
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="bi bi-person-lines-fill me-2 text-info"></i>
          Citas del Paciente
        </h3>
        <div className="d-flex gap-2">
          <button 
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/nursing/appointments/new?patientId=${patientId}`)}
          >
            <i className="bi bi-calendar-plus me-2"></i>
            Agendar Cita
          </button>
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/nursing')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>
      </div>

      {/* Patient Info */}
      {patient && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-person me-2"></i>
              Información del Paciente
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-1">
                  <strong>Nombre completo:</strong> {patient.name} {patient.firstLastName} {patient.secondLastName}
                </p>
                <p className="mb-1">
                  <strong>Identificación:</strong> {patient.identification}
                </p>
                <p className="mb-1">
                  <strong>Edad:</strong> {calculateAge(patient.birthDate)} años
                </p>
              </div>
              <div className="col-md-6">
                {patient.phone && (
                  <p className="mb-1">
                    <strong>Teléfono:</strong> {patient.phone}
                  </p>
                )}
                {patient.emergencyContact && (
                  <p className="mb-1">
                    <strong>Contacto de emergencia:</strong> {patient.emergencyContact}
                  </p>
                )}
                {patient.medicalConditions && (
                  <p className="mb-1">
                    <strong>Condiciones médicas:</strong> {patient.medicalConditions}
                  </p>
                )}
                {patient.allergies && (
                  <p className="mb-1">
                    <strong>Alergias:</strong> {patient.allergies}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-calendar3 me-2"></i>
            Historial de Citas ({appointments.length})
          </h6>
        </div>
        <div className="card-body">
          {appointments.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-calendar-x fs-1 mb-3"></i>
              <p>Este paciente no tiene citas registradas</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/nursing/appointments/new?patientId=${patientId}`)}
              >
                <i className="bi bi-calendar-plus me-2"></i>
                Agendar Primera Cita
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Fecha/Hora</th>
                    <th>Tipo</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Diagnóstico</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <small>
                          {formatDateTime(appointment.scheduledDate, appointment.scheduledTime)}
                        </small>
                      </td>
                      <td>
                        <span className={getTypeBadgeClass(appointment.appointmentType)}>
                          {getTypeLabel(appointment.appointmentType)}
                        </span>
                      </td>
                      <td>
                        <span title={appointment.reason}>
                          {appointment.reason.length > 30 
                            ? appointment.reason.substring(0, 30) + '...'
                            : appointment.reason
                          }
                        </span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td>
                        {appointment.diagnosis ? (
                          <span title={appointment.diagnosis}>
                            {appointment.diagnosis.length > 30 
                              ? appointment.diagnosis.substring(0, 30) + '...'
                              : appointment.diagnosis
                            }
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {appointment.nurseNotes ? (
                          <span title={appointment.nurseNotes}>
                            {appointment.nurseNotes.length > 30 
                              ? appointment.nurseNotes.substring(0, 30) + '...'
                              : appointment.nurseNotes
                            }
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}