import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { nursingService } from '../../../services/nursingService';
import type { NursingAppointment } from '../../../types/nursing';
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

export default function AppointmentResults() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [appointment, setAppointment] = useState<NursingAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Leer el parámetro returnTo de la URL
  const returnPath = searchParams.get('returnTo') || '/nursing/appointments/history';

  useEffect(() => {
    if (id) {
      loadAppointmentResults();
    }
  }, [id]);

  const loadAppointmentResults = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener la cita
      const data = await nursingService.getNursingAppointments();
      const found = data.find(apt => apt.id === parseInt(id!));
      
      if (found) {
        // Si la cita no tiene nursingRecord incluido, intentar cargar los registros
        if (!found.nursingRecord) {
          try {
            const records = await nursingService.getNursingRecordsByAppointment(parseInt(id!));
            if (records && records.length > 0) {
              // Agregar el registro a la cita
              found.nursingRecord = records[0];
            }
          } catch (recordError) {
            console.warn('No se pudieron cargar los registros de enfermería:', recordError);
          }
        }
        
        setAppointment(found);
        
        if (!found.nursingRecord) {
          setError('Esta cita no tiene registro de enfermería');
        }
      } else {
        setError('Cita no encontrada');
      }
    } catch (err) {
      console.error('Error loading appointment results:', err);
      setError('Error al cargar los resultados de la cita');
    } finally {
      setLoading(false);
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

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return 'success';
    if (level <= 6) return 'warning';
    return 'danger';
  };

  const getPainLevelText = (level: number) => {
    if (level === 0) return 'Sin dolor';
    if (level <= 3) return 'Dolor leve';
    if (level <= 6) return 'Dolor moderado';
    return 'Dolor severo';
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

  if (error || !appointment || !appointment.nursingRecord) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error || 'No hay resultados disponibles para esta cita'}
        </div>
        <button className="btn btn-outline-secondary" onClick={() => navigate(returnPath)}>
          <i className="bi bi-arrow-left me-2"></i>
          Regresar
        </button>
      </div>
    );
  }

  const record = appointment.nursingRecord;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">
          <i className="bi bi-clipboard-data me-2 text-success"></i>
          Resultados de la Cita
        </h3>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-2"></i>
            Imprimir
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate(returnPath)}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>
      </div>

      {/* Información General de la Cita */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary bg-opacity-10">
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Información de la Cita
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="border-start border-primary border-4 ps-3">
                <h6 className="text-muted mb-2">Paciente</h6>
                <p className="mb-1 fs-5 fw-bold">
                  {appointment.patient?.name} {appointment.patient?.firstLastName} {appointment.patient?.secondLastName}
                </p>
                <p className="text-muted mb-0">
                  <i className="bi bi-card-text me-2"></i>
                  ID: {appointment.patient?.identification}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="border-start border-info border-4 ps-3">
                <h6 className="text-muted mb-2">Personal que Atendió</h6>
                <p className="mb-1 fs-5 fw-bold">
                  {appointment.staff?.name} {appointment.staff?.firstLastName} {appointment.staff?.secondLastName}
                </p>
                <p className="text-muted mb-0">
                  <i className="bi bi-envelope me-2"></i>
                  {appointment.staff?.email}
                </p>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <div className="row g-3">
            <div className="col-md-3">
              <p className="mb-1 text-muted small">Fecha y Hora</p>
              <p className="mb-0 fw-semibold">
                <i className="bi bi-calendar3 me-2 text-primary"></i>
                {formatDateTime(appointment.appointmentDate)}
              </p>
            </div>
            <div className="col-md-3">
              <p className="mb-1 text-muted small">Tipo de Cita</p>
              <span className={`badge bg-${appointmentTypeColors[appointment.appointmentType]} fs-6`}>
                {appointmentTypeLabels[appointment.appointmentType]}
              </span>
            </div>
            <div className="col-md-3">
              <p className="mb-1 text-muted small">Prioridad</p>
              <span className={`badge bg-${appointmentPriorityColors[appointment.priority]} fs-6`}>
                {appointmentPriorityLabels[appointment.priority]}
              </span>
            </div>
            <div className="col-md-3">
              <p className="mb-1 text-muted small">Estado</p>
              <span className={`badge bg-${appointmentStatusColors[appointment.status]} fs-6`}>
                {appointmentStatusLabels[appointment.status]}
              </span>
            </div>
          </div>

          {appointment.notes && (
            <>
              <hr className="my-3" />
              <div>
                <p className="mb-1 text-muted small">Motivo de la Cita</p>
                <div className="alert alert-light mb-0">
                  {appointment.notes}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Signos Vitales */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-danger bg-opacity-10">
          <h5 className="mb-0">
            <i className="bi bi-heart-pulse me-2 text-danger"></i>
            Signos Vitales
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-3 text-center">
              <div className="border rounded p-3 bg-light">
                <i className="bi bi-thermometer-half text-danger fs-1 mb-2"></i>
                <h6 className="text-muted mb-2">Temperatura</h6>
                <p className="fs-3 fw-bold mb-0">
                  {record.temperature ? `${record.temperature}°C` : 'N/A'}
                </p>
                {record.temperature && (
                  <small className={`badge ${record.temperature >= 37.5 ? 'bg-warning' : 'bg-success'} mt-2`}>
                    {record.temperature >= 37.5 ? 'Elevada' : 'Normal'}
                  </small>
                )}
              </div>
            </div>

            <div className="col-md-3 text-center">
              <div className="border rounded p-3 bg-light">
                <i className="bi bi-activity text-primary fs-1 mb-2"></i>
                <h6 className="text-muted mb-2">Presión Arterial</h6>
                <p className="fs-3 fw-bold mb-0">
                  {record.bloodPressure || 'N/A'}
                </p>
                {record.bloodPressure && (
                  <small className="badge bg-info mt-2">mmHg</small>
                )}
              </div>
            </div>

            <div className="col-md-3 text-center">
              <div className="border rounded p-3 bg-light">
                <i className="bi bi-heartbeat text-danger fs-1 mb-2"></i>
                <h6 className="text-muted mb-2">Frecuencia Cardíaca</h6>
                <p className="fs-3 fw-bold mb-0">
                  {record.heartRate ? `${record.heartRate}` : 'N/A'}
                </p>
                {record.heartRate && (
                  <small className="badge bg-info mt-2">bpm</small>
                )}
              </div>
            </div>

            <div className="col-md-3 text-center">
              <div className="border rounded p-3 bg-light">
                <i className={`bi bi-exclamation-circle text-${getPainLevelColor(record.painLevel || 0)} fs-1 mb-2`}></i>
                <h6 className="text-muted mb-2">Nivel de Dolor</h6>
                <p className="fs-3 fw-bold mb-0">
                  {record.painLevel !== undefined ? `${record.painLevel}/10` : 'N/A'}
                </p>
                {record.painLevel !== undefined && (
                  <small className={`badge bg-${getPainLevelColor(record.painLevel)} mt-2`}>
                    {getPainLevelText(record.painLevel)}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluación del Paciente */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success bg-opacity-10">
          <h5 className="mb-0">
            <i className="bi bi-person-check me-2 text-success"></i>
            Evaluación del Paciente
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="d-flex align-items-center border-start border-success border-4 ps-3">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Movilidad</h6>
                  <p className="mb-0 fs-5 fw-semibold">
                    {record.mobility ? mobilityLabels[record.mobility] : 'No registrado'}
                  </p>
                </div>
                <i className="bi bi-person-walking fs-1 text-success opacity-25"></i>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center border-start border-warning border-4 ps-3">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Apetito</h6>
                  <p className="mb-0 fs-5 fw-semibold">
                    {record.appetite ? qualityLevelLabels[record.appetite] : 'No registrado'}
                  </p>
                </div>
                <i className="bi bi-egg-fried fs-1 text-warning opacity-25"></i>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center border-start border-info border-4 ps-3">
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">Calidad del Sueño</h6>
                  <p className="mb-0 fs-5 fw-semibold">
                    {record.sleepQuality ? qualityLevelLabels[record.sleepQuality] : 'No registrado'}
                  </p>
                </div>
                <i className="bi bi-moon-stars fs-1 text-info opacity-25"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas del Registro de Enfermería */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-warning bg-opacity-10">
          <h5 className="mb-0">
            <i className="bi bi-journal-medical me-2 text-warning"></i>
            Notas del Registro de Enfermería
          </h5>
        </div>
        <div className="card-body">
          {record.notes ? (
            <div className="p-3 bg-light border-start border-warning border-4">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {record.notes}
              </p>
            </div>
          ) : (
            <p className="text-muted mb-0">Sin notas registradas</p>
          )}
        </div>
      </div>

      {/* Observaciones Adicionales */}
      {appointment.observations && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-info bg-opacity-10">
            <h5 className="mb-0">
              <i className="bi bi-chat-left-text me-2 text-info"></i>
              Observaciones Adicionales
            </h5>
          </div>
          <div className="card-body">
            <div className="p-3 bg-light border-start border-info border-4">
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                {appointment.observations}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Próxima Cita */}
      {appointment.nextAppointment && (
        <div className="alert alert-info shadow-sm">
          <div className="d-flex align-items-center">
            <i className="bi bi-calendar-plus fs-3 me-3"></i>
            <div>
              <h6 className="mb-1">Próxima Cita Programada</h6>
              <p className="mb-0">{formatDateTime(appointment.nextAppointment)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Información de Registro */}
      <div className="card shadow-sm">
        <div className="card-body bg-light">
          <div className="row text-center">
            <div className="col-md-6">
              <small className="text-muted d-block mb-1">Fecha de Registro</small>
              <small className="fw-semibold">
                <i className="bi bi-calendar-check me-1"></i>
                {formatDateTime(record.createAt)}
              </small>
            </div>
            <div className="col-md-6">
              <small className="text-muted d-block mb-1">Área de Atención</small>
              <small className="fw-semibold">
                <i className="bi bi-hospital me-1"></i>
                {appointment.area?.name || 'No especificada'}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          .btn, .alert { display: none !important; }
          .card { border: 1px solid #dee2e6 !important; page-break-inside: avoid; }
          .card-header { background-color: #f8f9fa !important; }
        }
      `}</style>
    </div>
  );
}
