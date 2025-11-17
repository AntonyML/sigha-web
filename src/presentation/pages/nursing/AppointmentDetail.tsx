import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { nursingService } from '../../../services/nursingService';
import type { NursingAppointment, UpdateAppointmentDto, AppointmentType, AppointmentPriority } from '../../../types/nursing';
import { 
  appointmentStatusLabels, 
  appointmentTypeLabels, 
  appointmentPriorityLabels,
  appointmentStatusColors,
  appointmentTypeColors,
  appointmentPriorityColors,
  mobilityLabels,
  qualityLevelLabels
} from '../../../types/nursing';

export default function AppointmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<NursingAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateAppointmentDto>({});

  useEffect(() => {
    if (id) {
      loadAppointmentDetails();
    }
  }, [id]);

  const loadAppointmentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await nursingService.getNursingAppointments({ /* filtro por id si existe */ });
      const found = data.find(apt => apt.id === parseInt(id!));
      if (found) {
        setAppointment(found);
        setEditForm({
          saAppointmentDate: found.appointmentDate,
          saAppointmentType: found.appointmentType,
          saPriority: found.priority,
          saNotes: found.notes,
          saObservations: found.observations,
          saDurationMinutes: found.durationMinutes
        });
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

  const handleCancelAppointment = async () => {
    const result = await Swal.fire({
      title: '¿Cancelar cita?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Motivo de cancelación (opcional)',
      inputPlaceholder: 'Ingrese el motivo...',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });

    if (!result.isConfirmed) return;

    try {
      await nursingService.cancelAppointment(parseInt(id!), {
        cancellationReason: result.value || undefined
      });
      
      await Swal.fire({
        title: '¡Cita cancelada!',
        text: 'La cita ha sido cancelada exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 3000
      });

      navigate('/nursing');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo cancelar la cita. Intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleUpdateAppointment = async () => {
    const result = await Swal.fire({
      title: '¿Guardar cambios?',
      text: 'Se actualizarán los datos de la cita',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      await nursingService.updateAppointment(parseInt(id!), editForm);
      
      await Swal.fire({
        title: '¡Actualizado!',
        text: 'La cita ha sido actualizada exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 3000
      });

      setIsEditing(false);
      loadAppointmentDetails();
    } catch (err) {
      console.error('Error updating appointment:', err);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la cita. Intente nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
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

  // Convertir fecha de la BD a formato datetime-local (YYYY-MM-DDTHH:mm)
  const toLocalDateTimeString = (dateTime: string) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="bi bi-calendar-event me-2 text-primary"></i>
          Detalles de la Cita
        </h3>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/nursing')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Regresar
        </button>
      </div>

      {/* Estado de la cita */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 text-center border-end">
                  <i className={`bi bi-circle-fill text-${appointmentStatusColors[appointment.status]} fs-1`}></i>
                  <h5 className="mt-2">Estado</h5>
                  <span className={`badge bg-${appointmentStatusColors[appointment.status]} fs-6`}>
                    {appointmentStatusLabels[appointment.status]}
                  </span>
                </div>
                <div className="col-md-3 text-center border-end">
                  <i className={`bi bi-clipboard-pulse text-${appointmentTypeColors[appointment.appointmentType]} fs-1`}></i>
                  <h5 className="mt-2">Tipo</h5>
                  <span className={`badge bg-${appointmentTypeColors[appointment.appointmentType]} fs-6`}>
                    {appointmentTypeLabels[appointment.appointmentType]}
                  </span>
                </div>
                <div className="col-md-3 text-center border-end">
                  <i className={`bi bi-exclamation-triangle text-${appointmentPriorityColors[appointment.priority]} fs-1`}></i>
                  <h5 className="mt-2">Prioridad</h5>
                  <span className={`badge bg-${appointmentPriorityColors[appointment.priority]} fs-6`}>
                    {appointmentPriorityLabels[appointment.priority]}
                  </span>
                </div>
                <div className="col-md-3 text-center">
                  <i className="bi bi-clock text-info fs-1"></i>
                  <h5 className="mt-2">Duración</h5>
                  <span className="badge bg-info fs-6">
                    {appointment.durationMinutes || 30} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Paciente */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary bg-opacity-10">
              <h6 className="mb-0">
                <i className="bi bi-person-fill me-2"></i>
                Información del Paciente
              </h6>
            </div>
            <div className="card-body">
              {appointment.patient ? (
                <>
                  <p className="mb-2">
                    <strong>Nombre:</strong><br />
                    {appointment.patient.name} {appointment.patient.firstLastName} {appointment.patient.secondLastName}
                  </p>
                  <p className="mb-0">
                    <strong>Identificación:</strong><br />
                    {appointment.patient.identification}
                  </p>
                </>
              ) : (
                <p className="text-muted mb-0">No hay información del paciente</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success bg-opacity-10">
              <h6 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Personal Asignado
              </h6>
            </div>
            <div className="card-body">
              {appointment.staff ? (
                <>
                  <p className="mb-2">
                    <strong>Nombre:</strong><br />
                    {appointment.staff.name} {appointment.staff.firstLastName} {appointment.staff.secondLastName}
                  </p>
                  <p className="mb-0">
                    <strong>Email:</strong><br />
                    {appointment.staff.email}
                  </p>
                </>
              ) : (
                <p className="text-muted mb-0">No hay personal asignado</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de la Cita */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="bi bi-calendar-check me-2"></i>
            Detalles de la Cita
          </h6>
          {!isEditing && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil me-1"></i>
              Editar
            </button>
          )}
        </div>
        <div className="card-body">
          {isEditing ? (
            <>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label"><strong>Fecha y Hora</strong></label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={editForm.saAppointmentDate ? toLocalDateTimeString(editForm.saAppointmentDate) : ''}
                    onChange={(e) => setEditForm({ ...editForm, saAppointmentDate: e.target.value })}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label"><strong>Tipo</strong></label>
                  <select
                    className="form-select"
                    value={editForm.saAppointmentType || ''}
                    onChange={(e) => setEditForm({ ...editForm, saAppointmentType: e.target.value as AppointmentType })}
                  >
                    <option value="checkup">Chequeo General</option>
                    <option value="evaluation">Evaluación</option>
                    <option value="therapy">Terapia</option>
                    <option value="follow_up">Seguimiento</option>
                    <option value="emergency">Emergencia</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label"><strong>Prioridad</strong></label>
                  <select
                    className="form-select"
                    value={editForm.saPriority || ''}
                    onChange={(e) => setEditForm({ ...editForm, saPriority: e.target.value as AppointmentPriority })}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label"><strong>Notas</strong></label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editForm.saNotes || ''}
                    onChange={(e) => setEditForm({ ...editForm, saNotes: e.target.value })}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label"><strong>Observaciones</strong></label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={editForm.saObservations || ''}
                    onChange={(e) => setEditForm({ ...editForm, saObservations: e.target.value })}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label"><strong>Duración (minutos)</strong></label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.saDurationMinutes || 30}
                    onChange={(e) => setEditForm({ ...editForm, saDurationMinutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" onClick={handleUpdateAppointment}>
                  <i className="bi bi-check-lg me-1"></i>
                  Guardar Cambios
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      saAppointmentDate: appointment.appointmentDate,
                      saAppointmentType: appointment.appointmentType,
                      saPriority: appointment.priority,
                      saNotes: appointment.notes,
                      saObservations: appointment.observations,
                      saDurationMinutes: appointment.durationMinutes
                    });
                  }}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Fecha y Hora:</strong><br />
                    <i className="bi bi-calendar3 me-2"></i>
                    {formatDateTime(appointment.appointmentDate)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Área:</strong><br />
                    <i className="bi bi-hospital me-2"></i>
                    {appointment.area?.name || 'No especificada'}
                  </p>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12">
                  <p className="mb-2">
                    <strong>Notas:</strong>
                  </p>
                  <div className="alert alert-info mb-0">
                    {appointment.notes || 'Sin notas'}
                  </div>
                </div>
              </div>
              {appointment.observations && (
                <div className="row">
                  <div className="col-12">
                    <p className="mb-2">
                      <strong>Observaciones:</strong>
                    </p>
                    <div className="alert alert-warning mb-0">
                      {appointment.observations}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Registro de Enfermería (si existe) */}
      {appointment.nursingRecord && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-success bg-opacity-10">
            <h6 className="mb-0">
              <i className="bi bi-clipboard2-pulse me-2"></i>
              Registro de Enfermería
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <strong>Temperatura:</strong>
                <p className="mb-0">{appointment.nursingRecord.temperature ? `${appointment.nursingRecord.temperature}°C` : 'N/A'}</p>
              </div>
              <div className="col-md-3">
                <strong>Presión Arterial:</strong>
                <p className="mb-0">{appointment.nursingRecord.bloodPressure || 'N/A'}</p>
              </div>
              <div className="col-md-3">
                <strong>Frecuencia Cardíaca:</strong>
                <p className="mb-0">{appointment.nursingRecord.heartRate ? `${appointment.nursingRecord.heartRate} bpm` : 'N/A'}</p>
              </div>
              <div className="col-md-3">
                <strong>Nivel de Dolor:</strong>
                <p className="mb-0">{appointment.nursingRecord.painLevel !== undefined ? `${appointment.nursingRecord.painLevel}/10` : 'N/A'}</p>
              </div>
              <div className="col-md-4">
                <strong>Movilidad:</strong>
                <p className="mb-0">{appointment.nursingRecord.mobility ? mobilityLabels[appointment.nursingRecord.mobility] : 'N/A'}</p>
              </div>
              <div className="col-md-4">
                <strong>Apetito:</strong>
                <p className="mb-0">{appointment.nursingRecord.appetite ? qualityLevelLabels[appointment.nursingRecord.appetite] : 'N/A'}</p>
              </div>
              <div className="col-md-4">
                <strong>Calidad del Sueño:</strong>
                <p className="mb-0">{appointment.nursingRecord.sleepQuality ? qualityLevelLabels[appointment.nursingRecord.sleepQuality] : 'N/A'}</p>
              </div>
              {appointment.nursingRecord.notes && (
                <div className="col-12">
                  <strong>Notas del Registro:</strong>
                  <div className="alert alert-light mt-2 mb-0">
                    {appointment.nursingRecord.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Siguiente Cita */}
      {appointment.nextAppointment && (
        <div className="alert alert-info">
          <i className="bi bi-calendar-plus me-2"></i>
          <strong>Próxima cita programada:</strong> {formatDateTime(appointment.nextAppointment)}
        </div>
      )}

      {/* Acciones */}
      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
        <div className="card shadow-sm">
          <div className="card-header bg-danger bg-opacity-10">
            <h6 className="mb-0 text-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Acciones de Riesgo
            </h6>
          </div>
          <div className="card-body">
            <button 
              className="btn btn-danger"
              onClick={handleCancelAppointment}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar Cita
            </button>
            <p className="text-muted small mt-2 mb-0">
              <i className="bi bi-info-circle me-1"></i>
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
