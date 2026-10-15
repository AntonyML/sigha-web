import { useState } from 'react';
import { Brain } from 'lucide-react';
import { specialtiesEvaluationsService } from '@/infrastructure/api/services/specialtiesEvaluationsService';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';
import {
  pfeifferQuestions,
  scorePfeifferAnswers,
  scoreYesavageAnswers,
  toPfeifferScoredResponses,
  toYesavageScoredResponses,
  yesavageQuestions,
  type PfeifferOutcome,
  type YesNoAnswer,
} from '../../domain/yesavagePfeifferScoring';

interface YesavagePfeifferModalProps {
  idOlderAdult: number;
  onClose: () => void;
  onSuccess: () => void;
}

function getGdsClassification(score: number) {
  if (score <= 4) return { label: 'Sin indicios en esta escala', badge: 'bg-success' };
  if (score <= 8) return { label: 'Indicios leves', badge: 'bg-warning text-dark' };
  if (score <= 11) return { label: 'Indicios moderados', badge: 'bg-orange text-white' };
  return { label: 'Indicios altos', badge: 'bg-danger' };
}

function getPfeifferClassification(errors: number) {
  if (errors <= 2) return { label: '0–2 errores', badge: 'bg-success' };
  if (errors <= 4) return { label: '3–4 errores', badge: 'bg-info text-dark' };
  if (errors <= 7) return { label: '5–7 errores', badge: 'bg-warning text-dark' };
  return { label: '8–10 errores', badge: 'bg-danger' };
}

function answeredCount(answers: readonly (YesNoAnswer | PfeifferOutcome)[]) {
  return answers.filter((answer) => answer !== null).length;
}

export default function YesavagePfeifferModal({
  idOlderAdult,
  onClose,
  onSuccess,
}: YesavagePfeifferModalProps) {
  const [yesavageAnswers, setYesavageAnswers] = useState<YesNoAnswer[]>(
    () => yesavageQuestions.map(() => null),
  );
  const [pfeifferAnswers, setPfeifferAnswers] = useState<PfeifferOutcome[]>(
    () => pfeifferQuestions.map(() => null),
  );
  const [emotionalState, setEmotionalState] = useState('');
  const [behavioralObs, setBehavioralObs] = useState('');
  const [interventionPlan, setInterventionPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const feedback = useFeedbackWithNotifications();

  const gdsScore = scoreYesavageAnswers(yesavageAnswers);
  const pfeifferErrors = scorePfeifferAnswers(pfeifferAnswers);
  const yesavageResponses = toYesavageScoredResponses(yesavageAnswers);
  const pfeifferResponses = toPfeifferScoredResponses(pfeifferAnswers);
  const complete = yesavageResponses !== null && pfeifferResponses !== null;

  const setYesavageAnswer = (index: number, answer: Exclude<YesNoAnswer, null>) => {
    setYesavageAnswers((current) => current.map((value, i) => i === index ? answer : value));
  };

  const setPfeifferAnswer = (index: number, answer: Exclude<PfeifferOutcome, null>) => {
    setPfeifferAnswers((current) => current.map((value, i) => i === index ? answer : value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complete || !yesavageResponses || !pfeifferResponses) return;

    setSubmitting(true);
    try {
      await specialtiesEvaluationsService.createPsychology({
        idOlderAdult,
        yesavageResponses,
        pfeifferResponses,
        emotionalState: emotionalState.trim() || undefined,
        behavioralObservations: behavioralObs.trim() || undefined,
        interventionPlan: interventionPlan.trim() || undefined,
      });

      feedback.success('Evaluación psicogeriátrica registrada exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      feedback.error('Error al registrar la evaluación psicológica');
    } finally {
      setSubmitting(false);
    }
  };

  const gdsInfo = gdsScore === null ? null : getGdsClassification(gdsScore);
  const pfeifferInfo = pfeifferErrors === null ? null : getPfeifferClassification(pfeifferErrors);

  return (
    <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="psych-evaluation-title" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2 id="psych-evaluation-title" className="modal-title fs-5 d-flex align-items-center gap-2">
                <Brain className="text-primary" aria-hidden="true" />
                Evaluación psicogeriátrica
              </h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="alert alert-info" role="note">
                Estas escalas apoyan el tamizaje clínico y no sustituyen una valoración ni un diagnóstico profesional.
                Complete cada respuesta según la entrevista realizada.
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <section className="card bg-light border-0 p-3 h-100" aria-live="polite">
                    <h3 className="h6 text-muted">Yesavage GDS, 15 ítems</h3>
                    {gdsScore === null ? (
                      <p className="mb-0">Respondidas: {answeredCount(yesavageAnswers)} / {yesavageQuestions.length}</p>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <span className="display-6 fw-bold text-primary">{gdsScore}</span>
                        <span className="text-muted">/ 15 puntos</span>
                        <span className={`badge ms-auto ${gdsInfo?.badge}`}>{gdsInfo?.label}</span>
                      </div>
                    )}
                  </section>
                </div>
                <div className="col-md-6">
                  <section className="card bg-light border-0 p-3 h-100" aria-live="polite">
                    <h3 className="h6 text-muted">Pfeiffer SPMSQ, 10 ítems</h3>
                    {pfeifferErrors === null ? (
                      <p className="mb-0">Respondidas: {answeredCount(pfeifferAnswers)} / {pfeifferQuestions.length}</p>
                    ) : (
                      <div className="d-flex align-items-center gap-2">
                        <span className="display-6 fw-bold text-danger">{pfeifferErrors}</span>
                        <span className="text-muted">/ 10 errores</span>
                        <span className={`badge ms-auto ${pfeifferInfo?.badge}`}>{pfeifferInfo?.label}</span>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <fieldset className="mb-4">
                <legend className="h5">Escala de depresión geriátrica de Yesavage</legend>
                <p className="text-muted small">Marque la respuesta indicada por la persona en cada pregunta.</p>
                <div className="list-group">
                  {yesavageQuestions.map((question, index) => (
                    <fieldset className="list-group-item" key={question.prompt}>
                      <legend className="fs-6 mb-2">{index + 1}. {question.prompt}</legend>
                      {(['yes', 'no'] as const).map((answer) => (
                        <label className="form-check form-check-inline mb-0" key={answer}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`yesavage-${index}`}
                            value={answer}
                            checked={yesavageAnswers[index] === answer}
                            onChange={() => setYesavageAnswer(index, answer)}
                            required
                          />
                          <span className="form-check-label">{answer === 'yes' ? 'Sí' : 'No'}</span>
                        </label>
                      ))}
                    </fieldset>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mb-4">
                <legend className="h5">Cuestionario de Pfeiffer</legend>
                <p className="text-muted small">Registre si cada respuesta fue correcta o incorrecta.</p>
                <div className="list-group">
                  {pfeifferQuestions.map((question, index) => (
                    <fieldset className="list-group-item" key={question}>
                      <legend className="fs-6 mb-2">{index + 1}. {question}</legend>
                      {(['correct', 'incorrect'] as const).map((answer) => (
                        <label className="form-check form-check-inline mb-0" key={answer}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`pfeiffer-${index}`}
                            value={answer}
                            checked={pfeifferAnswers[index] === answer}
                            onChange={() => setPfeifferAnswer(index, answer)}
                            required
                          />
                          <span className="form-check-label">{answer === 'correct' ? 'Correcta' : 'Incorrecta'}</span>
                        </label>
                      ))}
                    </fieldset>
                  ))}
                </div>
              </fieldset>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="psych-emotional-state">Estado de ánimo observado</label>
                  <input id="psych-emotional-state" type="text" className="form-control" maxLength={500} value={emotionalState} onChange={(event) => setEmotionalState(event.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="psych-behavioral-observations">Conducta y adaptación</label>
                  <input id="psych-behavioral-observations" type="text" className="form-control" maxLength={2000} value={behavioralObs} onChange={(event) => setBehavioralObs(event.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold" htmlFor="psych-intervention-plan">Plan de intervención psicoemocional</label>
                  <textarea id="psych-intervention-plan" className="form-control" rows={3} maxLength={4000} value={interventionPlan} onChange={(event) => setInterventionPlan(event.target.value)} />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span className="text-muted me-auto">{complete ? '25 de 25 respuestas completas' : 'Complete las 25 respuestas para guardar'}</span>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={submitting || !complete}>
                {submitting ? 'Guardando...' : 'Guardar evaluación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
