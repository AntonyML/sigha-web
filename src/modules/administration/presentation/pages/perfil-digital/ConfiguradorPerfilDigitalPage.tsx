'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderPlus,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { perfilDigitalService } from '@/infrastructure/api/services/perfilDigitalService';
import type {
  PlantillaPerfil,
  SeccionCampo,
  DefinicionCampo,
  TipoCampoDinamico,
  CrearSeccionPayload,
  CrearCampoPayload,
} from '@/shared/types/perfilDigital';
import { PageHeader } from '@/shared/ui/layouts/PageHeader/PageHeader';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/shared/ui/overlays/Modal/Modal';

const TIPOS_CAMPO: { value: TipoCampoDinamico; label: string; description: string }[] = [
  { value: 'texto', label: 'Texto corto', description: 'Cadena de texto simple (línea única)' },
  { value: 'area_texto', label: 'Área de texto', description: 'Párrafos o notas extensas' },
  { value: 'numero', label: 'Número entero', description: 'Cantidades enteras (ej. edad, recuento)' },
  { value: 'decimal', label: 'Decimal', description: 'Valores numéricos con decimales (ej. peso, talla)' },
  { value: 'fecha', label: 'Fecha', description: 'Selector de calendario (YYYY-MM-DD)' },
  { value: 'booleano', label: 'Booleano (Sí/No)', description: 'Interruptor binario o casilla de verificación' },
  { value: 'opcion_simple', label: 'Selección única', description: 'Menú desplegable con una opción elegida' },
  { value: 'opcion_multiple', label: 'Selección múltiple', description: 'Múltiples opciones seleccionables' },
];

export const ConfiguradorPerfilDigitalPage: React.FC = () => {
  const [rolActivo, setRolActivo] = useState<string>('RESIDENTE');
  const [plantilla, setPlantilla] = useState<PlantillaPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [isSeccionModalOpen, setIsSeccionModalOpen] = useState(false);
  const [isCampoModalOpen, setIsCampoModalOpen] = useState(false);
  const [selectedSeccionId, setSelectedSeccionId] = useState<string | null>(null);

  // New section form
  const [seccionForm, setSeccionForm] = useState<{
    titulo: string;
    clave: string;
    descripcion: string;
    icono: string;
    orden: number;
  }>({
    titulo: '',
    clave: '',
    descripcion: '',
    icono: 'Sliders',
    orden: 1,
  });

  // New field form
  const [campoForm, setCampoForm] = useState<{
    etiqueta: string;
    clave: string;
    descripcion: string;
    tipo: TipoCampoDinamico;
    opcionesTexto: string;
    obligatorio: boolean;
    visible: boolean;
    orden: number;
  }>({
    etiqueta: '',
    clave: '',
    descripcion: '',
    tipo: 'texto',
    opcionesTexto: '',
    obligatorio: false,
    visible: true,
    orden: 1,
  });

  const loadPlantilla = useCallback(async (rol: string) => {
    try {
      setLoading(true);
      setFeedback(null);
      const data = await perfilDigitalService.getPlantillaVigente(rol);
      setPlantilla(data);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || 'Error al cargar la plantilla del perfil digital',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlantilla(rolActivo);
  }, [rolActivo, loadPlantilla]);

  // Auto-slug generator for clave
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleCreateSeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantilla) return;
    try {
      setSubmitting(true);
      setFeedback(null);
      const payload: CrearSeccionPayload = {
        plantillaId: plantilla.id,
        clave: seccionForm.clave || slugify(seccionForm.titulo),
        titulo: seccionForm.titulo,
        descripcion: seccionForm.descripcion || undefined,
        icono: seccionForm.icono || undefined,
        orden: Number(seccionForm.orden) || 1,
      };

      await perfilDigitalService.createSeccion(payload);
      setFeedback({ type: 'success', text: 'Sección creada correctamente' });
      setIsSeccionModalOpen(false);
      setSeccionForm({ titulo: '', clave: '', descripcion: '', icono: 'Sliders', orden: 1 });
      await loadPlantilla(rolActivo);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || 'No se pudo crear la sección',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAddCampo = (seccionId: string) => {
    setSelectedSeccionId(seccionId);
    setCampoForm({
      etiqueta: '',
      clave: '',
      descripcion: '',
      tipo: 'texto',
      opcionesTexto: '',
      obligatorio: false,
      visible: true,
      orden: 1,
    });
    setIsCampoModalOpen(true);
  };

  const handleCreateCampo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeccionId) return;
    try {
      setSubmitting(true);
      setFeedback(null);

      let parsedOpciones: string[] | undefined = undefined;
      if (campoForm.tipo === 'opcion_simple' || campoForm.tipo === 'opcion_multiple') {
        parsedOpciones = campoForm.opcionesTexto
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const payload: CrearCampoPayload = {
        seccionId: selectedSeccionId,
        clave: campoForm.clave || slugify(campoForm.etiqueta),
        etiqueta: campoForm.etiqueta,
        descripcion: campoForm.descripcion || undefined,
        tipo: campoForm.tipo,
        opciones: parsedOpciones,
        obligatorio: campoForm.obligatorio,
        visible: campoForm.visible,
        orden: Number(campoForm.orden) || 1,
      };

      await perfilDigitalService.createCampo(payload);
      setFeedback({ type: 'success', text: 'Campo dinámico agregado exitosamente' });
      setIsCampoModalOpen(false);
      await loadPlantilla(rolActivo);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || 'No se pudo agregar el campo dinámico',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampo = async (campoId: string, etiqueta: string) => {
    if (!window.confirm(`¿Estás seguro de desactivar el campo "${etiqueta}"?`)) return;
    try {
      setSubmitting(true);
      await perfilDigitalService.deleteCampo(campoId);
      setFeedback({ type: 'success', text: `Campo "${etiqueta}" eliminado` });
      await loadPlantilla(rolActivo);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.response?.data?.message || 'Error al eliminar el campo',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>
      <PageHeader
        title="Perfil Digital Dinámico"
        subtitle="Configuración del motor de campos y secciones dinámicas de la entidad Persona."
        icon="bi-sliders"
      />

      {/* Role / Context Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {[
          { key: 'RESIDENTE', label: 'Residentes' },
          { key: 'PACIENTE_AMBULATORIO', label: 'Pacientes Ambulatorios' },
          { key: 'PERSONAL', label: 'Personal / Colaboradores' },
          { key: 'CONTACTO', label: 'Familiares y Contactos' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRolActivo(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: rolActivo === tab.key ? 700 : 500,
              background: rolActivo === tab.key ? '#eff6ff' : 'transparent',
              color: rolActivo === tab.key ? '#1d4ed8' : '#64748b',
              border: rolActivo === tab.key ? '1px solid #bfdbfe' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.5rem' }} />
          <p>Cargando esquema dinámico...</p>
        </div>
      ) : !plantilla ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center' }}>
          <Layers size={32} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
          <h4 style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>No existe plantilla configurada</h4>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Aún no se ha inicializado una plantilla para el rol {rolActivo}.</p>
        </div>
      ) : (
        <div>
          {/* Template Info Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                  {plantilla.nombre}
                </h3>
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                  }}
                >
                  v{plantilla.version}
                </span>
                <span
                  style={{
                    background: plantilla.esVigente ? '#dcfce7' : '#f1f5f9',
                    color: plantilla.esVigente ? '#15803d' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                  }}
                >
                  {plantilla.esVigente ? 'Vigente' : 'Inactiva'}
                </span>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                {plantilla.descripcion || 'Plantilla de campos y estructura para el rol seleccionado.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsSeccionModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FolderPlus size={16} />
              <span>Nueva Sección</span>
            </button>
          </div>

          {/* Sections list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {plantilla.secciones.length === 0 ? (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Esta plantilla no tiene secciones aún. Haz clic en "Nueva Sección" para comenzar.</p>
              </div>
            ) : (
              plantilla.secciones.map((sec) => (
                <div
                  key={sec.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                  }}
                >
                  {/* Section header */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '0.875rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e293b' }}>
                          {sec.titulo}
                        </span>
                        <code style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>
                          clave: {sec.clave}
                        </code>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          (Orden: {sec.orden})
                        </span>
                      </div>
                      {sec.descripcion && (
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                          {sec.descripcion}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddCampo(sec.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.375rem',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#0284c7',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                      <span>Agregar Campo</span>
                    </button>
                  </div>

                  {/* Fields list inside section */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    {sec.campos.length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Sin campos configurados en esta sección.
                      </p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
                              <th style={{ padding: '0.5rem', fontWeight: 600 }}>Etiqueta</th>
                              <th style={{ padding: '0.5rem', fontWeight: 600 }}>Clave JSONB</th>
                              <th style={{ padding: '0.5rem', fontWeight: 600 }}>Tipo</th>
                              <th style={{ padding: '0.5rem', fontWeight: 600 }}>Opciones / Detalle</th>
                              <th style={{ padding: '0.5rem', fontWeight: 600 }}>Requerido</th>
                              <th style={{ padding: '0.5rem', fontWeight: 600 }}>Visible</th>
                              <th style={{ padding: '0.5rem', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sec.campos.map((campo) => (
                              <tr key={campo.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '0.625rem 0.5rem', fontWeight: 600, color: '#1e293b' }}>
                                  {campo.etiqueta}
                                  {campo.descripcion && (
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>
                                      {campo.descripcion}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '0.625rem 0.5rem' }}>
                                  <code style={{ background: '#f8fafc', padding: '0.1rem 0.35rem', borderRadius: '0.25rem', color: '#0369a1' }}>
                                    {campo.clave}
                                  </code>
                                </td>
                                <td style={{ padding: '0.625rem 0.5rem' }}>
                                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                    {campo.tipo}
                                  </span>
                                </td>
                                <td style={{ padding: '0.625rem 0.5rem', color: '#64748b' }}>
                                  {campo.opciones && campo.opciones.length > 0 ? (
                                    <span title={campo.opciones.join(', ')}>
                                      {campo.opciones.length} opción(es)
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                                <td style={{ padding: '0.625rem 0.5rem' }}>
                                  <span style={{ color: campo.obligatorio ? '#b91c1c' : '#94a3b8', fontWeight: 600 }}>
                                    {campo.obligatorio ? 'Sí' : 'No'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.625rem 0.5rem' }}>
                                  {campo.visible ? (
                                    <span style={{ color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                      <Eye size={13} /> Visible
                                    </span>
                                  ) : (
                                    <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                      <EyeOff size={13} /> Oculto
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '0.625rem 0.5rem', textAlign: 'right' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCampo(campo.id, campo.etiqueta)}
                                    title="Desactivar campo"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      padding: '0.25rem',
                                    }}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Nueva Sección */}
      <Modal open={isSeccionModalOpen} onOpenChange={setIsSeccionModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Crear Nueva Sección</ModalTitle>
            <ModalDescription>
              Agrupa campos temáticos dentro de la plantilla del perfil digital.
            </ModalDescription>
          </ModalHeader>

          <form onSubmit={handleCreateSeccion}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Título de la sección *
                </label>
                <input
                  type="text"
                  required
                  value={seccionForm.titulo}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSeccionForm((prev) => ({
                      ...prev,
                      titulo: val,
                      clave: prev.clave ? prev.clave : slugify(val),
                    }));
                  }}
                  placeholder="ej. Evaluación Cognitiva y Emocional"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Clave identificadora (única) *
                </label>
                <input
                  type="text"
                  required
                  value={seccionForm.clave}
                  onChange={(e) => setSeccionForm((prev) => ({ ...prev, clave: slugify(e.target.value) }))}
                  placeholder="ej. eval_cognitiva"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={seccionForm.descripcion}
                  onChange={(e) => setSeccionForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Propósito u observaciones de esta sección"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Orden de aparición
                </label>
                <input
                  type="number"
                  min="1"
                  value={seccionForm.orden}
                  onChange={(e) => setSeccionForm((prev) => ({ ...prev, orden: parseInt(e.target.value, 10) || 1 }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsSeccionModalOpen(false)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {submitting ? 'Creando...' : 'Crear Sección'}
              </button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Modal: Nuevo Campo */}
      <Modal open={isCampoModalOpen} onOpenChange={setIsCampoModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Agregar Campo Dinámico</ModalTitle>
            <ModalDescription>
              Configura un nuevo campo sin alterar el código ni realizar migraciones SQL.
            </ModalDescription>
          </ModalHeader>

          <form onSubmit={handleCreateCampo}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Etiqueta del campo (pregunta o título) *
                </label>
                <input
                  type="text"
                  required
                  value={campoForm.etiqueta}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCampoForm((prev) => ({
                      ...prev,
                      etiqueta: val,
                      clave: prev.clave ? prev.clave : slugify(val),
                    }));
                  }}
                  placeholder="ej. ¿Requiere apoyo para alimentarse?"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Clave en JSONB *
                </label>
                <input
                  type="text"
                  required
                  value={campoForm.clave}
                  onChange={(e) => setCampoForm((prev) => ({ ...prev, clave: slugify(e.target.value) }))}
                  placeholder="ej. apoyo_alimentacion"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Tipo de dato *
                </label>
                <select
                  value={campoForm.tipo}
                  onChange={(e) => setCampoForm((prev) => ({ ...prev, tipo: e.target.value as TipoCampoDinamico }))}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                >
                  {TIPOS_CAMPO.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — ({t.description})
                    </option>
                  ))}
                </select>
              </div>

              {(campoForm.tipo === 'opcion_simple' || campoForm.tipo === 'opcion_multiple') && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Opciones (una por línea) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={campoForm.opcionesTexto}
                    onChange={(e) => setCampoForm((prev) => ({ ...prev, opcionesTexto: e.target.value }))}
                    placeholder="Totalmente independiente&#10;Requiere asistencia parcial&#10;Dependiente total"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem', fontFamily: 'sans-serif' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Texto de ayuda o descripción (opcional)
                </label>
                <input
                  type="text"
                  value={campoForm.descripcion}
                  onChange={(e) => setCampoForm((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Información adicional para quien llena el formulario"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={campoForm.obligatorio}
                    onChange={(e) => setCampoForm((prev) => ({ ...prev, obligatorio: e.target.checked }))}
                  />
                  <span>Campo obligatorio</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={campoForm.visible}
                    onChange={(e) => setCampoForm((prev) => ({ ...prev, visible: e.target.checked }))}
                  />
                  <span>Visible en formulario</span>
                </label>
              </div>
            </div>

            <ModalFooter>
              <button
                type="button"
                onClick={() => setIsCampoModalOpen(false)}
                style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {submitting ? 'Guardando...' : 'Agregar Campo'}
              </button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ConfiguradorPerfilDigitalPage;
