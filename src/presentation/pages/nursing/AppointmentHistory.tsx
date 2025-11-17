import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nursingService } from '../../../services/nursingService';
import type { NursingAppointment } from '../../../types/nursing';
import { appointmentStatusLabels, appointmentTypeLabels, appointmentStatusColors, appointmentPriorityColors } from '../../../types/nursing';

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<NursingAppointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<NursingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await nursingService.getNursingAppointments();
      const sortedData = data.sort((a: NursingAppointment, b: NursingAppointment) => 
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      );
      setAppointments(sortedData);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error al cargar el historial de citas');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(apt => apt.appointmentType === filters.type);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(apt => {
        const patientName = `${apt.patient?.name} ${apt.patient?.firstLastName}`.toLowerCase();
        const patientId = apt.patient?.identification || '';
        return patientName.includes(search) || patientId.includes(search);
      });
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(apt => apt.appointmentDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(apt => apt.appointmentDate <= filters.dateTo);
    }

    setFilteredAppointments(filtered);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      search: '',
      dateFrom: '',
      dateTo: ''
    });
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="bi bi-clock-history me-2 text-info"></i>
          Historial de Citas
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

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select 
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="scheduled">Programada</option>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no_show">No se presentó</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Tipo</label>
              <select 
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="checkup">Chequeo</option>
                <option value="evaluation">Evaluación</option>
                <option value="therapy">Terapia</option>
                <option value="follow_up">Seguimiento</option>
                <option value="emergency">Emergencia</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Desde</label>
              <input 
                type="date"
                className="form-control"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Hasta</label>
              <input 
                type="date"
                className="form-control"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="col-md-9">
              <label className="form-label">Buscar paciente</label>
              <input 
                type="text"
                className="form-control"
                placeholder="Buscar por nombre o identificación..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button 
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            Resultados ({filteredAppointments.length} citas)
          </h6>
        </div>
        <div className="card-body">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-search fs-1 mb-3"></i>
              <p>No se encontraron citas con los filtros aplicados</p>
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
                    <th>Observaciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <small>
                          {formatDateTime(appointment.appointmentDate)}
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
                        <span className={`badge bg-${appointmentPriorityColors[appointment.priority]}`}>
                          {appointmentTypeLabels[appointment.appointmentType]}
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
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            const returnPath = '/nursing/appointments/history';
                            navigate(`/nursing/appointments/${appointment.id}/results?returnTo=${encodeURIComponent(returnPath)}`);
                          }}
                          disabled={appointment.status !== 'completed'}
                          title={appointment.status === 'completed' ? 'Ver resultados' : 'Cita no completada'}
                        >
                          <i className="bi bi-clipboard-data me-1"></i>
                          Ver Resultados
                        </button>
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