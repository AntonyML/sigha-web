import React, { useState } from 'react';
import {
  Send,
  AtSign,
  Hash,
  Globe,
  Lock,
  ShieldAlert,
  Paperclip,
  X,
  AlertCircle,
} from 'lucide-react';
import type {
  CreateMemoPayload,
  MemoVisibility,
  MemoUrgency,
  MemoCategory,
  MemoAttachment,
} from '@/shared/types/memos';

interface MemoComposerProps {
  olderAdultId: number;
  availableUsers: Array<{ id: number; name: string; roleName: string }>;
  availableRoles: Array<{ id: number; name: string }>;
  onMemoCreated: (payload: CreateMemoPayload) => Promise<void>;
  placeholder?: string;
  parentMemoId?: number | null;
  onCancel?: () => void;
}

export const MemoComposer: React.FC<MemoComposerProps> = ({
  olderAdultId,
  availableUsers,
  availableRoles,
  onMemoCreated,
  placeholder = '¿Qué necesita registrar o derivar sobre el residente?',
  parentMemoId = null,
  onCancel,
}) => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<MemoVisibility>('public');
  const [urgency, setUrgency] = useState<MemoUrgency>('routine');
  const [category] = useState<MemoCategory>(parentMemoId ? 'follow_up' : 'referral');
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [targetRoleId, setTargetRoleId] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<MemoAttachment[]>([]);
  const [attachmentUrlInput, setAttachmentUrlInput] = useState('');
  const [showAttachmentPrompt, setShowAttachmentPrompt] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedUser = availableUsers.find((u) => u.id === targetUserId);
  const selectedRole = availableRoles.find((r) => r.id === targetRoleId);

  const handleAddAttachment = () => {
    if (!attachmentUrlInput.trim()) return;
    const url = attachmentUrlInput.trim();
    const name = url.split('/').pop()?.split('?')[0] || 'Adjunto';
    setAttachments([...attachments, { url, name }]);
    setAttachmentUrlInput('');
    setShowAttachmentPrompt(false);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onMemoCreated({
        olderAdultId,
        content: content.trim(),
        visibility,
        urgency,
        category,
        targetUserId,
        targetRoleId,
        parentMemoId,
        attachments,
      });
      setContent('');
      setTargetUserId(null);
      setTargetRoleId(null);
      setAttachments([]);
      setUrgency('routine');
      setVisibility('public');
    } catch {
      setErrorMsg('No se pudo guardar la nota. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVisibility = () => {
    if (visibility === 'public') setVisibility('clinical');
    else if (visibility === 'clinical') setVisibility('confidential');
    else setVisibility('public');
  };

  const visibilityConfig: Record<
    MemoVisibility,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    public: { label: 'Visible por todo el personal', icon: <Globe size={14} />, color: '#16a34a' },
    clinical: { label: 'Solo áreas de salud / clínicas', icon: <ShieldAlert size={14} />, color: '#0284c7' },
    confidential: { label: 'Confidencial (Autor y Dirección)', icon: <Lock size={14} />, color: '#dc2626' },
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.875rem',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={parentMemoId ? 2 : 3}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '0.9375rem',
            lineHeight: 1.5,
            color: '#1e293b',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />

        {/* Selected target chips */}
        {(selectedUser || selectedRole || attachments.length > 0) && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              alignItems: 'center',
              paddingTop: '0.5rem',
              marginBottom: '0.5rem',
              borderTop: '1px dashed #f1f5f9',
            }}
          >
            {selectedUser && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid #bfdbfe',
                }}
              >
                <AtSign size={12} />
                {selectedUser.name} ({selectedUser.roleName})
                <button
                  type="button"
                  onClick={() => setTargetUserId(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedRole && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#f5f3ff',
                  color: '#6d28d9',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid #ddd6fe',
                }}
              >
                <Hash size={12} />
                Área: {selectedRole.name}
                <button
                  type="button"
                  onClick={() => setTargetRoleId(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6d28d9',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {attachments.map((att, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#f8fafc',
                  color: '#475569',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Paperclip size={12} />
                {att.name}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Attachment URL popover input */}
        {showAttachmentPrompt && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              padding: '0.5rem',
              background: '#f8fafc',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <input
              type="text"
              placeholder="Pegue la URL del documento o perfil..."
              value={attachmentUrlInput}
              onChange={(e) => setAttachmentUrlInput(e.target.value)}
              style={{
                flex: 1,
                fontSize: '0.8125rem',
                padding: '0.35rem 0.6rem',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              style={{
                padding: '0.35rem 0.75rem',
                background: '#0b3d91',
                color: '#fff',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => setShowAttachmentPrompt(false)}
              style={{
                padding: '0.35rem 0.5rem',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Action Toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f1f5f9',
            gap: '0.5rem',
          }}
        >
          {/* Selectors and tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            {/* Visibility toggle button */}
            <button
              type="button"
              onClick={toggleVisibility}
              title={`Clic para cambiar visibilidad: ${visibilityConfig[visibility].label}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: visibilityConfig[visibility].color,
                cursor: 'pointer',
              }}
            >
              {visibilityConfig[visibility].icon}
              <span>{visibilityConfig[visibility].label.split(' ')[0]}</span>
            </button>

            {/* Target User button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowRoleDropdown(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  background: targetUserId ? '#eff6ff' : '#f8fafc',
                  color: targetUserId ? '#1d4ed8' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <AtSign size={13} />
                <span>Profesional</span>
              </button>

              {showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    zIndex: 20,
                    width: '240px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    Asignar a profesional:
                  </div>
                  {availableUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setTargetUserId(u.id);
                        setShowUserDropdown(false);
                      }}
                      style={{
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.8125rem',
                        color: '#1e293b',
                        cursor: 'pointer',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.roleName}</span>
                    </div>
                  ))}
                  {availableUsers.length === 0 && (
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                      Sin usuarios disponibles
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Target Role/Department button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowUserDropdown(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  background: targetRoleId ? '#f5f3ff' : '#f8fafc',
                  color: targetRoleId ? '#6d28d9' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Hash size={13} />
                <span>Área</span>
              </button>

              {showRoleDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    zIndex: 20,
                    width: '200px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '0.25rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    Derivar a departamento:
                  </div>
                  {availableRoles.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setTargetRoleId(r.id);
                        setShowRoleDropdown(false);
                      }}
                      style={{
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        borderRadius: '0.375rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {r.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgency selector */}
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as MemoUrgency)}
              style={{
                padding: '0.3rem 0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: urgency === 'urgent' ? '#dc2626' : urgency === 'priority' ? '#d97706' : '#64748b',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="routine">Prioridad: Rutina</option>
              <option value="priority">Prioridad: Prioritaria</option>
              <option value="urgent">Prioridad: Urgente</option>
            </select>

            {/* Attachments trigger */}
            <button
              type="button"
              onClick={() => setShowAttachmentPrompt(!showAttachmentPrompt)}
              title="Adjuntar enlace o documento"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.3rem 0.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <Paperclip size={14} />
            </button>
          </div>

          {/* Submit and cancel buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  background: 'transparent',
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.9rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: content.trim() ? '#0b3d91' : '#cbd5e1',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: content.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s',
              }}
            >
              <Send size={13} />
              <span>{isSubmitting ? 'Enviando…' : parentMemoId ? 'Responder' : 'Publicar Memo'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#dc2626',
              fontSize: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <AlertCircle size={13} />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>
    </div>
  );
};
