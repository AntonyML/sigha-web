import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nursingService } from '../../../services/nursingService';
import type { Appointment, Patient, AppointmentStatus } from '../../../types/nursing';
import { appointmentStatusLabels, appointmentTypeLabels } from '../../../types/nursing';

export default function NursingDashboard() {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        nursingService.getPendingAppointments(),
        nursingService.getAllPatients()
      ]);
      
      setPendingAppointments(appointmentsData);
      setPatients(patientsData);
    } catch (err) {
      console.error('Error loading nursing data:', err);
      setError('Error al cargar los datos de enfermería');
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

  const hasUpcomingAppointments = (patientId: number) => {
    return pendingAppointments.some(apt => apt.patientId === patientId);
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-heart-pulse me-2 text-danger"></i>
          Módulo de Enfermería
        </h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-info"
            onClick={() => navigate('/nursing/appointments/history')}
          >
            <i className="bi bi-clock-history me-2"></i>
            Ver Historial
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-warning bg-opacity-10">
              <h5 className="mb-0">
                <i className="bi bi-calendar-check me-2 text-warning"></i>
                Citas Pendientes ({pendingAppointments.length})
              </h5>
            </div>
            <div className="card-body">
              {pendingAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x fs-1 mb-3"></i>
                  <p>No hay citas pendientes</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha/Hora</th>
                        <th>Paciente</th>
                        <th>Tipo</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <small className="text-muted">
                              {formatDateTime(appointment.scheduledDate, appointment.scheduledTime)}
                            </small>
                          </td>
                          <td>
                            <div>
                              <strong>
                                {appointment.patient?.name} {appointment.patient?.firstLastName} {appointment.patient?.secondLastName}
                              </strong>
                              <br />
                              <small className="text-muted">
                                ID: {appointment.patient?.identification}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className={getTypeBadgeClass(appointment.appointmentType)}>
                              {appointmentTypeLabels[appointment.appointmentType]}
                            </span>
                          </td>
                          <td>
                            <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}} title={appointment.reason}>
                              {appointment.reason}
                            </span>
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(appointment.status)}>
                              {appointmentStatusLabels[appointment.status]}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => navigate(`/nursing/appointments/${appointment.id}/complete`)}
                                title="Atender cita"
                              >
                                <i className="bi bi-check-circle"></i>
                              </button>
                              <button 
                                className="btn btn-outline-info"
                                onClick={() => navigate(`/nursing/appointments/${appointment.id}/view`)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-warning"
                                onClick={() => navigate(`/nursing/appointments/${appointment.id}/edit`)}
                                title="Editar cita"
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
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary bg-opacity-10">
              <h5 className="mb-0">
                <i className="bi bi-people me-2 text-primary"></i>
                Lista de Pacientes ({patients.length})
              </h5>
            </div>
            <div className="card-body">
              {patients.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-person-x fs-1 mb-3"></i>
                  <p>No hay pacientes registrados</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Identificación</th>
                        <th>Nombre Completo</th>
                        <th>Edad</th>
                        <th>Teléfono</th>
                        <th>Condiciones</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => {
                        const hasAppointments = hasUpcomingAppointments(patient.id);
                        const age = calculateAge(patient.birthDate);
                        
                        return (
                          <tr key={patient.id}>
                            <td>
                              <strong>{patient.identification}</strong>
                            </td>
                            <td>
                              <div>
                                <strong>{patient.name} {patient.firstLastName} {patient.secondLastName}</strong>
                                <br />
                                <small className="text-muted">
                                  Nacimiento: {new Date(patient.birthDate).toLocaleDateString('es-ES')}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info">{age} años</span>
                            </td>
                            <td>
                              <small>{patient.phone || 'No registrado'}</small>
                            </td>
                            <td>
                              <small className="text-muted">
                                {patient.medicalConditions || 'Ninguna'}
                              </small>
                            </td>
                            <td>
                              {hasAppointments ? (
                                <span className="badge bg-warning text-dark">
                                  <i className="bi bi-clock me-1"></i>
                                  Tiene citas
                                </span>
                              ) : (
                                <span className="badge bg-success">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Sin citas
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => navigate(`/nursing/appointments/new?patientId=${patient.id}`)}
                                  title="Agendar cita"
                                >
                                  <i className="bi bi-calendar-plus"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-info"
                                  onClick={() => navigate(`/nursing/patients/${patient.id}/appointments`)}
                                  title="Ver citas del paciente"
                                >
                                  <i className="bi bi-list-ul"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => navigate(`/nursing/patients/${patient.id}/view`)}
                                  title="Ver perfil del paciente"
                                >
                                  <i className="bi bi-person"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}