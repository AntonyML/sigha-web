import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SystemAuditLogsPage from './SystemAuditLogsPage';
import { systemAuditLogService } from '@/infrastructure/api/services/systemAuditLogService';

vi.mock('@/infrastructure/api/services/systemAuditLogService', () => ({
  systemAuditLogService: { findAll: vi.fn() },
}));

describe('SystemAuditLogsPage', () => {
  beforeEach(() => {
    vi.mocked(systemAuditLogService.findAll).mockResolvedValue({ data: [], total: 0, page: 1, limit: 25 });
  });
  afterEach(() => vi.clearAllMocks());

  it('consulta auditoría en modo lectura, presenta actor/cambios y aplica filtros', async () => {
    vi.mocked(systemAuditLogService.findAll).mockResolvedValue({
      data: [{
        id: '9001', tableName: 'care_programs', recordId: '3', action: 'UPDATE', actorUserId: 7,
        occurredAt: '2026-10-14T15:00:00.000Z', oldValues: { name: 'Antes' }, newValues: { name: 'Después' },
        actor: { id: 7, name: 'María Pérez', email: 'maria@example.test' },
      }],
      total: 1, page: 1, limit: 25,
    });
    render(<SystemAuditLogsPage />);
    expect(await screen.findByText('María Pérez')).toBeInTheDocument();
    expect(screen.getByText('UPDATE')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ver valores anteriores y nuevos'));
    expect(screen.getByText(/Antes/)).toBeInTheDocument();
    expect(screen.getByText(/Después/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar|Eliminar|Guardar/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tabla'), { target: { value: 'care_programs' } });
    fireEvent.change(screen.getByLabelText('Acción'), { target: { value: 'UPDATE' } });
    fireEvent.change(screen.getByLabelText('ID del actor'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-15' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Filtros de auditoría administrativa' }));

    await waitFor(() => expect(systemAuditLogService.findAll).toHaveBeenLastCalledWith(expect.objectContaining({
      tableName: 'care_programs', action: 'UPDATE', actorUserId: 7, page: 1, limit: 25,
      from: expect.any(String), to: expect.any(String),
    })));
  });
});
