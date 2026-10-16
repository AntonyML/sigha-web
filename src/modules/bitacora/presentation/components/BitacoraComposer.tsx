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

interface BitacoraComposerProps {
  olderAdultId: number;
  availableUsers: Array<{ id: number; name: string; roleName: string }>;
  availableRoles: Array<{ id: number; name: string }>;
  onMemoCreated: (payload: CreateMemoPayload) => Promise<void>;
  placeholder?: string;
  parentMemoId?: number | null;
  onCancel?: () => void;
}

export const BitacoraComposer: React.FC<BitacoraComposerProps> = ({
  olderAdultId,
  availableUsers,
  availableRoles,
  onMemoCreated,
  placeholder = '¿Qué necesita registrar en la bitácora o derivar sobre el residente?',
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
      setErrorMsg('No se pudo guardar la nota en bitácora. Intente nuevamente.');
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
                    padding: 0,
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
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
                {selectedRole.name}
                <button
                  type="button"
                  onClick={() => setTargetRoleId(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
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
                  fontWeight: 500,
                  border: '1px solid #cbd5e1',
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
                    padding: 0,
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Attachment URL prompt modal-like inline */}
        {showAttachmentPrompt && (
          <div
            style={{
              padding: '0.6rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <input
              type="url"
              placeholder="Enlace del archivo adjunto (https://...)"
              value={attachmentUrlInput}
              onChange={(e) => setAttachmentUrlInput(e.target.value)}
              style={{
                flex: 1,
                fontSize: '0.8125rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleAddAttachment}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                borderRadius: '0.375rem',
                background: '#0b3d91',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => setShowAttachmentPrompt(false)}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.5rem',
                borderRadius: '0.375rem',
                background: 'transparent',
                color: '#64748b',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Action bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Controls on left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
            {/* Tag User trigger */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowRoleDropdown(false);
                }}
                title="Dirigir a un usuario específico"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #e2e8f0',
                  background: selectedUser ? '#eff6ff' : '#f8fafc',
                  color: selectedUser ? '#1d4ed8' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <AtSign size={13} />
                <span>{selectedUser ? selectedUser.name.split(' ')[0] : 'Persona'}</span>
              </button>

              {showUserDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.35rem',
                    width: '230px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    padding: '0.25rem',
                  }}
                >
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Destinatario
                  </div>
                  {availableUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setTargetUserId(u.id);
                        setShowUserDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.75rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '0.25rem',
                        color: '#1e293b',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.roleName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tag Role trigger */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowUserDropdown(false);
                }}
                title="Derivar a un rol o departamento"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #e2e8f0',
                  background: selectedRole ? '#f5f3ff' : '#f8fafc',
                  color: selectedRole ? '#6d28d9' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Hash size={13} />
                <span>{selectedRole ? selectedRole.name : 'Departamento'}</span>
              </button>

              {showRoleDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.35rem',
                    width: '200px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    zIndex: 50,
                    padding: '0.25rem',
                  }}
                >
                  <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    Área o Rol
                  </div>
                  {availableRoles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setTargetRoleId(r.id);
                        setShowRoleDropdown(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.75rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '0.25rem',
                        color: '#1e293b',
                        fontWeight: 600,
                      }}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Urgency select */}
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as MemoUrgency)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.35rem 0.5rem',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                background: urgency === 'urgent' ? '#fee2e2' : urgency === 'priority' ? '#fef3c7' : '#f8fafc',
                color: urgency === 'urgent' ? '#991b1b' : urgency === 'priority' ? '#92400e' : '#475569',
                cursor: 'pointer',
              }}
            >
              <option value="routine">Rutina</option>
              <option value="priority">Prioritaria</option>
              <option value="urgent">Urgente</option>
            </select>

            {/* Visibility Toggle Button */}
            <button
              type="button"
              onClick={toggleVisibility}
              title={`Clic para cambiar visibilidad: ${visibilityConfig[visibility].label}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.35rem 0.55rem',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: visibilityConfig[visibility].color,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {visibilityConfig[visibility].icon}
              <span style={{ maxWidth: '85px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {visibility === 'public' ? 'Pública' : visibility === 'clinical' ? 'Clínica' : 'Privada'}
              </span>
            </button>

            {/* Attachment trigger */}
            <button
              type="button"
              onClick={() => setShowAttachmentPrompt(!showAttachmentPrompt)}
              title="Adjuntar URL de documento"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.35rem 0.55rem',
                borderRadius: '0.375rem',
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
              <span>{isSubmitting ? 'Enviando…' : parentMemoId ? 'Responder' : 'Publicar en Bitácora'}</span>
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
