import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FileText, Lock, PlusCircle, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from '@/shared/navigation';
import {
  encountersService,
  type ClinicalEncounterItem,
} from '@/infrastructure/api/services/encountersService';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';

interface SoapEncounterPageProps {
  encounterId?: number;
  onBack?: () => void;
}

export default function SoapEncounterPage({ encounterId, onBack }: SoapEncounterPageProps) {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const effectiveEncounterId = encounterId ?? (params?.id ? parseInt(params.id, 10) : 1);
  const handleBack = onBack ?? (() => navigate('/medical-records'));
  const [encounter, setEncounter] = useState<ClinicalEncounterItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [signing, setSigning] = useState<boolean>(false);

  // SOAP fields
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Addendum modal
  const [showAddendumModal, setShowAddendumModal] = useState(false);
  const [addendumText, setAddendumText] = useState('');
  const [reasonForAddendum, setReasonForAddendum] = useState('');
  const [submittingAddendum, setSubmittingAddendum] = useState(false);

  const feedback = useFeedbackWithNotifications();

  const loadEncounter = useCallback(async () => {
    setLoading(true);
    try {
      const data = await encountersService.getEncounterById(effectiveEncounterId);
      setEncounter(data);
      setSubjective(data.soSubjective || '');
      setObjective(data.soObjective || '');
      setAssessment(data.soAssessment || '');
      setPlan(data.soPlan || '');
    } catch (err) {
      console.error(err);
      feedback.error('Error al cargar la atención clínica');
    } finally {
      setLoading(false);
    }
  }, [effectiveEncounterId, feedback]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) loadEncounter();
    });
    return () => {
      active = false;
    };
  }, [loadEncounter]);

  const handleSaveSoap = async () => {
    if (!encounter || encounter.isSigned) return;
    setSaving(true);
    try {
      const updated = await encountersService.updateSoap(encounter.id, {
        soSubjective: subjective,
        soObjective: objective,
        soAssessment: assessment,
        soPlan: plan,
        status: 'in_progress',
      });
      setEncounter(updated);
      feedback.success('Notas SOAP guardadas correctamente en borrador.');
    } catch (err: unknown) {
      console.error(err);
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message as string | undefined) : undefined;
      feedback.error(msg || 'Error al guardar notas SOAP');
    } finally {
      setSaving(false);
    }
  };

  const handleSignEncounter = async () => {
    if (!encounter || encounter.isSigned) return;
    const ok = await feedback.confirm(
      'Firmar y Cerrar Nota Clínica',
      'ATENCIÓN: Una vez firmada, la nota se vuelve estrictamente INMUTABLE y no podrá ser editada. Cualquier cambio posterior deberá registrarse como un Addendum legal fechado. ¿Desea proceder?'
    );
    if (!ok) return;

    setSigning(true);
    try {
      // First save current content
      await encountersService.updateSoap(encounter.id, {
        soSubjective: subjective,
        soObjective: objective,
        soAssessment: assessment,
        soPlan: plan,
      });

      // Then sign
      const signed = await encountersService.signEncounter(encounter.id, 1);
      setEncounter(signed);
      feedback.success('Nota clínica firmada y sellada con éxito.');
    } catch (err: unknown) {
      console.error(err);
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message as string | undefined) : undefined;
      feedback.error(msg || 'Error al firmar la nota clínica');
    } finally {
      setSigning(false);
    }
  };

  const handleCreateAddendum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encounter) return;
    setSubmittingAddendum(true);
    try {
      await encountersService.createAddendum(encounter.id, {
        authorId: 1,
        addendumText,
        reasonForAddendum,
      });
      feedback.success('Addendum registrado y firmado exitosamente.');
      setShowAddendumModal(false);
      setAddendumText('');
      setReasonForAddendum('');
      await loadEncounter();
    } catch (err: unknown) {
      console.error(err);
      const msg = axios.isAxiosError(err) ? (err.response?.data?.message as string | undefined) : undefined;
      feedback.error(msg || 'Error al registrar addendum');
    } finally {
      setSubmittingAddendum(false);
    }
  };

  if (loading) {
    return <div className="p-5 text-center text-muted">Cargando consulta clínica...</div>;
  }

  if (!encounter) {
    return <div className="p-5 text-center text-danger">No se encontró la atención clínica.</div>;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleBack} title="Volver a expedientes">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="h3 text-gray-800 d-flex align-items-center gap-2 mb-1">
              <FileText className="text-primary" />
              Consulta Clínica Estructurada (Notas SOAP)
            </h1>
            <p className="text-muted mb-0">
              Atención #{encounter.id} — Paciente #{encounter.idOlderAdult} — Tipo: {encounter.encounterType}
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {encounter.isSigned ? (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success p-2 d-inline-flex align-items-center gap-1">
                <Lock className="w-4 h-4" /> Nota Clínica Firmada e Inmutable
              </span>
              <button
                type="button"
                className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                onClick={() => setShowAddendumModal(true)}
              >
                <PlusCircle className="w-4 h-4" />
                Añadir Addendum
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleSaveSoap}
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar Borrador'}
              </button>
              <button
                type="button"
                className="btn btn-success d-inline-flex align-items-center gap-1"
                onClick={handleSignEncounter}
                disabled={signing}
              >
                <CheckCircle className="w-4 h-4" />
                {signing ? 'Firmando...' : 'Firmar y Cerrar Nota'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Motivo de consulta */}
      <div className="alert alert-light border shadow-sm mb-4">
        <strong>Motivo Principal:</strong> {encounter.chiefComplaint || 'Consulta médica / valoración de rutina'}
      </div>

      {/* SOAP 4 Quadrants */}
      <div className="row g-4 mb-4">
        {/* S */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-primary border-top border-3">
            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>S — Subjetivo</span>
              <span className="badge bg-primary-subtle text-primary">Anamnesis / Refiere paciente</span>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={5}
                disabled={encounter.isSigned}
                placeholder="Síntomas que describe el residente o su cuidador..."
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* O */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-info border-top border-3">
            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>O — Objetivo</span>
              <span className="badge bg-info-subtle text-info">Examen físico / Signos vitales</span>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={5}
                disabled={encounter.isSigned}
                placeholder="Hallazgos del examen físico, signos medidos, auscultación..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* A */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-warning border-top border-3">
            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>A — Evaluación / Análisis</span>
              <span className="badge bg-warning-subtle text-warning">Juicio clínico / Diagnósticos CIE-10</span>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={5}
                disabled={encounter.isSigned}
                placeholder="Diagnósticos presuntivos o definitivos, evolución clínica..."
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* P */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-success border-top border-3">
            <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>P — Plan Terapéutico</span>
              <span className="badge bg-success-subtle text-success">Tratamiento / Indicaciones</span>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={5}
                disabled={encounter.isSigned}
                placeholder="Prescripciones, cuidados de enfermería, terapias, interconsultas..."
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Addendums Section */}
      {encounter.addendums && encounter.addendums.length > 0 && (
        <div className="card shadow-sm border-0 mt-4">
          <div className="card-header bg-light fw-bold d-flex align-items-center gap-2">
            <AlertTriangle className="text-warning w-5 h-5" />
            Addendums y Enmiendas Médicas Registradas ({encounter.addendums.length})
          </div>
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {encounter.addendums.map((addendum) => (
                <div key={addendum.id} className="list-group-item p-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold text-primary">
                      Addendum #{addendum.id} — Motivo: {addendum.reasonForAddendum}
                    </span>
                    <small className="text-muted">
                      {new Date(addendum.signedAt).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-0 text-dark bg-light p-2 rounded border">
                    {addendum.addendumText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Addendum Modal */}
      {showAddendumModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleCreateAddendum}>
                <div className="modal-header">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <PlusCircle className="text-primary" />
                    Añadir Addendum a Nota Cerrada
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddendumModal(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Motivo o Justificación de la Enmienda</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Aclaración de posología tras control vespertino"
                      value={reasonForAddendum}
                      onChange={(e) => setReasonForAddendum(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Texto del Addendum</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Escriba la observación clínica o ajuste terapéutico..."
                      value={addendumText}
                      onChange={(e) => setAddendumText(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddendumModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submittingAddendum}>
                    {submittingAddendum ? 'Firmando Addendum...' : 'Firmar Addendum'}
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
