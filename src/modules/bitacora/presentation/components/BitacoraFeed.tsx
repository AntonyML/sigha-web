import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageSquareText,
  Filter,
} from 'lucide-react';
import type {
  ResidentMemo,
  MemoStatus,
  CreateMemoPayload,
} from '@/shared/types/memos';
import { BitacoraCard } from './BitacoraCard';

interface BitacoraFeedProps {
  memos: ResidentMemo[];
  olderAdultId: number;
  availableUsers: Array<{ id: number; name: string; roleName: string }>;
  availableRoles: Array<{ id: number; name: string }>;
  onStatusChange: (memoId: number, status: MemoStatus) => Promise<void>;
  onReply: (parentMemoId: number, payload: CreateMemoPayload) => Promise<void>;
  onAcknowledge?: (memoId: number) => Promise<void>;
  isLoading?: boolean;
}

export const BitacoraFeed: React.FC<BitacoraFeedProps> = ({
  memos,
  olderAdultId,
  availableUsers,
  availableRoles,
  onStatusChange,
  onReply,
  onAcknowledge,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemoStatus>('all');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  // Group memos into root memos and nested replies
  const { rootMemos } = useMemo(() => {
    const memoMap = new Map<number, ResidentMemo>();
    const roots: ResidentMemo[] = [];

    // Clone to build replies tree
    memos.forEach((m) => {
      memoMap.set(m.id, { ...m, replies: [] });
    });

    memoMap.forEach((m) => {
      if (m.parentMemoId && memoMap.has(m.parentMemoId)) {
        memoMap.get(m.parentMemoId)!.replies!.push(m);
      } else {
        roots.push(m);
      }
    });

    return { rootMemos: roots };
  }, [memos]);

  // Filter root memos
  const filteredMemos = useMemo(() => {
    return rootMemos.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (onlyUrgent && m.urgency !== 'urgent' && m.urgency !== 'priority') return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesContent = m.content.toLowerCase().includes(term);
        const matchesAuthor = (m.authorName || '').toLowerCase().includes(term);
        const matchesTarget = (m.targetUserName || m.targetRoleName || '').toLowerCase().includes(term);
        if (!matchesContent && !matchesAuthor && !matchesTarget) return false;
      }
      return true;
    });
  }, [rootMemos, statusFilter, onlyUrgent, searchTerm]);

  return (
    <div>
      {/* Search and Filters Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          background: '#f8fafc',
          padding: '0.75rem',
          borderRadius: '0.625rem',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.65rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Buscar en bitácora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.35rem 0.6rem 0.35rem 2rem',
              fontSize: '0.8125rem',
              borderRadius: '0.375rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
            <Filter size={12} />
            <span>Estado:</span>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              background: statusFilter === 'all' ? '#0b3d91' : '#e2e8f0',
              color: statusFilter === 'all' ? '#ffffff' : '#475569',
              cursor: 'pointer',
            }}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('open')}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              background: statusFilter === 'open' ? '#1d4ed8' : '#e2e8f0',
              color: statusFilter === 'open' ? '#ffffff' : '#475569',
              cursor: 'pointer',
            }}
          >
            Abiertos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              background: statusFilter === 'in_progress' ? '#b45309' : '#e2e8f0',
              color: statusFilter === 'in_progress' ? '#ffffff' : '#475569',
              cursor: 'pointer',
            }}
          >
            En Proceso
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('resolved')}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: 'none',
              background: statusFilter === 'resolved' ? '#15803d' : '#e2e8f0',
              color: statusFilter === 'resolved' ? '#ffffff' : '#475569',
              cursor: 'pointer',
            }}
          >
            Resueltos
          </button>

          {/* Urgent filter toggle */}
          <button
            type="button"
            onClick={() => setOnlyUrgent(!onlyUrgent)}
            style={{
              marginLeft: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: onlyUrgent ? '1px solid #dc2626' : '1px solid #cbd5e1',
              background: onlyUrgent ? '#fee2e2' : '#ffffff',
              color: onlyUrgent ? '#991b1b' : '#64748b',
              cursor: 'pointer',
            }}
          >
            Solo Urgentes
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.875rem' }}>
          Cargando notas de la bitácora...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMemos.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: '#ffffff',
            borderRadius: '0.875rem',
            border: '1px dashed #cbd5e1',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '999px',
              background: '#f1f5f9',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            <MessageSquareText size={24} />
          </div>
          <h4 style={{ margin: '0 0 0.35rem', fontSize: '0.9375rem', fontWeight: 700, color: '#334155' }}>
            {searchTerm || statusFilter !== 'all' || onlyUrgent
              ? 'No hay notas con los filtros seleccionados'
              : 'Sin notas ni derivaciones registradas'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94a3b8' }}>
            {searchTerm || statusFilter !== 'all' || onlyUrgent
              ? 'Intente cambiando los términos de búsqueda o los filtros activos.'
              : 'Utilice el compositor superior para publicar la primera nota o derivación en la bitácora.'}
          </p>
        </div>
      )}

      {/* Feed List */}
      {!isLoading &&
        filteredMemos.map((memo) => (
          <BitacoraCard
            key={memo.id}
            memo={memo}
            olderAdultId={olderAdultId}
            availableUsers={availableUsers}
            availableRoles={availableRoles}
            onStatusChange={onStatusChange}
            onReply={onReply}
            onAcknowledge={onAcknowledge}
          />
        ))}
    </div>
  );
};
