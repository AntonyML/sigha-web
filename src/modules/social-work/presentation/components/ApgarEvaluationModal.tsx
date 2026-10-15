import { useState } from 'react';
import { Users } from 'lucide-react';
import { specialtiesEvaluationsService } from '@/infrastructure/api/services/specialtiesEvaluationsService';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';

interface ApgarEvaluationModalProps {
  idOlderAdult: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApgarEvaluationModal({
  idOlderAdult,
  onClose,
  onSuccess,
}: ApgarEvaluationModalProps) {
  const [adaptation, setAdaptation] = useState<number>(2);
  const [partnership, setPartnership] = useState<number>(2);
  const [growth, setGrowth] = useState<number>(2);
  const [affection, setAffection] = useState<number>(2);
  const [resolve, setResolve] = useState<number>(2);

  const [supportNetwork, setSupportNetwork] = useState('');
  const [socioeconomic, setSocioeconomic] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const feedback = useFeedbackWithNotifications();

  const totalScore = adaptation + partnership + growth + affection + resolve;

  const getFunctioningLabel = (score: number) => {
    if (score >= 7) return { label: 'Familia Altamente Funcional', badge: 'bg-success' };
    if (score >= 4) return { label: 'Disfunción Familiar Leve', badge: 'bg-warning text-dark' };
    return { label: 'Disfunción Familiar Severa', badge: 'bg-danger' };
  };

  const functioningInfo = getFunctioningLabel(totalScore);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await specialtiesEvaluationsService.createSocialWork({
        idOlderAdult,
        evaluatorId: 1,
        apgarAdaptation: adaptation,
        apgarPartnership: partnership,
        apgarGrowth: growth,
        apgarAffection: affection,
        apgarResolve: resolve,
        familySupportNetwork: supportNetwork,
        socioeconomicAssessment: socioeconomic,
        institutionalRecommendations: recommendations,
      });

      feedback.success(`Evaluación APGAR registrada exitosamente (Puntaje: ${totalScore}/10)`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      feedback.error('Error al registrar evaluación de trabajo social');
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
                <Users className="text-primary" />
                Valoración Social: Escala APGAR Familiar
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Score Card */}
              <div className="card bg-light border-0 p-3 mb-4 d-flex flex-row justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">Puntaje APGAR Total</h6>
                  <span className="display-6 fw-bold text-primary">{totalScore}</span>
                  <span className="text-muted fs-5"> / 10</span>
                </div>
                <div>
                  <span className={`badge fs-6 p-2 ${functioningInfo.badge}`}>
                    {functioningInfo.label}
                  </span>
                </div>
              </div>

              {/* 5 APGAR items */}
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    1. Adaptación (¿Está satisfecho con la ayuda que recibe de su familia cuando tiene problemas?)
                  </label>
                  <select
                    className="form-select"
                    value={adaptation}
                    onChange={(e) => setAdaptation(Number(e.target.value))}
                  >
                    <option value={2}>2 - Casi siempre</option>
                    <option value={1}>1 - A veces</option>
                    <option value={0}>0 - Casi nunca</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    2. Participación (¿Conversan entre ustedes los problemas y comparten la toma de decisiones?)
                  </label>
                  <select
                    className="form-select"
                    value={partnership}
                    onChange={(e) => setPartnership(Number(e.target.value))}
                  >
                    <option value={2}>2 - Casi siempre</option>
                    <option value={1}>1 - A veces</option>
                    <option value={0}>0 - Casi nunca</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    3. Gradiente de desarrollo (¿Siente que su familia acepta sus nuevos deseos y proyectos?)
                  </label>
                  <select
                    className="form-select"
                    value={growth}
                    onChange={(e) => setGrowth(Number(e.target.value))}
                  >
                    <option value={2}>2 - Casi siempre</option>
                    <option value={1}>1 - A veces</option>
                    <option value={0}>0 - Casi nunca</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    4. Afecto (¿Le satisface cómo su familia expresa afecto y responde a sus emociones?)
                  </label>
                  <select
                    className="form-select"
                    value={affection}
                    onChange={(e) => setAffection(Number(e.target.value))}
                  >
                    <option value={2}>2 - Casi siempre</option>
                    <option value={1}>1 - A veces</option>
                    <option value={0}>0 - Casi nunca</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    5. Recursos / Resolución (¿Le satisface la cantidad de tiempo que pasan juntos?)
                  </label>
                  <select
                    className="form-select"
                    value={resolve}
                    onChange={(e) => setResolve(Number(e.target.value))}
                  >
                    <option value={2}>2 - Casi siempre</option>
                    <option value={1}>1 - A veces</option>
                    <option value={0}>0 - Casi nunca</option>
                  </select>
                </div>
              </div>

              {/* Social assessment */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Red de Apoyo Familiar y Comunitaria</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Hijo mayor visita semanalmente; red vecinal activa"
                    value={supportNetwork}
                    onChange={(e) => setSupportNetwork(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Evaluación Socioeconómica</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Pensión régimen no contributivo CCSS"
                    value={socioeconomic}
                    onChange={(e) => setSocioeconomic(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Recomendaciones Institucionales</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ej: Fomentar contacto telefónico regular y videollamadas con nietos..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar Evaluación APGAR'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
