import { useState } from 'react';
import { Activity } from 'lucide-react';
import { specialtiesEvaluationsService } from '@/infrastructure/api/services/specialtiesEvaluationsService';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';

interface BarthelEvaluationModalProps {
  idOlderAdult: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BarthelEvaluationModal({
  idOlderAdult,
  onClose,
  onSuccess,
}: BarthelEvaluationModalProps) {
  const [feeding, setFeeding] = useState<number>(10);
  const [bathing, setBathing] = useState<number>(5);
  const [grooming, setGrooming] = useState<number>(5);
  const [dressing, setDressing] = useState<number>(10);
  const [bowels, setBowels] = useState<number>(10);
  const [bladder, setBladder] = useState<number>(10);
  const [toilet, setToilet] = useState<number>(10);
  const [transfers, setTransfers] = useState<number>(15);
  const [mobility, setMobility] = useState<number>(15);
  const [stairs, setStairs] = useState<number>(10);
  const [rehabGoals, setRehabGoals] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const feedback = useFeedbackWithNotifications();

  const totalScore =
    feeding +
    bathing +
    grooming +
    dressing +
    bowels +
    bladder +
    toilet +
    transfers +
    mobility +
    stairs;

  const getDependenceLabel = (score: number) => {
    if (score === 100) return { label: 'Independiente', badge: 'bg-success' };
    if (score >= 91) return { label: 'Dependencia leve', badge: 'bg-info text-dark' };
    if (score >= 61) return { label: 'Dependencia moderada', badge: 'bg-warning text-dark' };
    if (score >= 21) return { label: 'Dependencia severa', badge: 'bg-orange text-white' };
    return { label: 'Dependencia total', badge: 'bg-danger' };
  };

  const levelInfo = getDependenceLabel(totalScore);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await specialtiesEvaluationsService.createPhysio({
        idOlderAdult,
        evaluatorId: 1,
        barthelFeeding: feeding,
        barthelBathing: bathing,
        barthelGrooming: grooming,
        barthelDressing: dressing,
        barthelBowels: bowels,
        barthelBladder: bladder,
        barthelToiletUse: toilet,
        barthelTransfers: transfers,
        barthelMobility: mobility,
        barthelStairs: stairs,
        rehabilitationGoals: rehabGoals,
      });

      feedback.success(`Evaluación Barthel registrada exitosamente (Puntaje: ${totalScore}/100)`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      feedback.error('Error al registrar evaluación de Barthel');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2">
                <Activity className="text-primary" />
                Escala de Valoración Funcional: Índice de Barthel (ABVD)
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Score header */}
              <div className="card bg-light border-0 p-3 mb-4 d-flex flex-row justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 text-muted">Puntaje Total Calculado</h6>
                  <span className="display-6 fw-bold text-primary">{totalScore}</span>
                  <span className="text-muted fs-5"> / 100</span>
                </div>
                <div>
                  <span className={`badge fs-6 p-2 ${levelInfo.badge}`}>
                    {levelInfo.label}
                  </span>
                </div>
              </div>

              {/* 10 Items */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">1. Comer / Alimentación</label>
                  <select className="form-select" value={feeding} onChange={(e) => setFeeding(Number(e.target.value))}>
                    <option value={10}>10 - Independiente (capaz de usar cubiertos y cortar)</option>
                    <option value={5}>5 - Necesita ayuda (ej. cortar carne o untar)</option>
                    <option value={0}>0 - Dependiente</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">2. Baño / Ducha</label>
                  <select className="form-select" value={bathing} onChange={(e) => setBathing(Number(e.target.value))}>
                    <option value={5}>5 - Independiente (se baña completo solo)</option>
                    <option value={0}>0 - Dependiente (necesita asistencia)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">3. Arreglo personal (Aseo)</label>
                  <select className="form-select" value={grooming} onChange={(e) => setGrooming(Number(e.target.value))}>
                    <option value={5}>5 - Independiente (lavarse cara, peinarse, dientes)</option>
                    <option value={0}>0 - Dependiente</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">4. Vestirse / Desvestirse</label>
                  <select className="form-select" value={dressing} onChange={(e) => setDressing(Number(e.target.value))}>
                    <option value={10}>10 - Independiente (abrocha botones y cremalleras)</option>
                    <option value={5}>5 - Necesita ayuda a medias</option>
                    <option value={0}>0 - Dependiente</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">5. Control de deposición (Heces)</label>
                  <select className="form-select" value={bowels} onChange={(e) => setBowels(Number(e.target.value))}>
                    <option value={10}>10 - Continente (sin episodios de incontinencia)</option>
                    <option value={5}>5 - Accidente ocasional (máximo 1 por semana)</option>
                    <option value={0}>0 - Incontinente</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">6. Control de micción (Orina)</label>
                  <select className="form-select" value={bladder} onChange={(e) => setBladder(Number(e.target.value))}>
                    <option value={10}>10 - Continente (control día y noche)</option>
                    <option value={5}>5 - Accidente ocasional (máximo 1 por 24h)</option>
                    <option value={0}>0 - Incontinente o sondado</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">7. Uso del retrete / inodoro</label>
                  <select className="form-select" value={toilet} onChange={(e) => setToilet(Number(e.target.value))}>
                    <option value={10}>10 - Independiente (entra, sale, se limpia solo)</option>
                    <option value={5}>5 - Necesita ayuda para sostenerse o vestirse</option>
                    <option value={0}>0 - Dependiente</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">8. Traslado cama - sillón</label>
                  <select className="form-select" value={transfers} onChange={(e) => setTransfers(Number(e.target.value))}>
                    <option value={15}>15 - Independiente</option>
                    <option value={10}>10 - Mínima ayuda física o supervisión</option>
                    <option value={5}>5 - Gran ayuda (capaz de sentarse sin ayuda)</option>
                    <option value={0}>0 - Dependiente (grúa o 2 personas)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">9. Deambulación / Marcha</label>
                  <select className="form-select" value={mobility} onChange={(e) => setMobility(Number(e.target.value))}>
                    <option value={15}>15 - Independiente camina 50m (con o sin bastón)</option>
                    <option value={10}>10 - Necesita ayuda física o supervisión</option>
                    <option value={5}>5 - Independiente en silla de ruedas 50m</option>
                    <option value={0}>0 - Dependiente / inmóvil</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">10. Subir y bajar escaleras</label>
                  <select className="form-select" value={stairs} onChange={(e) => setStairs(Number(e.target.value))}>
                    <option value={10}>10 - Independiente (puede usar pasamanos)</option>
                    <option value={5}>5 - Necesita ayuda física o supervisión</option>
                    <option value={0}>0 - Incapaz</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Metas de Rehabilitación Funcional</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Ej: Fortalecimiento de tren inferior para mejorar transferencias..."
                    value={rehabGoals}
                    onChange={(e) => setRehabGoals(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar Evaluación Barthel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
