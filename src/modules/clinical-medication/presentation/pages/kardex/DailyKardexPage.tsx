import { useState, useEffect, useCallback } from 'react';
import { Pill, CheckCircle, XCircle, AlertCircle, Clock, Calendar, RefreshCw } from 'lucide-react';
import {
  pharmacyService,
  type KardexAdministrationSlot,
  type AdministrationStatus,
} from '@/infrastructure/api/services/pharmacyService';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';
import { DatePicker } from '@/shared/ui';

export default function DailyKardexPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<KardexAdministrationSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const feedback = useFeedbackWithNotifications();

  const loadKardex = useCallback(async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.getDailyKardex(selectedDate);
      setSlots(data);
    } catch (err) {
      console.error(err);
      feedback.error('Error al cargar la hoja de medicación diaria');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, feedback]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) loadKardex();
    });
    return () => {
      active = false;
    };
  }, [loadKardex]);

  const handleStatusChange = async (
    slot: KardexAdministrationSlot,
    newStatus: AdministrationStatus
  ) => {
    let notes = '';
    if (newStatus === 'omitted' || newStatus === 'refused') {
      const reason = window.prompt(
        newStatus === 'omitted'
          ? 'Motivo de omisión (ej: ayuno, náuseas):'
          : 'Motivo del rechazo por parte del residente:'
      );
      if (reason === null) return;
      notes = reason;
    }

    setActionLoading(slot.prescriptionId);
    try {
      await pharmacyService.recordAdministration({
        idSlot: slot.idSlot,
        prescriptionId: slot.prescriptionId,
        olderAdultId: slot.olderAdultId,
        scheduledDate: slot.scheduledDate,
        scheduledTime: slot.scheduledTime,
        status: newStatus,
        notes,
        administeredBy: 1, // Fallback a usuario en sesión
      });

      feedback.success(
        newStatus === 'administered'
          ? 'Dosis registrada como administrada'
          : `Medicamento marcado como ${newStatus}`
      );
      await loadKardex();
    } catch (err) {
      console.error(err);
      feedback.error('Error al registrar la administración');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: AdministrationStatus) => {
    switch (status) {
      case 'administered':
        return (
          <span className="badge bg-success d-inline-flex align-items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Administrado
          </span>
        );
      case 'omitted':
        return (
          <span className="badge bg-warning text-dark d-inline-flex align-items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Omitido
          </span>
        );
      case 'refused':
        return (
          <span className="badge bg-danger d-inline-flex align-items-center gap-1">
            <XCircle className="w-3 h-3" /> Rechazado
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
            <Clock className="w-3 h-3" /> Programado
          </span>
        );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h3 text-gray-800 d-flex align-items-center gap-2 mb-1">
            <Pill className="text-primary" />
            Hoja de Medicación Diaria (Kardex MAR)
          </h1>
          <p className="text-muted mb-0">
            Registro y control horario de administración de fármacos según prescripción médica activa
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div style={{ minWidth: 170 }}>
            <DatePicker
              value={selectedDate}
              onChange={(val) => setSelectedDate(val)}
              containerClassName="mb-0"
              aria-label="Seleccionar fecha para hoja de medicación"
            />
          </div>

          <button
            type="button"
            className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
            onClick={loadKardex}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center text-muted">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p>Cargando pautas de medicación...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <Pill className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h5>No hay medicamentos programados para esta fecha</h5>
              <p className="small">
                Verifique que existan prescripciones activas registradas en el sistema para la fecha seleccionada.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Hora</th>
                    <th>Medicamento</th>
                    <th>Dosis</th>
                    <th>Vía</th>
                    <th>Estado</th>
                    <th>Observaciones / Admin</th>
                    <th className="text-end">Acción Rápida (1-Clic)</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot, index) => {
                    const isBusy = actionLoading === slot.prescriptionId;
                    return (
                      <tr key={`${slot.prescriptionId}-${slot.scheduledTime}-${index}`}>
                        <td className="fw-bold text-primary font-monospace">
                          {slot.scheduledTime}
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">{slot.medicationName}</div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {slot.dose}
                          </span>
                        </td>
                        <td>
                          <span className="text-capitalize small text-muted">
                            {slot.route}
                          </span>
                        </td>
                        <td>{getStatusBadge(slot.status)}</td>
                        <td>
                          {slot.administeredByName ? (
                            <small className="text-muted d-block">
                              Por: {slot.administeredByName}
                            </small>
                          ) : null}
                          {slot.notes ? (
                            <small className="text-danger fst-italic">
                              Nota: {slot.notes}
                            </small>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className={`btn ${
                                slot.status === 'administered'
                                  ? 'btn-success'
                                  : 'btn-outline-success'
                              }`}
                              title="Marcar como administrado"
                              disabled={isBusy}
                              onClick={() => handleStatusChange(slot, 'administered')}
                            >
                              Administrar
                            </button>
                            <button
                              type="button"
                              className={`btn ${
                                slot.status === 'omitted'
                                  ? 'btn-warning text-dark'
                                  : 'btn-outline-warning text-dark'
                              }`}
                              title="Omitir toma"
                              disabled={isBusy}
                              onClick={() => handleStatusChange(slot, 'omitted')}
                            >
                              Omitir
                            </button>
                            <button
                              type="button"
                              className={`btn ${
                                slot.status === 'refused'
                                  ? 'btn-danger'
                                  : 'btn-outline-danger'
                              }`}
                              title="Rechazado por residente"
                              disabled={isBusy}
                              onClick={() => handleStatusChange(slot, 'refused')}
                            >
                              Rechazado
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
  );
}
