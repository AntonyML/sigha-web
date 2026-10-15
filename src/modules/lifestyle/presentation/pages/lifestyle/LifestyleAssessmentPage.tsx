import { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Utensils,
  Moon,
  Footprints,
  Droplets,
  AlertTriangle,
  Plus,
  History,
  X,
  User,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  lifestyleService,
  type LifestyleAssessmentItem,
} from '@/infrastructure/api/services/lifestyleService';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';
import type { VirtualFile } from '@/shared/types/virtualFile';
import { useFeedbackWithNotifications } from '@/shared/hooks/useFeedbackWithNotifications';

export default function LifestyleAssessmentPage() {
  const [residents, setResidents] = useState<VirtualFile[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<number | ''>('');
  const [latestAssessment, setLatestAssessment] = useState<LifestyleAssessmentItem | null>(null);
  const [history, setHistory] = useState<LifestyleAssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    dietType: 'general',
    dietConsistency: 'regular',
    dietAllergiesIntolerances: '',
    mealsPerDay: 4,
    appetite: 'normal',
    dailyFluidIntakeMl: 1500,
    requiresFluidThickener: false,
    dietNotes: '',
    sleepHoursPerNight: 7,
    sleepQuality: 'good',
    sleepMedicationRequired: false,
    sleepNotes: '',
    physicalActivityLevel: 'sedentary',
    dailyWalkingMinutes: 15,
    mobilityAssistanceRequired: false,
    physicalActivityNotes: '',
    smokingStatus: 'never',
    smokingPacksYear: 0,
    alcoholStatus: 'never',
    lifestyleSummary: '',
  });

  const feedback = useFeedbackWithNotifications();

  // Load residents on mount
  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      try {
        const files = await virtualFileService.getAllVirtualFiles();
        if (active) {
          setResidents(files);
          if (files.length > 0 && files[0].id) {
            setSelectedResidentId(files[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Load resident assessment data
  const loadResidentData = useCallback(async (residentId: number) => {
    setLoading(true);
    try {
      const [latest, hist] = await Promise.all([
        lifestyleService.getLatestAssessment(residentId).catch(() => null),
        lifestyleService.getAssessmentHistory(residentId).catch(() => []),
      ]);
      setLatestAssessment(latest);
      setHistory(hist);
    } catch (err) {
      console.error(err);
      feedback.error('Error al sincronizar evaluaciones de estilo de vida', 'Error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    if (selectedResidentId) {
      void Promise.resolve().then(() => {
        if (active) loadResidentData(Number(selectedResidentId));
      });
    } else {
      void Promise.resolve().then(() => {
        if (active) {
          setLatestAssessment(null);
          setHistory([]);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [selectedResidentId, loadResidentData]);

  const selectedResident = residents.find((r) => r.id === selectedResidentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) {
      feedback.error('Seleccione un residente', 'Validación');
      return;
    }

    try {
      await lifestyleService.createAssessment({
        idOlderAdult: Number(selectedResidentId),
        dietType: form.dietType,
        dietConsistency: form.dietConsistency,
        dietAllergiesIntolerances: form.dietAllergiesIntolerances.trim() || undefined,
        mealsPerDay: Number(form.mealsPerDay),
        appetite: form.appetite,
        dailyFluidIntakeMl: Number(form.dailyFluidIntakeMl),
        requiresFluidThickener: form.requiresFluidThickener,
        dietNotes: form.dietNotes.trim() || undefined,
        sleepHoursPerNight: Number(form.sleepHoursPerNight),
        sleepQuality: form.sleepQuality,
        sleepMedicationRequired: form.sleepMedicationRequired,
        sleepNotes: form.sleepNotes.trim() || undefined,
        physicalActivityLevel: form.physicalActivityLevel,
        dailyWalkingMinutes: Number(form.dailyWalkingMinutes),
        mobilityAssistanceRequired: form.mobilityAssistanceRequired,
        physicalActivityNotes: form.physicalActivityNotes.trim() || undefined,
        smokingStatus: form.smokingStatus,
        smokingPacksYear: Number(form.smokingPacksYear),
        alcoholStatus: form.alcoholStatus,
        lifestyleSummary: form.lifestyleSummary.trim() || undefined,
      });

      feedback.success('Evaluación de hábitos registrada correctamente', 'Éxito');
      setShowModal(false);
      loadResidentData(Number(selectedResidentId));
    } catch (err) {
      console.error(err);
      feedback.error('No se pudo guardar la evaluación de estilo de vida', 'Error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Estilo de Vida y Hábitos Geriátricos</h1>
            <p className="text-sm text-gray-500">
              Nutrición, consistencia de dieta, hidratación, descanso y actividad física (GNU Health health_lifestyle)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedResidentId}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Evaluación de Hábitos
        </button>
      </div>

      {/* Resident Picker */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <User className="w-5 h-5 text-gray-400 shrink-0" />
          <div className="w-full md:w-96">
            <label htmlFor="resident-select" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Persona Adulta Mayor
            </label>
            <select
              id="resident-select"
              value={selectedResidentId}
              onChange={(e) => setSelectedResidentId(Number(e.target.value) || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">-- Seleccionar residente --</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombreApellido} (Cédula: {r.cedula})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedResident && latestAssessment && (
          <div className="text-right text-xs text-gray-500">
            <span>Última evaluación registrada: </span>
            <span className="font-semibold text-gray-800">
              {new Date(latestAssessment.assessedAt).toLocaleDateString('es-CR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando evaluaciones de estilo de vida...</div>
      ) : !latestAssessment ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900">Sin evaluación de hábitos registrada</h3>
          <p className="text-sm text-gray-500 mt-1">
            Este residente no cuenta aún con una ficha de nutrición, sueño y actividad física estructurada.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
          >
            <Plus className="w-4 h-4" />
            Crear Primera Evaluación
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Nutrición & Dieta */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold">
                  <Utensils className="w-5 h-5" />
                  <span>Dieta y Nutrición</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-rose-100 text-rose-800">
                  {latestAssessment.dietType}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Consistencia:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {latestAssessment.dietConsistency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Comidas/Día:</span>
                  <span className="font-semibold text-gray-800">{latestAssessment.mealsPerDay} tomas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Apetito:</span>
                  <span className="font-semibold text-gray-800 capitalize">{latestAssessment.appetite}</span>
                </div>
                {latestAssessment.dietAllergiesIntolerances && (
                  <div className="pt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                    <span className="font-bold">Alergias:</span> {latestAssessment.dietAllergiesIntolerances}
                  </div>
                )}
                {latestAssessment.dietNotes && (
                  <p className="text-xs text-gray-500 italic pt-1">&quot;{latestAssessment.dietNotes}&quot;</p>
                )}
              </div>
            </div>

            {/* Pillar 2: Hidratación */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Droplets className="w-5 h-5" />
                  <span>Hidratación</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">Meta: 1500-2000 ml</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-gray-500">Ingesta Diaria:</span>
                    <span className="text-blue-700">{latestAssessment.dailyFluidIntakeMl} ml</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.round((latestAssessment.dailyFluidIntakeMl / 2000) * 100))}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {latestAssessment.requiresFluidThickener ? (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Requiere espesante por riesgo de disfagia</span>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                    Deglución de líquidos sin espesante
                  </div>
                )}
              </div>
            </div>

            {/* Pillar 3: Sueño y Descanso */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Moon className="w-5 h-5" />
                  <span>Sueño y Descanso</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-100 text-indigo-800">
                  {latestAssessment.sleepQuality}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Horas por noche:</span>
                  <span className="font-semibold text-gray-800">
                    {latestAssessment.sleepHoursPerNight} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Inductor de sueño:</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      latestAssessment.sleepMedicationRequired
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {latestAssessment.sleepMedicationRequired ? 'Prescrito' : 'No requiere'}
                  </span>
                </div>
                {latestAssessment.sleepNotes && (
                  <p className="text-xs text-gray-500 italic pt-1">&quot;{latestAssessment.sleepNotes}&quot;</p>
                )}
              </div>
            </div>

            {/* Pillar 4: Actividad y Movilidad */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Footprints className="w-5 h-5" />
                  <span>Actividad Física</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {latestAssessment.physicalActivityLevel}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Caminata diaria:</span>
                  <span className="font-semibold text-gray-800">
                    {latestAssessment.dailyWalkingMinutes} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Asistencia técnica:</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      latestAssessment.mobilityAssistanceRequired
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {latestAssessment.mobilityAssistanceRequired ? 'Asistida' : 'Autónoma'}
                  </span>
                </div>
                {latestAssessment.physicalActivityNotes && (
                  <p className="text-xs text-gray-500 italic pt-1">
                    &quot;{latestAssessment.physicalActivityNotes}&quot;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Toxic Habits & General Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-bold border-b pb-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Factores de Riesgo Toxicológico</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tabaquismo:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {latestAssessment.smokingStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Consumo de alcohol:</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {latestAssessment.alcoholStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 text-gray-800 font-bold border-b pb-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Plan y Recomendaciones Geriátricas</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {latestAssessment.lifestyleSummary ||
                  'Plan de mantenimiento general. Continuar con pauta alimentaria prescrita e hidratación asistida.'}
              </p>
            </div>
          </div>

          {/* Chronological History Table */}
          {history.length > 1 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-bold text-gray-900">Historial de Evaluaciones de Estilo de Vida</h3>
              </div>
              <div className="divide-y text-sm">
                {history.map((h) => (
                  <div key={h.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {new Date(h.assessedAt).toLocaleDateString('es-CR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Dieta: <span className="capitalize">{h.dietType}</span> ({h.dietConsistency}) ·
                        Hidratación: {h.dailyFluidIntakeMl} ml · Sueño: {h.sleepHoursPerNight} hrs · Actividad:{' '}
                        <span className="capitalize">{h.physicalActivityLevel}</span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">ID #{h.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Nueva Evaluación */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-gray-50 p-4 border-b flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-rose-700">
                <Heart className="w-5 h-5" />
                <h3 className="font-bold text-gray-900">Nueva Evaluación de Hábitos Geriátricos</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Sección 1: Dieta */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <Utensils className="w-4 h-4 text-rose-600" />
                  1. Nutrición y Alimentación
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Tipo de Dieta *
                    </label>
                    <select
                      value={form.dietType}
                      onChange={(e) => setForm({ ...form, dietType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="general">General / Normal</option>
                      <option value="soft">Blanda</option>
                      <option value="pureed">Papilla / Triturada</option>
                      <option value="diabetic">Diabética</option>
                      <option value="low_sodium">Hiposódica</option>
                      <option value="renal">Protección Renal</option>
                      <option value="enteral">Enteral / Sonda</option>
                      <option value="hypocaloric">Hipocalórica</option>
                      <option value="other">Otra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Consistencia / Textura *
                    </label>
                    <select
                      value={form.dietConsistency}
                      onChange={(e) => setForm({ ...form, dietConsistency: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="regular">Regular</option>
                      <option value="picada">Picada / Fácil Masticación</option>
                      <option value="papilla">Papilla / Homogénea</option>
                      <option value="liquida">Líquida</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Comidas / Tomas al Día *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={form.mealsPerDay}
                      onChange={(e) => setForm({ ...form, mealsPerDay: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Nivel de Apetito *
                    </label>
                    <select
                      value={form.appetite}
                      onChange={(e) => setForm({ ...form, appetite: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="normal">Normal</option>
                      <option value="reduced">Reducido / Hiporexia</option>
                      <option value="increased">Aumentado</option>
                      <option value="variable">Variable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Alergias o Intolerancias Alimentarias
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Intolerancia a la lactosa, celiaquía, alergia a mariscos..."
                    value={form.dietAllergiesIntolerances}
                    onChange={(e) => setForm({ ...form, dietAllergiesIntolerances: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Sección 2: Hidratación */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  2. Hidratación Diaria
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Ingesta Estimada (ml) *
                    </label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      max="5000"
                      value={form.dailyFluidIntakeMl}
                      onChange={(e) => setForm({ ...form, dailyFluidIntakeMl: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="requiresThickener"
                      checked={form.requiresFluidThickener}
                      onChange={(e) => setForm({ ...form, requiresFluidThickener: e.target.checked })}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <label htmlFor="requiresThickener" className="text-xs font-medium text-gray-700">
                      Requiere espesante para líquidos (Disfagia)
                    </label>
                  </div>
                </div>
              </div>

              {/* Sección 3: Sueño */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  3. Sueño y Descanso
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Horas por Noche *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={form.sleepHoursPerNight}
                      onChange={(e) => setForm({ ...form, sleepHoursPerNight: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Calidad *
                    </label>
                    <select
                      value={form.sleepQuality}
                      onChange={(e) => setForm({ ...form, sleepQuality: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="good">Reparador / Bueno</option>
                      <option value="fair">Regular</option>
                      <option value="insomnia">Insomnio</option>
                      <option value="fragmented">Fragmentado</option>
                      <option value="somnolence">Somnolencia Diurna</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="sleepMed"
                      checked={form.sleepMedicationRequired}
                      onChange={(e) => setForm({ ...form, sleepMedicationRequired: e.target.checked })}
                      className="rounded text-indigo-600 h-4 w-4"
                    />
                    <label htmlFor="sleepMed" className="text-xs font-medium text-gray-700">
                      Requiere inductor del sueño
                    </label>
                  </div>
                </div>
              </div>

              {/* Sección 4: Actividad Física */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                  <Footprints className="w-4 h-4 text-emerald-600" />
                  4. Actividad Física y Movilidad
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Nivel *
                    </label>
                    <select
                      value={form.physicalActivityLevel}
                      onChange={(e) => setForm({ ...form, physicalActivityLevel: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="sedentary">Sedentario / En Cama</option>
                      <option value="light_assisted">Ligera Asistida</option>
                      <option value="moderate">Moderada</option>
                      <option value="active">Activa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Caminata Diaria (min) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={form.dailyWalkingMinutes}
                      onChange={(e) => setForm({ ...form, dailyWalkingMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="mobAssist"
                      checked={form.mobilityAssistanceRequired}
                      onChange={(e) => setForm({ ...form, mobilityAssistanceRequired: e.target.checked })}
                      className="rounded text-emerald-600 h-4 w-4"
                    />
                    <label htmlFor="mobAssist" className="text-xs font-medium text-gray-700">
                      Requiere asistencia física
                    </label>
                  </div>
                </div>
              </div>

              {/* Plan y Resumen */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Resumen de Recomendaciones Geriátricas
                </label>
                <textarea
                  rows={3}
                  placeholder="Observaciones interdisciplinarias, recomendaciones de enfermería o fisioterapia..."
                  value={form.lifestyleSummary}
                  onChange={(e) => setForm({ ...form, lifestyleSummary: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
