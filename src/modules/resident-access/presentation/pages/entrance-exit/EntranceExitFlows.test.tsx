import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EntranceExitDashboard from './EntranceExitDashboard';
import EntranceExitHistory from './EntranceExitHistory';
import RegisterEntranceExit from './RegisterEntranceExit';
import { accessLogService } from '@/infrastructure/api/services/accessLogService';

const mocks = vi.hoisted(() => ({
  findAll: vi.fn(),
  create: vi.fn(),
  navigate: vi.fn(),
  queryType: 'exit',
  success: vi.fn(),
}));
type TestResident = { id: number; name: string; fullName: string };

vi.mock('@/infrastructure/api/services/accessLogService', () => ({
  accessLogService: { findAll: mocks.findAll, create: mocks.create },
}));
vi.mock('@/shared/navigation', () => ({
  useNavigate: () => mocks.navigate,
  useSearchParams: () => [new URLSearchParams(`type=${mocks.queryType}`)],
}));
vi.mock('@/shared/hooks/useFeedbackWithNotifications', () => ({
  useFeedbackWithNotifications: () => ({ success: mocks.success }),
}));
vi.mock('@/modules/residents', async () => {
  const ReactModule = await import('react');
  return {
    ResidentSearchPicker: ({ onChange, label = 'Residente' }: { onChange: (resident: TestResident | null) => void; label?: string }) => ReactModule.createElement(
      'div', null,
      ReactModule.createElement('span', null, label),
      ReactModule.createElement('button', {
        type: 'button',
        onClick: () => onChange({ id: 52, name: 'María', fullName: 'María Pérez' }),
      }, 'Seleccionar residente de prueba'),
    ),
  };
});

describe('flujos de entradas, salidas y visitas', () => {
  beforeEach(() => {
    mocks.queryType = 'exit';
    mocks.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 25 });
    mocks.create.mockResolvedValue({ id: 1 });
  });
  afterEach(() => vi.clearAllMocks());

  it('muestra movimientos recientes y ofrece navegación al registro de visita', async () => {
    mocks.findAll.mockResolvedValue({
      data: [{ id: 3, idOlderAdult: 52, eventType: 'return', occurredAt: '2026-10-14T16:00:00Z', expectedReturnAt: null, visitorName: null, notes: 'Regreso', recordedBy: 7, resident: { id: 52, name: 'María Pérez' } }],
      total: 1, page: 1, limit: 25,
    });
    render(<EntranceExitDashboard />);

    expect(await screen.findByText('María Pérez')).toBeInTheDocument();
    expect(screen.getAllByText('Regreso').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Registrar visita' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/entrance-exit/register?type=visit');
  });

  it('registra una salida con residente, hora y regreso esperado mediante access_logs', async () => {
    render(<RegisterEntranceExit />);
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar residente de prueba' }));
    const occurredAt = '2026-10-14T09:00';
    const expectedReturnAt = '2026-10-14T12:00';
    fireEvent.change(screen.getByLabelText('Fecha y hora'), { target: { value: occurredAt } });
    fireEvent.change(screen.getByLabelText('Regreso estimado (opcional)'), { target: { value: expectedReturnAt } });
    fireEvent.change(screen.getByLabelText('Observaciones'), { target: { value: 'Cita médica' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Registrar salida' }).closest('form')!);

    await waitFor(() => expect(accessLogService.create).toHaveBeenCalledWith({
      eventType: 'exit',
      residentId: 52,
      occurredAt: new Date(occurredAt).toISOString(),
      expectedReturnAt: new Date(expectedReturnAt).toISOString(),
      visitorName: undefined,
      notes: 'Cita médica',
    }));
  });

  it('registra visitas generales con nombre y sin tocar estancias clínicas', async () => {
    mocks.queryType = 'visit';
    render(<RegisterEntranceExit />);
    fireEvent.change(screen.getByLabelText('Nombre del visitante'), { target: { value: 'Ana Visitante' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Registrar visita' }).closest('form')!);

    await waitFor(() => expect(accessLogService.create).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'visit', visitorName: 'Ana Visitante', residentId: undefined,
    })));
  });

  it('filtra el historial por residente, nombre de visitante, evento y fechas', async () => {
    render(<EntranceExitHistory />);
    await screen.findByText('No hay movimientos que coincidan con los filtros.');
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar residente de prueba' }));
    fireEvent.change(screen.getByLabelText('Movimiento'), { target: { value: 'visit' } });
    fireEvent.change(screen.getByLabelText('Visitante'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-10-15' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Filtros del historial de accesos' }));

    await waitFor(() => expect(accessLogService.findAll).toHaveBeenLastCalledWith(expect.objectContaining({
      eventType: 'visit', residentId: 52, visitorName: 'Ana', page: 1, limit: 25,
      from: expect.any(String), to: expect.any(String),
    })));
  });
});
