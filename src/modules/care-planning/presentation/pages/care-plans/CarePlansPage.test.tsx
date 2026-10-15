import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CarePlansPage from './CarePlansPage';
import { carePlanService } from '@/infrastructure/api/services/carePlanService';

const mocks = vi.hoisted(() => ({ success: vi.fn() }));
type TestResident = { id: number; name: string; fullName: string };

vi.mock('@/infrastructure/api/services/carePlanService', () => ({
  carePlanService: {
    getCatalog: vi.fn(),
    getEnrollments: vi.fn(),
    getScaleEvaluations: vi.fn(),
    createEnrollment: vi.fn(),
    createProgram: vi.fn(),
    createSubprogram: vi.fn(),
    updateEnrollment: vi.fn(),
  },
}));
vi.mock('@/shared/lib/permissionUtils', () => ({
  usePermissions: () => ({ canPerformAction: () => true }),
}));
vi.mock('@/shared/hooks/useFeedbackWithNotifications', () => ({
  useFeedbackWithNotifications: () => ({ success: mocks.success }),
}));
vi.mock('@/modules/residents', async () => {
  const ReactModule = await import('react');
  return {
    ResidentSearchPicker: ({ onChange }: { onChange: (resident: TestResident | null) => void }) => ReactModule.createElement(
      'button', { type: 'button', onClick: () => onChange({ id: 52, name: 'Carlos', fullName: 'Carlos Pérez' }) }, 'Seleccionar residente de prueba',
    ),
  };
});

const enrollment = {
  id: 11,
  idOlderAdult: 52,
  subprogramId: 2,
  scaleEvaluationId: null,
  status: 'active' as const,
  goals: 'Caminar con apoyo',
  startedAt: '2026-10-01T12:00:00.000Z',
  endedAt: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  resident: { id: 52, name: 'Carlos Pérez' },
  subprogram: { id: 2, name: 'Movilidad', programId: 1, programName: 'Autonomía' },
  scaleEvaluation: null,
};

describe('CarePlansPage', () => {
  beforeEach(() => {
    vi.mocked(carePlanService.getCatalog).mockResolvedValue([{ id: 1, name: 'Autonomía', subprograms: [{ id: 2, programId: 1, name: 'Movilidad' }] }]);
    vi.mocked(carePlanService.getEnrollments).mockResolvedValue([]);
    vi.mocked(carePlanService.getScaleEvaluations).mockResolvedValue([{ id: 99, scaleType: 'BARTHEL', totalScore: 80, interpretation: 'Apoyo leve', evaluatedAt: '2026-10-14T12:00:00Z', encounterId: 8 }]);
    vi.mocked(carePlanService.createEnrollment).mockResolvedValue(enrollment);
    vi.mocked(carePlanService.updateEnrollment).mockResolvedValue(enrollment);
  });
  afterEach(() => vi.clearAllMocks());

  it('inscribe a un residente y asocia una evaluación clínica junto con sus metas y fecha', async () => {
    render(<CarePlansPage />);
    await screen.findByRole('option', { name: 'Autonomía' });
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar residente de prueba' }));
    await waitFor(() => expect(carePlanService.getScaleEvaluations).toHaveBeenCalledWith(52));
    fireEvent.change(screen.getByLabelText('Programa'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Subprograma'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Evaluación clínica asociada'), { target: { value: '99' } });
    fireEvent.change(screen.getByLabelText('Metas de cuidado'), { target: { value: 'Mantener movilidad diaria' } });
    fireEvent.change(screen.getByLabelText('Fecha de inicio'), { target: { value: '2026-10-14' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Crear inscripción' }).closest('form')!);

    await waitFor(() => expect(carePlanService.createEnrollment).toHaveBeenCalledWith({
      residentId: 52,
      subprogramId: 2,
      scaleEvaluationId: 99,
      goals: 'Mantener movilidad diaria',
      startedAt: new Date('2026-10-14T12:00:00').toISOString(),
    }));
  });

  it('actualiza metas, estado y fechas de una inscripción existente', async () => {
    vi.mocked(carePlanService.getEnrollments).mockResolvedValue([{ ...enrollment, status: 'completed', endedAt: '2026-10-10T12:00:00.000Z' }]);
    render(<CarePlansPage />);
    await screen.findByText('Carlos Pérez');

    fireEvent.change(screen.getByLabelText('Metas de Carlos Pérez'), { target: { value: 'Caminar 20 minutos' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar metas' }));
    await waitFor(() => expect(carePlanService.updateEnrollment).toHaveBeenCalledWith(11, { goals: 'Caminar 20 minutos' }));

    fireEvent.change(screen.getByLabelText('Estado de Carlos Pérez'), { target: { value: 'cancelled' } });
    await waitFor(() => expect(carePlanService.updateEnrollment).toHaveBeenCalledWith(11, { status: 'cancelled' }));

    fireEvent.change(screen.getByLabelText('Fecha de inicio de Carlos Pérez'), { target: { value: '2026-10-02' } });
    fireEvent.change(screen.getByLabelText('Fecha de término de Carlos Pérez'), { target: { value: '2026-10-14' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar fechas' }));
    await waitFor(() => expect(carePlanService.updateEnrollment).toHaveBeenCalledWith(11, {
      startedAt: new Date('2026-10-02T12:00:00').toISOString(),
      endedAt: new Date('2026-10-14T12:00:00').toISOString(),
    }));
  });
});
