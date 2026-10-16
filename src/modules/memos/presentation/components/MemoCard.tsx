import React, { useState } from 'react';
import {
  Globe,
  Lock,
  ShieldAlert,
  Paperclip,
  CornerDownRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  AtSign,
  Hash,
} from 'lucide-react';
import type {
  ResidentMemo,
  MemoStatus,
  CreateMemoPayload,
} from '@/shared/types/memos';
import { MemoComposer } from './MemoComposer';

interface MemoCardProps {
  memo: ResidentMemo;
  olderAdultId: number;
  availableUsers: Array<{ id: number; name: string; roleName: string }>;
  availableRoles: Array<{ id: number; name: string }>;
  onStatusChange: (memoId: number, status: MemoStatus) => Promise<void>;
  onReply: (parentMemoId: number, payload: CreateMemoPayload) => Promise<void>;
  onAcknowledge?: (memoId: number) => Promise<void>;
}

export const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  olderAdultId,
  availableUsers,
  availableRoles,
  onStatusChange,
  onReply,
  onAcknowledge,
}) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(Boolean(memo.acknowledgedByMe));
  const [isSubmittingAcuse, setIsSubmittingAcuse] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const fmtDate = (d?: string) => {
    if (!d) return '';
    const date = new Date(d);
    return isNaN(date.getTime())
      ? d
      : date.toLocaleString('es-CR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const urgencyStyles: Record<string, { bg: string; color: string; label: string }> = {
    routine: { bg: '#f1f5f9', color: '#475569', label: 'Rutina' },
    priority: { bg: '#fef3c7', color: '#b45309', label: 'Prioritaria' },
    urgent: { bg: '#fee2e2', color: '#b91c1c', label: 'Urgente' },
  };

  const statusStyles: Record<MemoStatus, { bg: string; color: string; label: string }> = {
    open: { bg: '#eff6ff', color: '#1d4ed8', label: 'Abierto' },
    in_progress: { bg: '#fef9c3', color: '#854d0e', label: 'En Proceso' },
    resolved: { bg: '#dcfce7', color: '#15803d', label: 'Resuelto' },
    archived: { bg: '#f1f5f9', color: '#64748b', label: 'Archivado' },
  };

  const handleStatusToggle = async () => {
    const nextStatus: MemoStatus =
      memo.status === 'open' ? 'in_progress' : memo.status === 'in_progress' ? 'resolved' : 'open';
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(memo.id, nextStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const urgencyInfo = urgencyStyles[memo.urgency] ?? urgencyStyles.routine;
  const statusInfo = statusStyles[memo.status] ?? statusStyles.open;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.875rem',
        padding: '1.25rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header: Author & Metadata */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '999px',
              background: '#0b3d91',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
            }}
          >
            {getInitials(memo.authorName)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
                {memo.authorName || `Usuario #${memo.authorId}`}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  background: '#f1f5f9',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '0.25rem',
                }}
              >
                {memo.authorRole || 'Personal'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
              {fmtDate(memo.createdAt)}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Target user / role */}
          {memo.targetUserName && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1d4ed8',
                background: '#eff6ff',
                padding: '0.2rem 0.5rem',
                borderRadius: '999px',
                border: '1px solid #bfdbfe',
              }}
            >
              <AtSign size={11} /> {memo.targetUserName}
            </span>
          )}

          {memo.targetRoleName && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#6d28d9',
                background: '#f5f3ff',
                padding: '0.2rem 0.5rem',
                borderRadius: '999px',
                border: '1px solid #ddd6fe',
              }}
            >
              <Hash size={11} /> {memo.targetRoleName}
            </span>
          )}

          {/* Visibility badge */}
          <span
            title={memo.visibility}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: memo.visibility === 'public' ? '#f0fdf4' : memo.visibility === 'clinical' ? '#e0f2fe' : '#fef2f2',
              color: memo.visibility === 'public' ? '#166534' : memo.visibility === 'clinical' ? '#0369a1' : '#991b1b',
            }}
          >
            {memo.visibility === 'public' ? <Globe size={12} /> : memo.visibility === 'clinical' ? <ShieldAlert size={12} /> : <Lock size={12} />}
          </span>

          {/* Urgency badge */}
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: urgencyInfo.bg,
              color: urgencyInfo.color,
            }}
          >
            {urgencyInfo.label}
          </span>

          {/* Status badge */}
          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={isUpdatingStatus}
            title="Clic para avanzar estado"
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: statusInfo.bg,
              color: statusInfo.color,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {memo.status === 'resolved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
            {statusInfo.label}
          </button>
        </div>
      </div>

      {/* Body content */}
      <div
        style={{
          fontSize: '0.90625rem',
          lineHeight: 1.6,
          color: '#334155',
          whiteSpace: 'pre-wrap',
          marginBottom: memo.attachments.length > 0 ? '0.75rem' : '0.5rem',
        }}
      >
        {memo.content}
      </div>

      {/* Attachments */}
      {memo.attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {memo.attachments.map((att, idx) => (
            <a
              key={idx}
              href={att.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: '#0b3d91',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <Paperclip size={12} />
              <span>{att.name}</span>
              <ExternalLink size={10} style={{ opacity: 0.6 }} />
            </a>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #f8fafc',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setShowReplyComposer(!showReplyComposer)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <CornerDownRight size={14} />
          <span>Responder en este hilo</span>
        </button>

        {onAcknowledge && (
          <button
            type="button"
            disabled={isAcknowledged || isSubmittingAcuse}
            onClick={async () => {
              try {
                setIsSubmittingAcuse(true);
                await onAcknowledge(memo.id);
                setIsAcknowledged(true);
              } finally {
                setIsSubmittingAcuse(false);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: isAcknowledged ? '#f0fdf4' : '#eff6ff',
              border: `1px solid ${isAcknowledged ? '#86efac' : '#bfdbfe'}`,
              borderRadius: '0.375rem',
              padding: '0.25rem 0.65rem',
              color: isAcknowledged ? '#166534' : '#1d4ed8',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: isAcknowledged ? 'default' : 'pointer',
            }}
          >
            <CheckCircle2 size={13} />
            <span>
              {isSubmittingAcuse
                ? 'Registrando...'
                : isAcknowledged
                ? 'Acuse registrado'
                : 'Confirmar lectura'}
            </span>
          </button>
        )}
      </div>

      {/* Inline Reply Composer */}
      {showReplyComposer && (
        <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}>
          <MemoComposer
            olderAdultId={olderAdultId}
            parentMemoId={memo.id}
            availableUsers={availableUsers}
            availableRoles={availableRoles}
            placeholder={`Respuesta a ${memo.authorName ?? 'la nota'}…`}
            onMemoCreated={async (payload) => {
              await onReply(memo.id, payload);
              setShowReplyComposer(false);
            }}
            onCancel={() => setShowReplyComposer(false)}
          />
        </div>
      )}

      {/* Nested Replies */}
      {memo.replies && memo.replies.length > 0 && (
        <div style={{ marginTop: '1rem', paddingLeft: '1.25rem', borderLeft: '2px solid #e2e8f0' }}>
          {memo.replies.map((reply) => (
            <MemoCard
              key={reply.id}
              memo={reply}
              olderAdultId={olderAdultId}
              availableUsers={availableUsers}
              availableRoles={availableRoles}
              onStatusChange={onStatusChange}
              onReply={onReply}
              onAcknowledge={onAcknowledge}
            />
          ))}
        </div>
      )}
    </div>
  );
};
