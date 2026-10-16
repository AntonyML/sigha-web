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
import { MemoCard } from './MemoCard';

interface MemoFeedProps {
  memos: ResidentMemo[];
  olderAdultId: number;
  availableUsers: Array<{ id: number; name: string; roleName: string }>;
  availableRoles: Array<{ id: number; name: string }>;
  onStatusChange: (memoId: number, status: MemoStatus) => Promise<void>;
  onReply: (parentMemoId: number, payload: CreateMemoPayload) => Promise<void>;
  onAcknowledge?: (memoId: number) => Promise<void>;
  isLoading?: boolean;
}

export const MemoFeed: React.FC<MemoFeedProps> = ({
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
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '0.5rem',
            padding: '0.35rem 0.65rem',
            flex: '1 1 240px',
            maxWidth: '340px',
          }}
        >
          <Search size={14} style={{ color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Buscar en la bitácora o derivaciones…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.8125rem',
              width: '100%',
              background: 'transparent',
              color: '#1e293b',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            <Filter size={13} />
            Filtros:
          </span>

          {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: statusFilter === st ? '#0b3d91' : '#e2e8f0',
                background: statusFilter === st ? '#0b3d91' : '#ffffff',
                color: statusFilter === st ? '#ffffff' : '#64748b',
                cursor: 'pointer',
              }}
            >
              {st === 'all' ? 'Todos' : st === 'open' ? 'Abiertos' : st === 'in_progress' ? 'En Proceso' : 'Resueltos'}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setOnlyUrgent(!onlyUrgent)}
            style={{
              padding: '0.25rem 0.6rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: onlyUrgent ? '#dc2626' : '#e2e8f0',
              background: onlyUrgent ? '#fee2e2' : '#ffffff',
              color: onlyUrgent ? '#b91c1c' : '#64748b',
              cursor: 'pointer',
            }}
          >
            Solo Urgentes / Prioritarios
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.875rem' }}>
          Cargando notas de la bitácora…
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredMemos.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: '#ffffff',
            borderRadius: '0.875rem',
            border: '1px dashed #cbd5e1',
            color: '#64748b',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '999px',
              background: '#f1f5f9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              color: '#94a3b8',
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
              : 'Utilice el compositor superior para publicar la primera nota o derivación interdepartamental.'}
          </p>
        </div>
      )}

      {/* Feed List */}
      {!isLoading &&
        filteredMemos.map((memo) => (
          <MemoCard
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
