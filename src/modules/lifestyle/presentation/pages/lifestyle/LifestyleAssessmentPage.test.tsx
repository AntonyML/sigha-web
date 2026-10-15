import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import LifestyleAssessmentPage from './LifestyleAssessmentPage';
import { lifestyleService } from '@/infrastructure/api/services/lifestyleService';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';

vi.mock('@/infrastructure/api/services/lifestyleService', () => ({
  lifestyleService: {
    getLatestAssessment: vi.fn(),
    getAssessmentHistory: vi.fn(),
    createAssessment: vi.fn(),
  },
}));

vi.mock('@/infrastructure/api/services/virtualFileService', () => ({
  virtualFileService: {
    getAllVirtualFiles: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useFeedbackWithNotifications', () => ({
  useFeedbackWithNotifications: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

const mockResidents = [
  {
    id: 1,
    nombreApellido: 'Carmen Soto',
    cedula: '1-0421-0852',
  },
];

const mockAssessment = {
  id: 1,
  idOlderAdult: 1,
  assessedAt: '2026-10-14T10:00:00Z',
  dietType: 'soft',
  dietConsistency: 'picada',
  mealsPerDay: 4,
  appetite: 'normal',
  dailyFluidIntakeMl: 1800,
  requiresFluidThickener: false,
  sleepHoursPerNight: 8,
  sleepQuality: 'good',
  sleepMedicationRequired: false,
  physicalActivityLevel: 'moderate',
  dailyWalkingMinutes: 20,
  mobilityAssistanceRequired: false,
  smokingStatus: 'never',
  alcoholStatus: 'never',
  lifestyleSummary: 'Paciente en excelente condición nutricional.',
  createdAt: '2026-10-14T10:00:00Z',
  updatedAt: '2026-10-14T10:00:00Z',
};

describe('LifestyleAssessmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(virtualFileService.getAllVirtualFiles).mockResolvedValue(mockResidents as never);
    vi.mocked(lifestyleService.getLatestAssessment).mockResolvedValue(mockAssessment);
    vi.mocked(lifestyleService.getAssessmentHistory).mockResolvedValue([mockAssessment]);
  });

  it('renderiza el título y las tarjetas principales de la evaluación', async () => {
    render(<LifestyleAssessmentPage />);

    await waitFor(() => {
      expect(screen.getByText('Estilo de Vida y Hábitos Geriátricos')).toBeDefined();
      expect(screen.getByText('Dieta y Nutrición')).toBeDefined();
      expect(screen.getByText('Hidratación')).toBeDefined();
      expect(screen.getByText('Sueño y Descanso')).toBeDefined();
      expect(screen.getByText('Actividad Física')).toBeDefined();
    });

    expect(screen.getByText(/1800 ml/i)).toBeDefined();
    expect(screen.getByText('Carmen Soto (Cédula: 1-0421-0852)')).toBeDefined();
  });

  it('permite abrir el modal para registrar una nueva evaluación', async () => {
    render(<LifestyleAssessmentPage />);

    await waitFor(() => {
      expect(screen.getByText('Nueva Evaluación de Hábitos')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Nueva Evaluación de Hábitos'));
    });

    await waitFor(() => {
      expect(screen.getByText('Nueva Evaluación de Hábitos Geriátricos')).toBeDefined();
      expect(screen.getByText(/1. Nutrición y Alimentación/i)).toBeDefined();
      expect(screen.getByText(/2. Hidratación Diaria/i)).toBeDefined();
    });
  });
});
