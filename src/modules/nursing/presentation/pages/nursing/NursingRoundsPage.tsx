import { useState, useEffect, useCallback } from 'react';
import { Activity, Plus } from 'lucide-react';
import {
  encountersService,
  type NursingRoundItem,
  type NursingShift,
} from '@/infrastructure/api/services/encountersService';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';

export default function NursingRoundsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedShift, setSelectedShift] = useState<NursingShift>('morning');
  const [rounds, setRounds] = useState<NursingRoundItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form state
  const [idOlderAdult, setIdOlderAdult] = useState<number>(1);
  const [systolic, setSystolic] = useState<number | ''>(120);
  const [diastolic, setDiastolic] = useState<number | ''>(80);
  const [heartRate, setHeartRate] = useState<number | ''>(75);
  const [temperature, setTemperature] = useState<number | ''>(36.6);
  const [spo2, setSpo2] = useState<number | ''>(98);
  const [glycemia, setGlycemia] = useState<number | ''>(100);
  const [painEva, setPainEva] = useState<number>(0);
  const [generalCondition, setGeneralCondition] = useState<string>('Estable, orientado y colaborador');
  const [skinIntegrity, setSkinIntegrity] = useState<string>('Piel íntegra, sin signos de UPP');
  const [fallRisk, setFallRisk] = useState<string>('medium');
  const [notes, setNotes] = useState<string>('');

  const feedback = useFeedbackWithNotifications();

  const loadRounds = useCallback(async () => {
    setLoading(true);
    try {
      const data = await encountersService.getRoundsByDate(selectedDate, selectedShift);
      setRounds(data);
    } catch (err) {
      console.error(err);
      feedback.error('Error al cargar las rondas de enfermería');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedShift, feedback]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) loadRounds();
    });
    return () => {
      active = false;
    };
  }, [loadRounds]);

  const handleSubmitRound = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Record vital signs
      const vitals = await encountersService.recordVitalSigns({
        idOlderAdult,
        systolicBp: systolic !== '' ? Number(systolic) : undefined,
        diastolicBp: diastolic !== '' ? Number(diastolic) : undefined,
        heartRate: heartRate !== '' ? Number(heartRate) : undefined,
        temperature: temperature !== '' ? Number(temperature) : undefined,
        spo2: spo2 !== '' ? Number(spo2) : undefined,
        glycemia: glycemia !== '' ? Number(glycemia) : undefined,
        painEva,
        recordedBy: 1,
      });

      // 2. Record nursing round
      await encountersService.recordNursingRound({
        idOlderAdult,
        idStaff: 1,
        roundDate: selectedDate,
        shift: selectedShift,
        idVitalSigns: vitals.id,
        generalCondition,
        skinIntegrity,
        fallRisk,
        notes,
      });

      feedback.success('Ronda de enfermería y signos vitales registrados exitosamente');
      setShowModal(false);
      await loadRounds();
    } catch (err) {
      console.error(err);
      feedback.error('Error al registrar la ronda');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h3 text-gray-800 d-flex align-items-center gap-2 mb-1">
            <Activity className="text-danger" />
            Rondas de Enfermería y Signos Vitales
          </h1>
          <p className="text-muted mb-0">
            Control de rondas de sala por turno residencial con valoración estructurada y prevención de caídas/UPP
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <select
            className="form-select"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value as NursingShift)}
          >
            <option value="morning">Turno Mañana</option>
            <option value="afternoon">Turno Tarde</option>
            <option value="night">Turno Noche</option>
          </select>

          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-1"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" />
            Nueva Ronda
          </button>
        </div>
      </div>

      {/* Rounds Table */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center text-muted">Cargando rondas del turno...</div>
          ) : rounds.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <h5>No hay rondas registradas para este turno y fecha</h5>
              <p className="small">Haga clic en &quot;Nueva Ronda&quot; para iniciar la ronda del turno.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Residente</th>
                    <th>PA (mmHg)</th>
                    <th>FC / SpO2</th>
                    <th>Temp (°C)</th>
                    <th>Dolor (EVA)</th>
                    <th>Estado y Piel</th>
                    <th>Riesgo Caída</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((round) => (
                    <tr key={round.id}>
                      <td className="fw-semibold">
                        {round.olderAdult ? `${round.olderAdult.oaName} ${round.olderAdult.oaFLastName}` : `Residente #${round.idOlderAdult}`}
                      </td>
                      <td>
                        {round.vitalSigns?.systolicBp && round.vitalSigns?.diastolicBp ? (
                          <span className="badge bg-light text-dark border">
                            {round.vitalSigns.systolicBp}/{round.vitalSigns.diastolicBp}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <small className="d-block">FC: {round.vitalSigns?.heartRate || '-'} lpm</small>
                        <small className="d-block text-muted">SpO2: {round.vitalSigns?.spo2 || '-'}%</small>
                      </td>
                      <td>{round.vitalSigns?.temperature ? `${round.vitalSigns.temperature} °C` : '-'}</td>
                      <td>
                        <span className={`badge ${Number(round.vitalSigns?.painEva) > 3 ? 'bg-danger' : 'bg-success'}`}>
                          {round.vitalSigns?.painEva ?? 0}/10
                        </span>
                      </td>
                      <td>
                        <div className="small fw-semibold">{round.generalCondition || '-'}</div>
                        <small className="text-muted">{round.skinIntegrity}</small>
                      </td>
                      <td>
                        <span className={`badge ${round.fallRisk === 'high' ? 'bg-danger' : round.fallRisk === 'medium' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {round.fallRisk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Ronda */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmitRound}>
                <div className="modal-header">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <Activity className="text-primary" />
                    Registrar Ronda de Sala y Signos Vitales
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">ID Adulto Mayor</label>
                      <input
                        type="number"
                        className="form-control"
                        value={idOlderAdult}
                        onChange={(e) => setIdOlderAdult(Number(e.target.value))}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Riesgo de Caídas</label>
                      <select
                        className="form-select"
                        value={fallRisk}
                        onChange={(e) => setFallRisk(e.target.value)}
                      >
                        <option value="low">Bajo</option>
                        <option value="medium">Medio</option>
                        <option value="high">Alto</option>
                      </select>
                    </div>

                    <div className="col-12"><hr className="my-1" /><h6 className="text-primary mb-2">Signos Vitales Numéricos</h6></div>

                    <div className="col-md-3">
                      <label className="form-label small">Sistólica (mmHg)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="120"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">Diastólica (mmHg)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="80"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">FC (lpm)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="75"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">Temp (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="36.6"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small">SpO2 (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="98"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small">Glicemia (mg/dL)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="100"
                        value={glycemia}
                        onChange={(e) => setGlycemia(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Dolor EVA (0-10): {painEva}</label>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="10"
                        value={painEva}
                        onChange={(e) => setPainEva(Number(e.target.value))}
                      />
                    </div>

                    <div className="col-12"><hr className="my-1" /><h6 className="text-primary mb-2">Valoración de Sala</h6></div>

                    <div className="col-md-6">
                      <label className="form-label small">Estado General</label>
                      <input
                        type="text"
                        className="form-control"
                        value={generalCondition}
                        onChange={(e) => setGeneralCondition(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small">Integridad Cutánea / Prevención UPP</label>
                      <input
                        type="text"
                        className="form-control"
                        value={skinIntegrity}
                        onChange={(e) => setSkinIntegrity(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small">Observaciones adicionales</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Guardar Ronda'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
