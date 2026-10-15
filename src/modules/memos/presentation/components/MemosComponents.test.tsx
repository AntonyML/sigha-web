import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoComposer } from './MemoComposer';
import { MemoCard } from './MemoCard';
import { MemoFeed } from './MemoFeed';
import type { ResidentMemo } from '@/shared/types/memos';

describe('Memos Components', () => {
  const mockUsers = [
    { id: 1, name: 'Dr. Roberto Gomez', roleName: 'Psicólogo' },
    { id: 2, name: 'Lic. Ana Solis', roleName: 'Trabajadora Social' },
  ];

  const mockRoles = [
    { id: 10, name: 'Trabajo Social' },
    { id: 11, name: 'Enfermería' },
  ];

  const sampleMemo: ResidentMemo = {
    id: 101,
    olderAdultId: 5,
    authorId: 1,
    authorName: 'Dr. Roberto Gomez',
    authorRole: 'Psicólogo',
    targetUserId: 2,
    targetUserName: 'Lic. Ana Solis',
    content: 'Se requiere visita domiciliar/familiar para el residente.',
    category: 'referral',
    visibility: 'clinical',
    status: 'open',
    urgency: 'priority',
    attachments: [{ url: 'https://example.com/eval.pdf', name: 'eval.pdf' }],
    isEdited: false,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  };

  it('renders MemoComposer and submits content', async () => {
    const onCreated = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoComposer
        olderAdultId={5}
        availableUsers={mockUsers}
        availableRoles={mockRoles}
        onMemoCreated={onCreated}
      />
    );

    const textarea = screen.getByPlaceholderText('¿Qué necesita registrar o derivar sobre el residente?');
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: 'Nueva observación conductual' } });
    const submitBtn = screen.getByRole('button', { name: /Publicar Memo/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          olderAdultId: 5,
          content: 'Nueva observación conductual',
        })
      );
    });
  });

  it('renders MemoCard with author, content, tags and attachments', () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onReply = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoCard
        memo={sampleMemo}
        olderAdultId={5}
        availableUsers={mockUsers}
        availableRoles={mockRoles}
        onStatusChange={onStatusChange}
        onReply={onReply}
      />
    );

    expect(screen.getByText('Dr. Roberto Gomez')).toBeDefined();
    expect(screen.getByText('Se requiere visita domiciliar/familiar para el residente.')).toBeDefined();
    expect(screen.getByText('Lic. Ana Solis')).toBeDefined();
    expect(screen.getByText('eval.pdf')).toBeDefined();
    expect(screen.getByText('Prioritaria')).toBeDefined();
  });

  it('MemoCard toggles status when clicking the status button', async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onReply = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoCard
        memo={sampleMemo}
        olderAdultId={5}
        availableUsers={mockUsers}
        availableRoles={mockRoles}
        onStatusChange={onStatusChange}
        onReply={onReply}
      />
    );

    const statusBtn = screen.getByTitle('Clic para avanzar estado');
    fireEvent.click(statusBtn);

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith(101, 'in_progress');
    });
  });

  it('MemoFeed filters memos by search and status', () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onReply = vi.fn().mockResolvedValue(undefined);

    const memosList: ResidentMemo[] = [
      sampleMemo,
      {
        ...sampleMemo,
        id: 102,
        content: 'Nota de rutina de enfermería',
        status: 'resolved',
        urgency: 'routine',
      },
    ];

    render(
      <MemoFeed
        memos={memosList}
        olderAdultId={5}
        availableUsers={mockUsers}
        availableRoles={mockRoles}
        onStatusChange={onStatusChange}
        onReply={onReply}
      />
    );

    expect(screen.getByText('Se requiere visita domiciliar/familiar para el residente.')).toBeDefined();
    expect(screen.getByText('Nota de rutina de enfermería')).toBeDefined();

    // Click on "Abiertos" filter
    const openFilterBtn = screen.getByRole('button', { name: 'Abiertos' });
    fireEvent.click(openFilterBtn);

    expect(screen.getByText('Se requiere visita domiciliar/familiar para el residente.')).toBeDefined();
    expect(screen.queryByText('Nota de rutina de enfermería')).toBeNull();
  });
});
