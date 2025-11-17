import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nursingService } from '../../../services/nursingService';
import type { NursingAppointment } from '../../../types/nursing';
import { 
  appointmentStatusLabels, 
  appointmentTypeLabels,
  appointmentPriorityLabels,
  appointmentStatusColors,
  appointmentTypeColors,
  appointmentPriorityColors
} from '../../../types/nursing';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<NursingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  useEffect(() => {
    if (patientId) {
      loadAppointments();
    }
  }, [patientId]);

  const loadAppointments = async () => {
    if (!patientId) return;

    setLoading(true);
    setError('');
    
    try {
      const appointmentsData = await nursingService.getAppointmentsByPatientId(parseInt(patientId));

      const sortedAppointments = appointmentsData.sort((a: NursingAppointment, b: NursingAppointment) => 
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      );
      
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error('Error loading patient appointments:', err);
      setError('Error al cargar las citas del paciente');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const appointmentDate = new Date(dateTime);
    return appointmentDate.toLocaleString('es-ES', {
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

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        <button 
          type="button"
          className="btn btn-outline-secondary"
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
            className="btn btn-success"
            style={{ backgroundColor: '#198754', borderColor: '#198754', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#157347'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#198754'}
            onClick={() => navigate(`/nursing/appointments/new?patientId=${patientId}`)}
          >
            <i className="bi bi-calendar-plus me-2"></i>
            Agendar Cita
          </button>
          <button 
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/nursing')}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>
      </div>
      {appointments.length > 0 && appointments[0].patient && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary bg-opacity-10">
            <h6 className="mb-0">
              <i className="bi bi-person me-2"></i>
              Información del Paciente
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Nombre completo:</strong><br />
                  {appointments[0].patient.name} {appointments[0].patient.firstLastName} {appointments[0].patient.secondLastName}
                </p>
                <p className="mb-0">
                  <strong>Identificación:</strong> {appointments[0].patient.identification}
                </p>
              </div>
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Total de citas:</strong> {appointments.length}
                </p>
                <p className="mb-0">
                  <strong>Citas completadas:</strong> {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <th>Prioridad</th>
                    <th>Notas</th>
                    <th>Estado</th>
                    <th>Observaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <small>
                          {formatDateTime(appointment.appointmentDate)}
                        </small>
                      </td>
                      <td>
                        <span className={`badge bg-${appointmentTypeColors[appointment.appointmentType]}`}>
                          {appointmentTypeLabels[appointment.appointmentType]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${appointmentPriorityColors[appointment.priority]}`}>
                          {appointmentPriorityLabels[appointment.priority]}
                        </span>
                      </td>
                      <td>
                        <span title={appointment.notes || ''}>
                          {appointment.notes && appointment.notes.length > 30 
                            ? appointment.notes.substring(0, 30) + '...'
                            : appointment.notes || '-'
                          }
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${appointmentStatusColors[appointment.status]}`}>
                          {appointmentStatusLabels[appointment.status]}
                        </span>
                      </td>
                      <td>
                        {appointment.observations ? (
                          <span title={appointment.observations}>
                            {appointment.observations.length > 30 
                              ? appointment.observations.substring(0, 30) + '...'
                              : appointment.observations
                            }
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const returnPath = `/nursing/patients/${patientId}/appointments`;
                              navigate(`/nursing/appointments/${appointment.id}/results?returnTo=${encodeURIComponent(returnPath)}`);
                            }}
                            disabled={appointment.status !== 'completed'}
                            title={appointment.status === 'completed' ? 'Ver resultados' : 'Cita no completada'}
                          >
                            <i className="bi bi-clipboard-data"></i>
                          </button>
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => navigate(`/nursing/appointments/${appointment.id}/view`)}
                            disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
                            title={appointment.status === 'completed' || appointment.status === 'cancelled' ? 'No se puede editar' : 'Editar cita'}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        </div>
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