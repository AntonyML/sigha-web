import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nursingService } from '../../../services/nursingService';
import { virtualFileService } from '../../../services/virtualFileService';
import type { NursingAppointment } from '../../../types/nursing';
import { 
  appointmentStatusLabels, 
  appointmentTypeLabels, 
  appointmentPriorityLabels,
  appointmentStatusColors,
  appointmentPriorityColors,
  appointmentTypeColors
} from '../../../types/nursing';
import type { PatientBasicInfo } from '../../../types/virtualFile';

export default function NursingDashboard() {
  const [pendingAppointments, setPendingAppointments] = useState<NursingAppointment[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientBasicInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const loadPendingAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const appointmentsData = await nursingService.getPendingAppointments();
      setPendingAppointments(appointmentsData);
    } catch (err) {
      console.error('Error loading pending appointments:', err);
      setError('Error al cargar las citas pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredPatients([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await virtualFileService.searchPatientsBasic(searchTerm.trim());
      setFilteredPatients(results);
    } catch (err) {
      console.error('Error searching patients:', err);
      setError('Error al buscar pacientes');
      setFilteredPatients([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
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

  return (
    <div className="container-fluid py-4">
      {/* Header con título y botones de acción */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-heart-pulse me-2 text-danger"></i>
          Módulo de Enfermería
        </h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success"
            onClick={() => navigate('/nursing/appointments/new')}
          >
            <i className="bi bi-calendar-plus me-2"></i>
            Crear Cita
          </button>
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate('/nursing/appointments/history')}
          >
            <i className="bi bi-clock-history me-2"></i>
            Citas Pasadas
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Tabla de Citas Pendientes */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-warning bg-opacity-10 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-calendar-check me-2 text-warning"></i>
                Citas Pendientes
                {pendingAppointments.length > 0 && (
                  <span className="badge bg-warning text-dark ms-2">
                    {pendingAppointments.length}
                  </span>
                )}
              </h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={loadPendingAppointments}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Actualizar
              </button>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando citas...</span>
                  </div>
                  <p className="mt-2 text-muted">Cargando citas pendientes...</p>
                </div>
              ) : pendingAppointments.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
                  <p className="mb-0">No hay citas pendientes</p>
                  <small>Las citas programadas aparecerán aquí</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '15%' }}>Fecha/Hora</th>
                        <th style={{ width: '20%' }}>Paciente</th>
                        <th style={{ width: '12%' }}>Tipo</th>
                        <th style={{ width: '10%' }}>Prioridad</th>
                        <th style={{ width: '23%' }}>Notas</th>
                        <th style={{ width: '10%' }}>Estado</th>
                        <th style={{ width: '10%' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div className="d-flex flex-column">
                              <small className="fw-bold">
                                {formatDateTime(appointment.appointmentDate)}
                              </small>
                              {appointment.durationMinutes && (
                                <small className="text-muted">
                                  <i className="bi bi-clock me-1"></i>
                                  {appointment.durationMinutes} min
                                </small>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-bold">
                                {appointment.patient?.name} {appointment.patient?.firstLastName}
                              </div>
                              <small className="text-muted">
                                {appointment.patient?.identification}
                              </small>
                            </div>
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
                            <small className="text-truncate d-block" style={{ maxWidth: '250px' }}>
                              {appointment.notes || 'Sin notas'}
                            </small>
                          </td>
                          <td>
                            <span className={`badge bg-${appointmentStatusColors[appointment.status]}`}>
                              {appointmentStatusLabels[appointment.status]}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => navigate(`/nursing/appointments/${appointment.id}/view`)}
                                title="Ver detalles"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button 
                                className="btn btn-outline-success"
                                onClick={() => navigate(`/nursing/appointments/${appointment.id}/complete`)}
                                title="Completar cita"
                              >
                                <i className="bi bi-check-circle"></i>
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

      {/* Buscador de Pacientes */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary bg-opacity-10">
              <h5 className="mb-0">
                <i className="bi bi-search me-2 text-primary"></i>
                Buscar Pacientes
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-10">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nombre, apellido o identificación..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      disabled={searchLoading}
                    />
                  </div>
                  <small className="text-muted">
                    Ingrese el nombre, apellido o número de identificación del paciente y presione Enter o haga clic en Buscar
                  </small>
                </div>
                <div className="col-md-2">
                  <button 
                    className="btn btn-primary w-100"
                    onClick={handleSearch}
                    disabled={searchLoading || !searchTerm.trim()}
                  >
                    {searchLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Buscando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-search me-2"></i>
                        Buscar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Pacientes (resultados de búsqueda) */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info bg-opacity-10">
              <h5 className="mb-0">
                <i className="bi bi-people me-2 text-info"></i>
                Lista de Pacientes
                {filteredPatients.length > 0 && (
                  <span className="badge bg-info ms-2">
                    {filteredPatients.length} resultado{filteredPatients.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h5>
            </div>
            <div className="card-body p-0">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-person-x fs-1 mb-3 d-block"></i>
                  <p className="mb-0">No hay resultados</p>
                  <small>Utilice el buscador para encontrar pacientes</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '12%' }}>Identificación</th>
                        <th style={{ width: '25%' }}>Nombre Completo</th>
                        <th style={{ width: '10%' }}>Edad</th>
                        <th style={{ width: '12%' }}>Género</th>
                        <th style={{ width: '15%' }}>Teléfono</th>
                        <th style={{ width: '10%' }}>Estado</th>
                        <th style={{ width: '16%' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map((patient) => {
                        const age = patient.birthdate ? calculateAge(patient.birthdate) : null;
                        
                        return (
                          <tr key={patient.id}>
                            <td>
                              <strong>{patient.identification}</strong>
                            </td>
                            <td>
                              <div>
                                <div className="fw-bold">{patient.fullName}</div>
                                {patient.birthdate && (
                                  <small className="text-muted">
                                    Nacimiento: {new Date(patient.birthdate).toLocaleDateString('es-ES')}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              {age !== null && (
                                <span className="badge bg-info">{age} años</span>
                              )}
                            </td>
                            <td>
                              <small className="text-capitalize">{patient.gender || 'N/A'}</small>
                            </td>
                            <td>
                              <small>{patient.phone || 'No registrado'}</small>
                            </td>
                            <td>
                              <span className={`badge ${patient.status === 'alive' ? 'bg-success' : 'bg-secondary'}`}>
                                {patient.status === 'alive' ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => navigate(`/nursing/appointments/new?patientId=${patient.id}`)}
                                  title="Crear cita para este paciente"
                                >
                                  <i className="bi bi-calendar-plus"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-info"
                                  onClick={() => navigate(`/nursing/patients/${patient.id}/appointments`)}
                                  title="Ver historial de citas"
                                >
                                  <i className="bi bi-list-ul"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-secondary"
                                  onClick={() => navigate(`/virtualFiles/view/${patient.id}`)}
                                  title="Ver expediente virtual"
                                >
                                  <i className="bi bi-folder2-open"></i>
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