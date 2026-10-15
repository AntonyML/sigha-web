import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import InpatientCensusPage from './InpatientCensusPage';
import { inpatientService } from '@/infrastructure/api/services/inpatientService';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';

vi.mock('@/infrastructure/api/services/inpatientService', () => ({
  inpatientService: {
    getRooms: vi.fn(),
    getAllCurrentAssignments: vi.fn(),
    createRoom: vi.fn(),
    assignBed: vi.fn(),
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

const mockRooms = [
  { id: 1, roomNumber: '101', name: 'Habitación Asistida', floorWing: 'Ala Norte', capacity: 2, isActive: true },
  { id: 2, roomNumber: '102', name: 'Habitación Individual', floorWing: 'Ala Sur', capacity: 1, isActive: true },
];

const mockAssignments = [
  {
    id: 10,
    idOlderAdult: 1,
    idRoom: 1,
    bedLabel: 'Cama 1',
    assignedAt: '2026-10-14T10:00:00Z',
    isCurrent: true,
    olderAdult: {
      id: 1,
      oaName: 'Juan',
      oaFLastName: 'Pérez',
      oaIdentification: '1-1111-1111',
    },
  },
];

const mockResidents = [
  {
    id: 1,
    nombreApellido: 'Juan Pérez',
    cedula: '1-1111-1111',
  },
  {
    id: 2,
    nombreApellido: 'Rosa Gómez',
    cedula: '2-2222-2222',
  },
];

describe('InpatientCensusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(inpatientService.getRooms).mockResolvedValue(mockRooms);
    vi.mocked(inpatientService.getAllCurrentAssignments).mockResolvedValue(mockAssignments);
    vi.mocked(virtualFileService.getAllVirtualFiles).mockResolvedValue(mockResidents as never);
  });

  it('renderiza el título del censo y las métricas calculadas', async () => {
    render(<InpatientCensusPage />);

    await waitFor(() => {
      expect(screen.getByText('Censo Residencial y Mapa de Camas')).toBeDefined();
      expect(screen.getByText('Hab. 101')).toBeDefined();
      expect(screen.getByText('Hab. 102')).toBeDefined();
    });

    // Metric cards
    expect(screen.getByText('Capacidad Total')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined(); // 2 + 1 = 3 beds
  });

  it('muestra el residente asignado en la cama correspondiente', async () => {
    render(<InpatientCensusPage />);

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeDefined();
      expect(screen.getByText('Cédula: 1-1111-1111')).toBeDefined();
    });
  });

  it('permite abrir el modal de nueva habitación', async () => {
    render(<InpatientCensusPage />);

    await waitFor(() => {
      expect(screen.getByText('Nueva Habitación')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Nueva Habitación'));
    });

    await waitFor(() => {
      expect(screen.getByText('Registrar Nueva Habitación')).toBeDefined();
      expect(screen.getByPlaceholderText('Ej: 101, A-12, PB-04')).toBeDefined();
    });
  });

  it('permite abrir el modal de asignación de cama', async () => {
    render(<InpatientCensusPage />);

    await waitFor(() => {
      expect(screen.getByText('Asignar / Reubicar Cama')).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Asignar / Reubicar Cama'));
    });

    await waitFor(() => {
      expect(screen.getByText('Asignar o Reubicar Cama')).toBeDefined();
      expect(screen.getByText(/Persona Adulta Mayor/i)).toBeDefined();
    });
  });
});

