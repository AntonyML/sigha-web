'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { carePlanService } from '@/infrastructure/api/services/carePlanService';
import { getApiErrorMessage } from '@/shared/lib/apiError';
import { usePermissions } from '@/shared/lib/permissionUtils';
import { ResidentSearchPicker } from '@/modules/residents';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';
import type { PatientBasicInfo } from '@/shared/types/virtualFile';
import type { CareProgram, CareScaleEvaluation, CarePlanStatus, ResidentProgramEnrollment } from '@/shared/types/carePlan';

type Tab = 'enrollments' | 'catalog';
type EnrollmentDateDraft = { startedAt: string; endedAt: string };

function asLocalDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromLocalDate(value: string): string {
  return new Date(`${value}T12:00:00`).toISOString();
}

export default function CarePlansPage() {
  const [tab, setTab] = useState<Tab>('enrollments');
  const [catalog, setCatalog] = useState<CareProgram[]>([]);
  const [enrollments, setEnrollments] = useState<ResidentProgramEnrollment[]>([]);
  const [evaluations, setEvaluations] = useState<CareScaleEvaluation[]>([]);
  const [resident, setResident] = useState<PatientBasicInfo | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');
  const [selectedSubprogramId, setSelectedSubprogramId] = useState<number | ''>('');
  const [scaleEvaluationId, setScaleEvaluationId] = useState<number | ''>('');
  const [goals, setGoals] = useState('');
  const [startedAt, setStartedAt] = useState(new Date().toISOString().slice(0, 10));
  const [programName, setProgramName] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [subprogramName, setSubprogramName] = useState('');
  const [subprogramDescription, setSubprogramDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<CarePlanStatus | ''>('');
  const [goalDrafts, setGoalDrafts] = useState<Record<number, string>>({});
  const [dateDrafts, setDateDrafts] = useState<Record<number, EnrollmentDateDraft>>({});
  const { canPerformAction } = usePermissions();
  const feedback = useFeedbackWithNotifications();
  const canCreate = canPerformAction('carePlans', 'create');
  const canEdit = canPerformAction('carePlans', 'edit');

  const selectedProgram = useMemo(
    () => catalog.find((program) => program.id === Number(selectedProgramId)),
    [catalog, selectedProgramId],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catalogData, enrollmentData] = await Promise.all([
        carePlanService.getCatalog(),
        carePlanService.getEnrollments(statusFilter ? { status: statusFilter } : {}),
      ]);
      setCatalog(catalogData);
      setEnrollments(enrollmentData);
      setGoalDrafts(Object.fromEntries(enrollmentData.map((entry) => [entry.id, entry.goals ?? ''])));
      setDateDrafts(Object.fromEntries(enrollmentData.map((entry) => [entry.id, {
        startedAt: asLocalDate(entry.startedAt),
        endedAt: asLocalDate(entry.endedAt),
      }])));
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los planes de cuidado.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const selectedResidentId = resident?.id;

  useEffect(() => {
    const residentId = selectedResidentId;
    if (!residentId) return;
    let active = true;
    void carePlanService.getScaleEvaluations(residentId)
      .then((items) => { if (active) setEvaluations(items); })
      .catch((err) => {
        if (!active) return;
        setEvaluations([]);
        setError(getApiErrorMessage(err, 'No se pudieron cargar las evaluaciones clínicas.'));
      });
    return () => { active = false; };
  }, [selectedResidentId]);

  function handleResidentChange(nextResident: PatientBasicInfo | null) {
    setResident(nextResident);
    setEvaluations([]);
    setScaleEvaluationId('');
  }

  function handleProgramChange(value: number | '') {
    setSelectedProgramId(value);
    setSelectedSubprogramId('');
  }

  async function handleCreateEnrollment(event: FormEvent) {
    event.preventDefault();
    if (!resident || !selectedSubprogramId) {
      setError('Seleccione un residente y un subprograma para continuar.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await carePlanService.createEnrollment({
        residentId: resident.id,
        subprogramId: Number(selectedSubprogramId),
        scaleEvaluationId: scaleEvaluationId ? Number(scaleEvaluationId) : undefined,
        goals: goals.trim() || undefined,
        startedAt: startedAt ? new Date(`${startedAt}T12:00:00`).toISOString() : undefined,
      });
      setResident(null);
      setSelectedProgramId('');
      setSelectedSubprogramId('');
      setScaleEvaluationId('');
      setGoals('');
      await loadData();
      feedback.success('Residente inscrito en el plan de cuidado.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear la inscripción.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateProgram(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await carePlanService.createProgram({ name: programName.trim(), description: programDescription.trim() || undefined });
      setProgramName('');
      setProgramDescription('');
      await loadData();
      handleProgramChange(created.id);
      feedback.success('Programa de cuidado creado.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear el programa de cuidado.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateSubprogram(event: FormEvent) {
    event.preventDefault();
    if (!selectedProgramId) {
      setError('Seleccione el programa al que pertenece el subprograma.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await carePlanService.createSubprogram({
        programId: Number(selectedProgramId),
        name: subprogramName.trim(),
        description: subprogramDescription.trim() || undefined,
      });
      setSubprogramName('');
      setSubprogramDescription('');
      await loadData();
      feedback.success('Subprograma de cuidado creado.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear el subprograma de cuidado.'));
    } finally {
      setSaving(false);
    }
  }

  async function saveGoals(enrollment: ResidentProgramEnrollment) {
    setSaving(true);
    setError('');
    try {
      await carePlanService.updateEnrollment(enrollment.id, { goals: goalDrafts[enrollment.id] ?? '' });
      await loadData();
      feedback.success('Metas actualizadas.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron actualizar las metas.'));
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(enrollment: ResidentProgramEnrollment, status: CarePlanStatus) {
    setSaving(true);
    setError('');
    try {
      await carePlanService.updateEnrollment(enrollment.id, { status });
      await loadData();
      feedback.success('Estado de la inscripción actualizado.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo actualizar el estado.'));
    } finally {
      setSaving(false);
    }
  }

  async function saveDates(enrollment: ResidentProgramEnrollment) {
    const draft = dateDrafts[enrollment.id];
    if (!draft?.startedAt) {
      setError('La fecha de inicio es obligatoria.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await carePlanService.updateEnrollment(enrollment.id, {
        startedAt: fromLocalDate(draft.startedAt),
        endedAt: draft.endedAt ? fromLocalDate(draft.endedAt) : undefined,
      });
      await loadData();
      feedback.success('Fechas del plan actualizadas.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron actualizar las fechas.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Planes de cuidado</h1>
          <p className="text-muted mb-0">Inscripciones, metas, evaluaciones clínicas y seguimiento de fechas.</p>
        </div>
        <div className="btn-group" role="tablist" aria-label="Secciones de planes de cuidado">
          <button type="button" className={`btn ${tab === 'enrollments' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('enrollments')}>
            Inscripciones
          </button>
          <button type="button" className={`btn ${tab === 'catalog' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('catalog')}>
            Programas de cuidado
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}<button type="button" className="btn btn-link p-0 ms-2" onClick={() => void loadData()}>Reintentar</button></div>}

      {tab === 'enrollments' && (
        <>
          {canCreate && (
            <section className="card mb-4" aria-labelledby="new-enrollment-title">
              <div className="card-header"><h2 className="h5 mb-0" id="new-enrollment-title">Inscribir residente</h2></div>
              <form className="card-body" onSubmit={handleCreateEnrollment}>
                <div className="row">
                  <div className="col-lg-6">
                    <ResidentSearchPicker value={resident} onChange={handleResidentChange} required disabled={saving} />
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <label className="form-label fw-semibold" htmlFor="care-program">Programa</label>
                    <select id="care-program" className="form-select" value={selectedProgramId} onChange={(event) => handleProgramChange(event.target.value ? Number(event.target.value) : '')} required disabled={saving}>
                      <option value="">Seleccione un programa</option>
                      {catalog.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <label className="form-label fw-semibold" htmlFor="care-subprogram">Subprograma</label>
                    <select id="care-subprogram" className="form-select" value={selectedSubprogramId} onChange={(event) => setSelectedSubprogramId(event.target.value ? Number(event.target.value) : '')} required disabled={saving || !selectedProgram}>
                      <option value="">Seleccione un subprograma</option>
                      {selectedProgram?.subprograms.map((subprogram) => <option key={subprogram.id} value={subprogram.id}>{subprogram.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" htmlFor="care-evaluation">Evaluación clínica asociada</label>
                    <select id="care-evaluation" className="form-select" value={scaleEvaluationId} onChange={(event) => setScaleEvaluationId(event.target.value ? Number(event.target.value) : '')} disabled={saving || !resident}>
                      <option value="">Sin evaluación asociada</option>
                      {evaluations.map((evaluation) => <option key={evaluation.id} value={evaluation.id}>{evaluation.scaleType} · {evaluation.totalScore} · {new Date(evaluation.evaluatedAt).toLocaleDateString('es-CR')}</option>)}
                    </select>
                    {resident && evaluations.length === 0 && <small className="text-muted">Este residente todavía no tiene evaluaciones de escala registradas.</small>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold" htmlFor="care-start-date">Fecha de inicio</label>
                    <input id="care-start-date" type="date" className="form-control" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} required disabled={saving} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold" htmlFor="care-goals">Metas de cuidado</label>
                    <textarea id="care-goals" className="form-control" rows={2} value={goals} onChange={(event) => setGoals(event.target.value)} maxLength={10000} placeholder="Describa metas medibles y observables" disabled={saving} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3" disabled={saving || catalog.every((program) => program.subprograms.length === 0)}>
                  {saving ? 'Guardando…' : 'Crear inscripción'}
                </button>
                {catalog.length === 0 && <p className="text-muted mt-2 mb-0">Agregue un programa y un subprograma en la pestaña “Programas de cuidado” antes de inscribir.</p>}
              </form>
            </section>
          )}

          <section className="card">
            <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
              <h2 className="h5 mb-0">Seguimiento de residentes</h2>
              <label className="d-flex align-items-center gap-2">
                <span className="small">Estado</span>
                <select className="form-select form-select-sm" aria-label="Filtrar inscripciones por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CarePlanStatus | '')}>
                  <option value="">Todos</option><option value="active">Activo</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option>
                </select>
              </label>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead><tr><th>Residente</th><th>Programa / subprograma</th><th>Evaluación</th><th>Metas</th><th>Fechas</th><th>Estado</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} className="text-center py-4">Cargando inscripciones…</td></tr> : enrollments.length === 0 ? <tr><td colSpan={6} className="text-center text-muted py-4">No hay inscripciones para mostrar.</td></tr> : enrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.resident?.name ?? `Residente ${enrollment.idOlderAdult}`}</td>
                      <td><strong>{enrollment.subprogram?.programName ?? 'Programa'}</strong><br />{enrollment.subprogram?.name ?? `Subprograma ${enrollment.subprogramId}`}</td>
                      <td>{enrollment.scaleEvaluation ? <><strong>{enrollment.scaleEvaluation.scaleType}</strong><br /><small>{enrollment.scaleEvaluation.totalScore} · {new Date(enrollment.scaleEvaluation.evaluatedAt).toLocaleDateString('es-CR')}</small></> : <span className="text-muted">Sin asociar</span>}</td>
                      <td style={{ minWidth: 240 }}>
                        <textarea className="form-control form-control-sm" rows={2} aria-label={`Metas de ${enrollment.resident?.name ?? enrollment.idOlderAdult}`} value={goalDrafts[enrollment.id] ?? ''} onChange={(event) => setGoalDrafts((current) => ({ ...current, [enrollment.id]: event.target.value }))} disabled={!canEdit || saving} />
                        {canEdit && <button type="button" className="btn btn-link btn-sm p-0 mt-1" onClick={() => void saveGoals(enrollment)} disabled={saving}>Guardar metas</button>}
                      </td>
                      <td style={{ minWidth: 180 }}>
                        {canEdit ? <div className="d-grid gap-1">
                          <label className="small">Inicio<input type="date" className="form-control form-control-sm" aria-label={`Fecha de inicio de ${enrollment.resident?.name ?? enrollment.idOlderAdult}`} value={dateDrafts[enrollment.id]?.startedAt ?? ''} onChange={(event) => setDateDrafts((current) => ({ ...current, [enrollment.id]: { startedAt: event.target.value, endedAt: current[enrollment.id]?.endedAt ?? '' } }))} disabled={saving} /></label>
                          <label className="small">Fin<input type="date" className="form-control form-control-sm" aria-label={`Fecha de término de ${enrollment.resident?.name ?? enrollment.idOlderAdult}`} value={dateDrafts[enrollment.id]?.endedAt ?? ''} onChange={(event) => setDateDrafts((current) => ({ ...current, [enrollment.id]: { startedAt: current[enrollment.id]?.startedAt ?? asLocalDate(enrollment.startedAt), endedAt: event.target.value } }))} disabled={saving || enrollment.status === 'active'} /></label>
                          <button type="button" className="btn btn-link btn-sm p-0 text-start" onClick={() => void saveDates(enrollment)} disabled={saving}>Guardar fechas</button>
                        </div> : <small>Inicio: {new Date(enrollment.startedAt).toLocaleDateString('es-CR')}<br />Fin: {enrollment.endedAt ? new Date(enrollment.endedAt).toLocaleDateString('es-CR') : '—'}</small>}
                      </td>
                      <td>
                        {canEdit ? <select className="form-select form-select-sm" aria-label={`Estado de ${enrollment.resident?.name ?? enrollment.idOlderAdult}`} value={enrollment.status} onChange={(event) => void updateStatus(enrollment, event.target.value as CarePlanStatus)} disabled={saving}>
                          <option value="active">Activo</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option>
                        </select> : <span className="badge text-bg-secondary">{enrollment.status}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === 'catalog' && (
        <div className="row g-4">
          <div className="col-xl-6">
            <section className="card h-100">
              <div className="card-header"><h2 className="h5 mb-0">Programas y subprogramas activos</h2></div>
              <div className="card-body">
                {loading ? <p>Cargando catálogo…</p> : catalog.length === 0 ? <p className="text-muted">No hay programas de cuidado registrados.</p> : catalog.map((program) => (
                  <div key={program.id} className="border-bottom pb-3 mb-3">
                    <h3 className="h6 mb-1">{program.name}</h3>
                    {program.description && <p className="small text-muted mb-2">{program.description}</p>}
                    {program.subprograms.length ? <ul className="mb-0">{program.subprograms.map((subprogram) => <li key={subprogram.id}>{subprogram.name}{subprogram.description ? ` — ${subprogram.description}` : ''}</li>)}</ul> : <p className="small text-muted mb-0">Aún no tiene subprogramas.</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>
          {canCreate && <div className="col-xl-6">
            <section className="card mb-4">
              <div className="card-header"><h2 className="h5 mb-0">Crear programa de cuidado</h2></div>
              <form className="card-body" onSubmit={handleCreateProgram}>
                <label className="form-label" htmlFor="new-care-program">Nombre</label>
                <input id="new-care-program" className="form-control mb-2" value={programName} onChange={(event) => setProgramName(event.target.value)} maxLength={200} required disabled={saving} />
                <label className="form-label" htmlFor="new-care-program-description">Descripción</label>
                <textarea id="new-care-program-description" className="form-control mb-3" value={programDescription} onChange={(event) => setProgramDescription(event.target.value)} maxLength={5000} disabled={saving} />
                <button className="btn btn-primary" type="submit" disabled={saving}>Crear programa</button>
              </form>
            </section>
            <section className="card">
              <div className="card-header"><h2 className="h5 mb-0">Crear subprograma</h2></div>
              <form className="card-body" onSubmit={handleCreateSubprogram}>
                <label className="form-label" htmlFor="parent-care-program">Programa</label>
                <select id="parent-care-program" className="form-select mb-2" value={selectedProgramId} onChange={(event) => handleProgramChange(event.target.value ? Number(event.target.value) : '')} required disabled={saving}>
                  <option value="">Seleccione un programa</option>{catalog.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
                </select>
                <label className="form-label" htmlFor="new-care-subprogram">Nombre</label>
                <input id="new-care-subprogram" className="form-control mb-2" value={subprogramName} onChange={(event) => setSubprogramName(event.target.value)} maxLength={200} required disabled={saving || !selectedProgramId} />
                <label className="form-label" htmlFor="new-care-subprogram-description">Descripción</label>
                <textarea id="new-care-subprogram-description" className="form-control mb-3" value={subprogramDescription} onChange={(event) => setSubprogramDescription(event.target.value)} maxLength={5000} disabled={saving || !selectedProgramId} />
                <button className="btn btn-primary" type="submit" disabled={saving || !selectedProgramId}>Crear subprograma</button>
              </form>
            </section>
          </div>}
        </div>
      )}
    </main>
  );
}
