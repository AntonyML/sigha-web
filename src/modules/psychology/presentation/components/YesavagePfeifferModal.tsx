import { useState } from 'react';
import { Brain } from 'lucide-react';
import { specialtiesEvaluationsService } from '@/infrastructure/api/services/specialtiesEvaluationsService';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';

interface YesavagePfeifferModalProps {
  idOlderAdult: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function YesavagePfeifferModal({
  idOlderAdult,
  onClose,
  onSuccess,
}: YesavagePfeifferModalProps) {
  const [gdsScore, setGdsScore] = useState<number>(2);
  const [pfeifferErrors, setPfeifferErrors] = useState<number>(1);
  const [emotionalState, setEmotionalState] = useState('Eutímico, orientado y participativo');
  const [behavioralObs, setBehavioralObs] = useState('');
  const [interventionPlan, setInterventionPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const feedback = useFeedbackWithNotifications();

  const getGdsClassification = (score: number) => {
    if (score <= 4) return { label: 'Normal (Sin depresión)', badge: 'bg-success' };
    if (score <= 8) return { label: 'Depresión Leve', badge: 'bg-warning text-dark' };
    if (score <= 11) return { label: 'Depresión Moderada', badge: 'bg-orange text-white' };
    return { label: 'Depresión Severa', badge: 'bg-danger' };
  };

  const getPfeifferClassification = (errors: number) => {
    if (errors <= 2) return { label: 'Función cognitiva intacta', badge: 'bg-success' };
    if (errors <= 4) return { label: 'Deterioro cognitivo leve', badge: 'bg-info text-dark' };
    if (errors <= 7) return { label: 'Deterioro cognitivo moderado', badge: 'bg-warning text-dark' };
    return { label: 'Deterioro cognitivo severo', badge: 'bg-danger' };
  };

  const gdsInfo = getGdsClassification(gdsScore);
  const pfeifferInfo = getPfeifferClassification(pfeifferErrors);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await specialtiesEvaluationsService.createPsychology({
        idOlderAdult,
        evaluatorId: 1,
        yesavageGdsScore: gdsScore,
        pfeifferErrorsScore: pfeifferErrors,
        emotionalState,
        behavioralObservations: behavioralObs,
        interventionPlan,
      });

      feedback.success('Evaluación psicogeriátrica registrada exitosamente');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      feedback.error('Error al registrar evaluación psicológica');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <Brain className="text-primary" />
                Evaluación Psicogeriátrica (Yesavage GDS & Pfeiffer SPMSQ)
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Dual Scale Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="card bg-light border-0 p-3 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0 text-muted">Depresión: Yesavage GDS (15 ítems)</h6>
                      <span className={`badge ${gdsInfo.badge}`}>{gdsInfo.label}</span>
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="display-6 fw-bold text-primary">{gdsScore}</span>
                      <span className="text-muted fs-6">/ 15 puntos</span>
                    </div>
                    <input
                      type="range"
                      className="form-range mt-2"
                      min={0}
                      max={15}
                      value={gdsScore}
                      onChange={(e) => setGdsScore(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-light border-0 p-3 h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0 text-muted">Cognitivo: Cuestionario Pfeiffer</h6>
                      <span className={`badge ${pfeifferInfo.badge}`}>{pfeifferInfo.label}</span>
                    </div>
                    <div className="d-flex align-items-baseline gap-2">
                      <span className="display-6 fw-bold text-danger">{pfeifferErrors}</span>
                      <span className="text-muted fs-6">/ 10 errores</span>
                    </div>
                    <input
                      type="range"
                      className="form-range mt-2"
                      min={0}
                      max={10}
                      value={pfeifferErrors}
                      onChange={(e) => setPfeifferErrors(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Qualitative Observations */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Estado de Ánimo Observado</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emotionalState}
                    onChange={(e) => setEmotionalState(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Conducta y Adaptación en Sala</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Acepta convivencia, participa en talleres"
                    value={behavioralObs}
                    onChange={(e) => setBehavioralObs(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Plan de Intervención Psicoemocional</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Ej: Estimulación de memoria autobiográfica, talleres de reminiscencia..."
                    value={interventionPlan}
                    onChange={(e) => setInterventionPlan(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar Evaluación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
