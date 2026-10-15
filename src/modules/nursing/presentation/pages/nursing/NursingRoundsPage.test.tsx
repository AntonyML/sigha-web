import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import React from 'react';
import NursingRoundsPage from './NursingRoundsPage';
import { encountersService } from '@/infrastructure/api/services/encountersService';

const mockFeedback = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
  showToast: vi.fn(),
  showModal: vi.fn(),
  showNotification: vi.fn(),
  confirm: vi.fn(),
};

vi.mock('@/shared/hooks/useFeedbackWithNotifications', () => ({
  useFeedbackWithNotifications: () => mockFeedback,
}));

vi.mock('@/infrastructure/api/services/encountersService', () => ({
  encountersService: {
    getRoundsByDate: vi.fn(),
    recordVitalSigns: vi.fn(),
    recordNursingRound: vi.fn(),
  },
}));

describe('NursingRoundsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar las rondas exactamente una vez al montar sin entrar en bucle infinito', async () => {
    vi.mocked(encountersService.getRoundsByDate).mockResolvedValue([
      {
        id: 10,
        idOlderAdult: 1,
        idStaff: 1,
        roundDate: '2026-10-15',
        shift: 'morning',
        generalCondition: 'Estable y colaborador',
        skinIntegrity: 'Piel íntegra',
        fallRisk: 'low',
        createdAt: '2026-10-15T08:00:00Z',
        olderAdult: {
          id: 1,
          oaName: 'Carlos',
          oaFLastName: 'Santana',
        },
        vitalSigns: {
          id: 20,
          idOlderAdult: 1,
          systolicBp: 120,
          diastolicBp: 80,
          heartRate: 72,
          temperature: 36.5,
          spo2: 98,
          painEva: 0,
          recordedAt: '2026-10-15T08:00:00Z',
        },
      },
    ]);

    render(<NursingRoundsPage />);

    expect(screen.getByText('Cargando rondas del turno...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Carlos Santana')).toBeInTheDocument();
    });

    expect(screen.getByText('120/80')).toBeInTheDocument();
    expect(screen.getByText('FC: 72 lpm')).toBeInTheDocument();
    expect(screen.getByText('SpO2: 98%')).toBeInTheDocument();
    expect(screen.getByText('36.5 °C')).toBeInTheDocument();

    // Verify it was called once on mount and does NOT continue looping
    expect(encountersService.getRoundsByDate).toHaveBeenCalledTimes(1);

    // Advance timers/microtasks slightly to confirm no delayed loop calls occur
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(encountersService.getRoundsByDate).toHaveBeenCalledTimes(1);
  });

  it('debe recargar cuando cambia el turno seleccionado', async () => {
    vi.mocked(encountersService.getRoundsByDate).mockResolvedValue([]);

    render(<NursingRoundsPage />);

    await waitFor(() => {
      expect(encountersService.getRoundsByDate).toHaveBeenCalledTimes(1);
    });

    const shiftSelect = screen.getByRole('combobox');
    fireEvent.change(shiftSelect, { target: { value: 'night' } });

    await waitFor(() => {
      expect(encountersService.getRoundsByDate).toHaveBeenCalledTimes(2);
    });

    expect(encountersService.getRoundsByDate).toHaveBeenLastCalledWith(
      expect.any(String),
      'night'
    );
  });

  it('debe mostrar mensaje vacío cuando no hay rondas para el turno', async () => {
    vi.mocked(encountersService.getRoundsByDate).mockResolvedValue([]);

    render(<NursingRoundsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('No hay rondas registradas para este turno y fecha')
      ).toBeInTheDocument();
    });
  });

  it('debe registrar nueva ronda y recargar los datos', async () => {
    vi.mocked(encountersService.getRoundsByDate).mockResolvedValue([]);
    vi.mocked(encountersService.recordVitalSigns).mockResolvedValue({
      id: 50,
      idOlderAdult: 1,
      recordedAt: '2026-10-15T08:00:00Z',
    });
    vi.mocked(encountersService.recordNursingRound).mockResolvedValue({
      id: 99,
      idOlderAdult: 1,
      idStaff: 1,
      roundDate: '2026-10-15',
      shift: 'morning',
      generalCondition: 'Estable',
      skinIntegrity: 'Piel sana',
      fallRisk: 'low',
      createdAt: '2026-10-15T08:00:00Z',
    });

    render(<NursingRoundsPage />);

    await waitFor(() => {
      expect(encountersService.getRoundsByDate).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /Nueva Ronda/i }));

    expect(screen.getByText('Registrar Ronda de Sala y Signos Vitales')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /^Guardar Ronda$/i });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(encountersService.recordVitalSigns).toHaveBeenCalledTimes(1);
      expect(encountersService.recordNursingRound).toHaveBeenCalledTimes(1);
      expect(encountersService.recordVitalSigns).toHaveBeenCalledWith(expect.not.objectContaining({ recordedBy: expect.anything() }));
      expect(encountersService.recordNursingRound).toHaveBeenCalledWith(expect.not.objectContaining({ idStaff: expect.anything() }));
      expect(mockFeedback.success).toHaveBeenCalledWith(
        'Ronda de enfermería y signos vitales registrados exitosamente'
      );
    });

    // Reloads rounds after submit
    expect(encountersService.getRoundsByDate).toHaveBeenCalledTimes(2);
  });
});
