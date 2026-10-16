import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@/shared/navigation'
import { ShieldPlus, ArrowLeft, Plus, Search, X, Pencil, Trash2, Syringe } from 'lucide-react'
import type { Vaccine } from '@/shared/types/vaccine'
import { vaccineService } from '@/infrastructure/api/services/vaccineService'
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications'
import { usePagination } from '@/shared/hooks/usePagination'
import Pagination from '@/shared/ui/data-display/Pagination/Pagination'
import { DatePicker } from '@/shared/ui/forms/DatePicker'
import { DateDisplay } from '@/shared/ui/data-display/DateDisplay'

interface PatientVaccination {
  id: number;
  olderAdultId: number;
  olderAdultName: string;
  vaccineName: string;
  dose: string;
  lotNumber: string;
  expirationDate: string;
  administeredAt: string;
  professionalName: string;
  adverseReactions?: string;
}

const INITIAL_IMMUNIZATIONS: PatientVaccination[] = [
  {
    id: 1,
    olderAdultId: 1,
    olderAdultName: 'María Elena Morales Castro',
    vaccineName: 'Influenza Estacional',
    dose: 'Dosis Anual 2026',
    lotNumber: 'INF-2026-X9',
    expirationDate: '2027-04-30',
    administeredAt: '2026-05-10',
    professionalName: 'Lic. Laura Brenes (Enfermería)',
    adverseReactions: 'Ninguna',
  },
  {
    id: 2,
    olderAdultId: 1,
    olderAdultName: 'María Elena Morales Castro',
    vaccineName: 'Neumococo Conjugada (PCV13)',
    dose: 'Dosis Única',
    lotNumber: 'PCV-8842',
    expirationDate: '2026-12-15',
    administeredAt: '2026-03-12',
    professionalName: 'Lic. Carlos Umaña (Enfermería)',
    adverseReactions: 'Dolor leve en sitio de punción',
  },
];

export default function VaccineListPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'records'>('catalog');
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [immunizations, setImmunizations] = useState<PatientVaccination[]>(INITIAL_IMMUNIZATIONS);
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [doseForm, setDoseForm] = useState({
    olderAdultName: '',
    vaccineName: 'Influenza Estacional',
    dose: 'Refuerzo',
    lotNumber: '',
    expirationDate: '',
    adverseReactions: '',
  });

  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const loadVaccines = useCallback(async () => {
    setLoading(true)
    try {
      const data = await vaccineService.getAllVaccines()
      setVaccines(data)
    } catch (err) {
      console.error(err)
      feedback.error('Error al cargar las vacunas', 'Error de carga')
    } finally {
      setLoading(false)
    }
  }, [feedback]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) loadVaccines();
    });
    return () => {
      active = false;
    };
  }, [loadVaccines])

  async function handleDelete(id: number) {
    const ok = await feedback.confirm('¿Está seguro de que desea eliminar esta vacuna?', 'Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await vaccineService.deleteVaccine(id)
      await loadVaccines()
      feedback.success('Vacuna eliminada exitosamente')
      feedback.showNotification({ title: 'Vacuna eliminada', message: 'La vacuna ha sido eliminada del sistema', variant: 'success' })
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar la vacuna', 'Error de eliminación')
    }
  }

  const handleCreateDose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doseForm.olderAdultName.trim() || !doseForm.lotNumber.trim()) {
      feedback.error('El nombre del residente y número de lote son requeridos');
      return;
    }
    const newEntry: PatientVaccination = {
      id: immunizations.length + 1,
      olderAdultId: 1,
      olderAdultName: doseForm.olderAdultName,
      vaccineName: doseForm.vaccineName,
      dose: doseForm.dose,
      lotNumber: doseForm.lotNumber,
      expirationDate: doseForm.expirationDate || new Date().toISOString().split('T')[0],
      administeredAt: new Date().toISOString().split('T')[0],
      professionalName: 'Enfermería de Guardia',
      adverseReactions: doseForm.adverseReactions || 'Ninguna',
    };
    setImmunizations([newEntry, ...immunizations]);
    feedback.success('Dosis de inmunización registrada con lote y trazabilidad.');
    setShowDoseModal(false);
    setDoseForm({
      olderAdultName: '',
      vaccineName: 'Influenza Estacional',
      dose: 'Refuerzo',
      lotNumber: '',
      expirationDate: '',
      adverseReactions: '',
    });
  };

  const filteredVaccines = vaccines.filter(v =>
    v.vName && v.vName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredImmunizations = immunizations.filter(i =>
    i.olderAdultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.lotNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { paginatedItems: paginatedVaccines, page, totalPages, total, pageSize, goToPage } = usePagination(filteredVaccines)
  const { paginatedItems: paginatedImm, page: immPage, totalPages: immTotalPages, total: immTotal, pageSize: immPageSize, goToPage: goToImmPage } = usePagination(filteredImmunizations)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <ShieldPlus size={22} color="#2563eb" />
          Vacunación e Inmunizaciones
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Menú Principal
          </button>
          {activeTab === 'catalog' ? (
            <button className="lp-btn lp-btn--primary" onClick={() => navigate('/vaccines/create')}>
              <Plus size={16} /> Nueva Vacuna
            </button>
          ) : (
            <button className="lp-btn lp-btn--primary" style={{ background: '#0284c7' }} onClick={() => setShowDoseModal(true)}>
              <Syringe size={16} /> Registrar Aplicación
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'catalog' ? '#2563eb' : '#f1f5f9',
            color: activeTab === 'catalog' ? '#fff' : '#475569',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Catálogo de Vacunas ({vaccines.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('records')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: activeTab === 'records' ? '#0284c7' : '#f1f5f9',
            color: activeTab === 'records' ? '#fff' : '#475569',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Historial de Inmunización (Lote y Trazabilidad) ({immunizations.length})
        </button>
      </div>

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar vacunas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="lp-search-clear" onClick={() => setSearchTerm('')}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando vacunas...</span>
        </div>
      ) : activeTab === 'catalog' ? (
        filteredVaccines.length === 0 ? (
          <div className="lp-empty">
            <ShieldPlus size={48} className="lp-empty__icon" />
            <p>{searchTerm ? 'No se encontraron vacunas con esa búsqueda.' : 'No hay vacunas registradas.'}</p>
          </div>
        ) : (
          <div className="lp-card">
            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead className="lp-table-head">
                  <tr>
                    <th>ID</th>
                    <th>Nombre de la Vacuna</th>
                    <th className="center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVaccines.map(vaccine => (
                    <tr key={vaccine.id}>
                      <td><span className="lp-badge lp-badge--id">{vaccine.id}</span></td>
                      <td><strong>{vaccine.vName}</strong></td>
                      <td className="center">
                        <div className="lp-table-actions">
                          <button
                            className="lp-icon-btn lp-icon-btn--edit"
                            title="Editar"
                            onClick={() => navigate(`/vaccines/edit/${vaccine.id}`)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="lp-icon-btn lp-icon-btn--delete"
                            title="Eliminar"
                            onClick={() => handleDelete(vaccine.id!)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
          </div>
        )
      ) : (
        filteredImmunizations.length === 0 ? (
          <div className="lp-empty">
            <Syringe size={48} className="lp-empty__icon" />
            <p>No hay registros de inmunización aplicados con ese criterio.</p>
          </div>
        ) : (
          <div className="lp-card">
            <div className="lp-table-wrap">
              <table className="lp-table">
                <thead className="lp-table-head">
                  <tr>
                    <th>Residente</th>
                    <th>Vacuna</th>
                    <th>Dosis</th>
                    <th>Lote</th>
                    <th>F. Vence</th>
                    <th>Fecha Aplicación</th>
                    <th>Responsable</th>
                    <th>Reacciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedImm.map(imm => (
                    <tr key={imm.id}>
                      <td><strong>{imm.olderAdultName}</strong></td>
                      <td><span className="lp-badge lp-badge--info">{imm.vaccineName}</span></td>
                      <td>{imm.dose}</td>
                      <td><code>{imm.lotNumber}</code></td>
                      <td><DateDisplay value={imm.expirationDate} /></td>
                      <td><DateDisplay value={imm.administeredAt} /></td>
                      <td><small className="text-muted">{imm.professionalName}</small></td>
                      <td>
                        {imm.adverseReactions === 'Ninguna'
                          ? <span className="badge bg-success-subtle text-success">Sin reacción</span>
                          : <span className="badge bg-warning-subtle text-warning">{imm.adverseReactions}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={immPage} totalPages={immTotalPages} total={immTotal} pageSize={immPageSize} onPageChange={goToImmPage} />
          </div>
        )
      )}

      {!loading && (
        <div className="lp-count">
          Total: {activeTab === 'catalog' ? filteredVaccines.length : filteredImmunizations.length} registro(s)
        </div>
      )}

      {/* Modal Registrar Dosis de Inmunización */}
      {showDoseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', width: '100%', maxWidth: 520, padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                <Syringe size={20} /> Registrar Dosis de Inmunización
              </h3>
              <button type="button" onClick={() => setShowDoseModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDose}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Nombre del Residente <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                  placeholder="Ej: María Elena Morales Castro"
                  value={doseForm.olderAdultName}
                  onChange={e => setDoseForm({ ...doseForm, olderAdultName: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Vacuna
                  </label>
                  <select
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                    value={doseForm.vaccineName}
                    onChange={e => setDoseForm({ ...doseForm, vaccineName: e.target.value })}
                  >
                    {vaccines.length > 0 ? (
                      vaccines.map(v => <option key={v.id} value={v.vName}>{v.vName}</option>)
                    ) : (
                      <>
                        <option value="Influenza Estacional">Influenza Estacional</option>
                        <option value="Neumococo Conjugada">Neumococo Conjugada</option>
                        <option value="COVID-19 Refuerzo Bivalente">COVID-19 Refuerzo Bivalente</option>
                        <option value="Tétanos / Difteria (dT)">Tétanos / Difteria (dT)</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Dosis
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                    placeholder="Ej: Dosis Anual o Refuerzo"
                    value={doseForm.dose}
                    onChange={e => setDoseForm({ ...doseForm, dose: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Número de Lote <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                    placeholder="Ej: VAC-2026-99A"
                    value={doseForm.lotNumber}
                    onChange={e => setDoseForm({ ...doseForm, lotNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Fecha Vencimiento Vial
                  </label>
                  <DatePicker
                    value={doseForm.expirationDate}
                    onChange={val => setDoseForm({ ...doseForm, expirationDate: val })}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Reacciones Adversas Observadas (Opcional)
                </label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem' }}
                  placeholder="Ej: Ninguna, eritema local leve, febrícula"
                  value={doseForm.adverseReactions}
                  onChange={e => setDoseForm({ ...doseForm, adverseReactions: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDoseModal(false)}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '0.375rem', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', border: 'none', background: '#0284c7', color: '#fff', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Guardar Inmunización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}