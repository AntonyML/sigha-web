import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BitacoraComposer } from './BitacoraComposer';
import { BitacoraCard } from './BitacoraCard';
import { BitacoraFeed } from './BitacoraFeed';
import type { ResidentMemo } from '@/shared/types/memos';

describe('Bitacora Components', () => {
  const mockUsers = [
    { id: 1, name: 'Dr. Roberto Gomez', roleName: 'Psicólogo' },
    { id: 2, name: 'Lic. Ana Solis', roleName: 'Trabajadora Social' },
  ];

  const mockRoles = [
    { id: 10, name: 'Trabajo Social' },
    { id: 11, name: 'Enfermería' },
  ];

  const sampleNota: ResidentMemo = {
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

  it('renders BitacoraComposer and submits content', async () => {
    const onCreated = vi.fn().mockResolvedValue(undefined);

    render(
      <BitacoraComposer
        olderAdultId={5}
        availableUsers={mockUsers}
        availableRoles={mockRoles}
        onMemoCreated={onCreated}
      />
    );

    const textarea = screen.getByPlaceholderText('¿Qué necesita registrar en la bitácora o derivar sobre el residente?');
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: 'Nueva observación conductual' } });
    const submitBtn = screen.getByRole('button', { name: /Publicar en Bitácora/i });
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

  it('renders BitacoraCard with author, content, tags and attachments', () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onReply = vi.fn().mockResolvedValue(undefined);

    render(
      <BitacoraCard
        memo={sampleNota}
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

  it('BitacoraCard toggles status when clicking the status button', async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onReply = vi.fn().mockResolvedValue(undefined);

    render(
      <BitacoraCard
        memo={sampleNota}
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

  it('BitacoraFeed filters notes by search and status', () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const onReply = vi.fn().mockResolvedValue(undefined);

    const notasList: ResidentMemo[] = [
      sampleNota,
      {
        ...sampleNota,
        id: 102,
        content: 'Nota de rutina de enfermería',
        status: 'resolved',
        urgency: 'routine',
      },
    ];

    render(
      <BitacoraFeed
        memos={notasList}
        olderAdultId={5}
        availableUsers={mockUsers}
        availableRoles={mockRoles}
        onStatusChange={onStatusChange}
        onReply={onReply}
      />
    );

    expect(screen.getByText('Se requiere visita domiciliar/familiar para el residente.')).toBeDefined();
    expect(screen.getByText('Nota de rutina de enfermería')).toBeDefined();
  });
});
