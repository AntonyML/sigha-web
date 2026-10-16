import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquareText, RefreshCw, AlertCircle } from 'lucide-react';
import type { ResidentMemo, CreateMemoPayload, MemoStatus } from '@/shared/types/memos';
import { memosService } from '@/infrastructure/api/services/memosService';
import { bitacoraService } from '@/infrastructure/api/services/bitacoraService';
import { MemoComposer } from './MemoComposer';
import { MemoFeed } from './MemoFeed';

interface TabResidentMemosProps {
  olderAdultId: number;
  residentName?: string;
}

export const TabResidentMemos: React.FC<TabResidentMemosProps> = ({
  olderAdultId,
  residentName,
}) => {
  const [memos, setMemos] = useState<ResidentMemo[]>([]);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: number; name: string; roleName: string }>>([]);
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [memosData, recipients] = await Promise.all([
        memosService.getByOlderAdult(olderAdultId),
        memosService.getAvailableRecipients(),
      ]);
      setMemos(memosData);
      setAvailableUsers(recipients.users);
      setAvailableRoles(recipients.roles);
    } catch {
      setError('Ocurrió un error al cargar la bitácora del residente.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [olderAdultId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        void loadData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadData();
  };

  const handleCreateMemo = async (payload: CreateMemoPayload) => {
    const created = await memosService.createMemo(payload);
    // Optimistically update
    setMemos((prev) => [created, ...prev]);
  };

  const handleReplyMemo = async (parentMemoId: number, payload: CreateMemoPayload) => {
    const reply = await memosService.replyMemo(parentMemoId, payload);
    setMemos((prev) => [...prev, reply]);
  };

  const handleStatusChange = async (memoId: number, status: MemoStatus) => {
    const updated = await memosService.updateStatus(memoId, status);
    setMemos((prev) => prev.map((m) => (m.id === memoId ? updated : m)));
  };

  const handleAcknowledge = async (memoId: number) => {
    await bitacoraService.acknowledge(memoId);
    setMemos((prev) =>
      prev.map((m) =>
        m.id === memoId ? { ...m, acknowledgedByMe: true, acusesCount: (m.acusesCount || 0) + 1 } : m
      )
    );
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              padding: '0.4rem',
              background: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '0.5rem',
              display: 'flex',
            }}
          >
            <MessageSquareText size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Bitácora Operativa y Derivaciones
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              {residentName ? `Expediente de ${residentName}` : 'Seguimiento clínico y operativo'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '0.5rem',
            padding: '0.35rem 0.75rem',
            fontSize: '0.8125rem',
            color: '#475569',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#b91c1c',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Composer at the top (Memos pattern) */}
      <MemoComposer
        olderAdultId={olderAdultId}
        availableUsers={availableUsers}
        availableRoles={availableRoles}
        onMemoCreated={handleCreateMemo}
      />

      {/* Feed below */}
      <MemoFeed
        memos={memos}
        olderAdultId={olderAdultId}
        availableUsers={availableUsers}
        availableRoles={availableRoles}
        onStatusChange={handleStatusChange}
        onReply={handleReplyMemo}
        onAcknowledge={handleAcknowledge}
        isLoading={loading}
      />
    </div>
  );
};
