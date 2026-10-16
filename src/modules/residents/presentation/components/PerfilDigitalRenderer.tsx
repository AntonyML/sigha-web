'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Save,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
  ToggleLeft,
  ToggleRight,
  List,
  AlignLeft,
} from 'lucide-react';
import { perfilDigitalService } from '@/infrastructure/api/services/perfilDigitalService';
import type {
  PlantillaPerfil,
  SeccionCampo,
  DefinicionCampo,
  PerfilDigital,
} from '@/shared/types/perfilDigital';

interface PerfilDigitalRendererProps {
  perfilId: string;
  readonly?: boolean;
  onSaved?: () => void;
}

export const PerfilDigitalRenderer: React.FC<PerfilDigitalRendererProps> = ({
  perfilId,
  readonly = false,
  onSaved,
}) => {
  const [esquema, setEsquema] = useState<PlantillaPerfil | null>(null);
  const [datos, setDatos] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!readonly);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPerfilDigital = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const res = await perfilDigitalService.getByPerfilId(perfilId);

      if (res.esquema) {
        setEsquema(res.esquema);
      } else {
        // Fallback to active template
        const plantillaDefault = await perfilDigitalService.getPlantillaVigente('RESIDENTE');
        setEsquema(plantillaDefault);
      }

      setDatos(res.perfilDigital?.datos || {});
    } catch (err: any) {
      console.error('Error cargando perfil digital:', err);
      // Fallback a plantilla vigente si el perfil aún no tiene registro digital
      try {
        const plantillaDefault = await perfilDigitalService.getPlantillaVigente('RESIDENTE');
        setEsquema(plantillaDefault);
      } catch {
        setMessage({
          type: 'error',
          text: 'No se pudo cargar el esquema del perfil digital configurable.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [perfilId]);

  useEffect(() => {
    void loadPerfilDigital();
  }, [loadPerfilDigital]);

  const handleInputChange = (clave: string, valor: any) => {
    setDatos((prev) => ({
      ...prev,
      [clave]: valor,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      // Validate required fields
      if (esquema?.secciones) {
        for (const seccion of esquema.secciones) {
          for (const campo of seccion.campos) {
            if (campo.obligatorio && (datos[campo.clave] === undefined || datos[campo.clave] === '' || datos[campo.clave] === null)) {
              setMessage({
                type: 'error',
                text: `El campo "${campo.etiqueta}" en la sección "${seccion.titulo}" es obligatorio.`,
              });
              setSaving(false);
              return;
            }
          }
        }
      }

      await perfilDigitalService.saveDatos(perfilId, {
        datos,
        plantillaId: esquema?.id,
      });

      setMessage({
        type: 'success',
        text: 'Perfil digital actualizado exitosamente.',
      });
      setIsEditing(false);
      onSaved?.();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Error al guardar los datos del perfil digital.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Cargando perfil digital...</span>
      </div>
    );
  }

  if (!esquema || !esquema.secciones || esquema.secciones.length === 0) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-600">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-semibold text-sm">No hay plantilla de perfil digital configurada para este rol.</p>
        <p className="text-xs text-slate-500 mt-1">Los administradores pueden definir campos dinámicos desde la configuración.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de acción superior */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{esquema.nombre}</h3>
            <p className="text-xs text-slate-500">Versión {esquema.version} • Esquema configurable</p>
          </div>
        </div>

        {!readonly && (
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 shadow-sm"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar cambios
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" /> Editar perfil digital
              </button>
            )}
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg flex items-center gap-2.5 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Renderizado de Secciones y Campos */}
      <form onSubmit={handleSave} className="space-y-6">
        {esquema.secciones.map((seccion) => {
          const camposVisibles = seccion.campos.filter((c) => c.visible !== false);
          if (camposVisibles.length === 0) return null;

          return (
            <div
              key={seccion.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{seccion.titulo}</h4>
                  {seccion.descripcion && (
                    <p className="text-xs text-slate-500">{seccion.descripcion}</p>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {camposVisibles.length} {camposVisibles.length === 1 ? 'campo' : 'campos'}
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {camposVisibles.map((campo) => {
                  const valor = datos[campo.clave];

                  if (!isEditing) {
                    // Modo Solo Lectura
                    return (
                      <div key={campo.id} className="space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {campo.etiqueta}
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                          {formatReadOnlyValue(campo, valor)}
                        </div>
                      </div>
                    );
                  }

                  // Modo Edición interactivo
                  return (
                    <div
                      key={campo.id}
                      className={campo.tipo === 'area_texto' ? 'md:col-span-2 space-y-1.5' : 'space-y-1.5'}
                    >
                      <label className="block text-xs font-semibold text-slate-700">
                        {campo.etiqueta}
                        {campo.obligatorio && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {renderFieldInput(campo, valor, (val) => handleInputChange(campo.clave, val))}

                      {campo.descripcion && (
                        <p className="text-[11px] text-slate-400">{campo.descripcion}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {isEditing && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar perfil digital
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

/* ─── Helpers de Renderizado de Entradas Dinámicas ─── */

function renderFieldInput(
  campo: DefinicionCampo,
  valor: any,
  onChange: (val: any) => void,
) {
  const commonClasses =
    'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900';

  switch (campo.tipo) {
    case 'booleano':
      const isChecked = Boolean(valor);
      return (
        <button
          type="button"
          onClick={() => onChange(!isChecked)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isChecked
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {isChecked ? (
            <ToggleRight className="w-4 h-4 text-blue-600" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-slate-400" />
          )}
          <span>{isChecked ? 'Sí / Activo' : 'No / Inactivo'}</span>
        </button>
      );

    case 'area_texto':
      return (
        <textarea
          rows={3}
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
          className={commonClasses}
        />
      );

    case 'numero':
    case 'decimal':
      return (
        <input
          type="number"
          step={campo.tipo === 'decimal' ? '0.01' : '1'}
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder="0"
          className={commonClasses}
        />
      );

    case 'fecha':
      return (
        <input
          type="date"
          value={valor ? String(valor).substring(0, 10) : ''}
          onChange={(e) => onChange(e.target.value)}
          className={commonClasses}
        />
      );

    case 'opcion_simple':
      const opciones = Array.isArray(campo.opciones) ? campo.opciones : [];
      return (
        <select
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={commonClasses}
        >
          <option value="">Seleccione una opción...</option>
          {opciones.map((opt, i) => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const val = typeof opt === 'string' ? opt : opt.value;
            return (
              <option key={i} value={val}>
                {label}
              </option>
            );
          })}
        </select>
      );

    case 'opcion_multiple':
      const multiOpciones = Array.isArray(campo.opciones) ? campo.opciones : [];
      const seleccionados: string[] = Array.isArray(valor) ? valor : [];
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {multiOpciones.map((opt, i) => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const val = typeof opt === 'string' ? opt : opt.value;
            const active = seleccionados.includes(val);
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (active) {
                    onChange(seleccionados.filter((s) => s !== val));
                  } else {
                    onChange([...seleccionados, val]);
                  }
                }}
                className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      );

    case 'texto':
    default:
      return (
        <input
          type="text"
          value={valor ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ingrese ${campo.etiqueta.toLowerCase()}`}
          className={commonClasses}
        />
      );
  }
}

function formatReadOnlyValue(campo: DefinicionCampo, valor: any): React.ReactNode {
  if (valor === undefined || valor === null || valor === '') {
    return <span className="text-slate-400 italic font-normal">No especificado</span>;
  }

  if (campo.tipo === 'booleano') {
    return valor ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Sí
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
        No
      </span>
    );
  }

  if (campo.tipo === 'opcion_multiple' && Array.isArray(valor)) {
    return (
      <div className="flex flex-wrap gap-1">
        {valor.map((v, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
          >
            {v}
          </span>
        ))}
      </div>
    );
  }

  return String(valor);
}
