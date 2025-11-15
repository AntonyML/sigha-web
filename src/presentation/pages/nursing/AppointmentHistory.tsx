import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nursingService } from '../../../services/nursingService';
import type { Appointment, AppointmentStatus } from '../../../types/nursing';

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
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
      const data = await nursingService.getAllAppointments();
      // Sort by date descending (newest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.scheduledDate + 'T' + b.scheduledTime).getTime() - 
        new Date(a.scheduledDate + 'T' + a.scheduledTime).getTime()
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

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(apt => apt.appointmentType === filters.type);
    }

    // Filter by search (patient name or ID)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(apt => {
        const patientName = `${apt.patient?.name} ${apt.patient?.firstLastName} ${apt.patient?.secondLastName}`.toLowerCase();
        const patientId = apt.patient?.identification || '';
        return patientName.includes(search) || patientId.includes(search);
      });
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(apt => apt.scheduledDate >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(apt => apt.scheduledDate <= filters.dateTo);
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
          className="btn btn-secondary"
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
                <option value="pending">Pendiente</option>
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
                <option value="consultation">Consulta</option>
                <option value="medication">Medicación</option>
                <option value="vital_signs">Signos Vitales</option>
                <option value="treatment">Tratamiento</option>
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
                    <th>Diagnóstico</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <small>
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