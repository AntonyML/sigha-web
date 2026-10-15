import { describe, it, expect, vi, beforeEach } from 'vitest';
import { memosService } from './memosService';
import type { ResidentMemo, CreateMemoPayload } from '@/shared/types/memos';

describe('memosService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exposes the expected API methods', () => {
    expect(typeof memosService.getByOlderAdult).toBe('function');
    expect(typeof memosService.createMemo).toBe('function');
    expect(typeof memosService.updateStatus).toBe('function');
    expect(typeof memosService.replyMemo).toBe('function');
    expect(typeof memosService.getAvailableRecipients).toBe('function');
  });

  it('correctly structures a memo payload with referral targets and attachments', async () => {
    const payload: CreateMemoPayload = {
      olderAdultId: 10,
      content: 'Derivación urgente a Trabajo Social para revisión de caso.',
      category: 'referral',
      visibility: 'clinical',
      urgency: 'urgent',
      targetRoleId: 5,
      attachments: [{ url: 'https://example.com/doc.pdf', name: 'doc.pdf' }],
    };

    const mockResponse: ResidentMemo = {
      id: 1,
      olderAdultId: payload.olderAdultId,
      authorId: 2,
      authorName: 'Dr. Roberto',
      authorRole: 'Psicología',
      targetRoleId: 5,
      targetRoleName: 'Trabajo Social',
      content: payload.content,
      category: payload.category!,
      visibility: payload.visibility!,
      urgency: payload.urgency!,
      status: 'open',
      attachments: payload.attachments!,
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const spy = vi.spyOn(memosService, 'createMemo').mockResolvedValueOnce(mockResponse);

    const result = await memosService.createMemo(payload);
    expect(spy).toHaveBeenCalledWith(payload);
    expect(result.id).toBe(1);
    expect(result.targetRoleName).toBe('Trabajo Social');
    expect(result.urgency).toBe('urgent');
  });

  it('handles replyMemo by forwarding parentMemoId', async () => {
    const replyPayload: CreateMemoPayload = {
      olderAdultId: 10,
      content: 'Respuesta: Caso recibido y agendado.',
      parentMemoId: 1,
    };

    const mockReply: ResidentMemo = {
      id: 2,
      olderAdultId: 10,
      authorId: 3,
      authorName: 'Lic. Ana',
      authorRole: 'Trabajo Social',
      parentMemoId: 1,
      content: replyPayload.content,
      category: 'follow_up',
      visibility: 'clinical',
      urgency: 'routine',
      status: 'in_progress',
      attachments: [],
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const spy = vi.spyOn(memosService, 'replyMemo').mockResolvedValueOnce(mockReply);

    const result = await memosService.replyMemo(1, replyPayload);
    expect(spy).toHaveBeenCalledWith(1, replyPayload);
    expect(result.parentMemoId).toBe(1);
  });
});
