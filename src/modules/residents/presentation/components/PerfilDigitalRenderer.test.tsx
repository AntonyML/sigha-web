import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PerfilDigitalRenderer } from './PerfilDigitalRenderer';
import { perfilDigitalService } from '@/infrastructure/api/services/perfilDigitalService';
import type { PlantillaPerfil } from '@/shared/types/perfilDigital';

vi.mock('@/infrastructure/api/services/perfilDigitalService', () => ({
  perfilDigitalService: {
    getByPerfilId: vi.fn(),
    getPlantillaVigente: vi.fn(),
    saveDatos: vi.fn(),
  },
}));

const mockPlantilla: PlantillaPerfil = {
  id: 'plantilla-uuid-1',
  tenantId: 1,
  rolAplicable: 'RESIDENTE',
  nombre: 'Expediente Único de Residencia',
  descripcion: 'Campos dinámicos del residente',
  version: 1,
  esVigente: true,
  secciones: [
    {
      id: 'sec-1',
      plantillaId: 'plantilla-uuid-1',
      clave: 'evaluacion_cognitiva',
      titulo: 'Evaluación Cognitiva',
      descripcion: 'Pruebas y observaciones cognitivas',
      orden: 1,
      campos: [
        {
          id: 'campo-1',
          tenantId: 1,
          seccionId: 'sec-1',
          clave: 'nivel_alerta',
          etiqueta: 'Nivel de Alerta y Orientación',
          tipo: 'texto',
          obligatorio: false,
          visible: true,
          editable: true,
          orden: 1,
        },
        {
          id: 'campo-2',
          tenantId: 1,
          seccionId: 'sec-1',
          clave: 'requiere_asistencia_marcha',
          etiqueta: '¿Requiere asistencia para la marcha?',
          tipo: 'booleano',
          obligatorio: false,
          visible: true,
          editable: true,
          orden: 2,
        },
      ],
    },
  ],
};

describe('PerfilDigitalRenderer', () => {
  beforeEach(() => {
    vi.mocked(perfilDigitalService.getByPerfilId).mockResolvedValue({
      perfilDigital: {
        perfilId: 'perfil-123',
        tenantId: 1,
        plantillaId: 'plantilla-uuid-1',
        plantillaVersion: 1,
        datos: {
          nivel_alerta: 'Alerta y ubicado en tiempo y espacio',
          requiere_asistencia_marcha: true,
        },
      },
      esquema: mockPlantilla,
    });
    vi.mocked(perfilDigitalService.saveDatos).mockResolvedValue({
      perfilId: 'perfil-123',
      tenantId: 1,
      plantillaId: 'plantilla-uuid-1',
      plantillaVersion: 1,
      datos: {
        nivel_alerta: 'Actualizado',
        requiere_asistencia_marcha: false,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dynamic sections and field labels', async () => {
    render(<PerfilDigitalRenderer perfilId="perfil-123" readonly />);

    expect(await screen.findByText('Evaluación Cognitiva')).toBeInTheDocument();
    expect(screen.getByText('Nivel de Alerta y Orientación')).toBeInTheDocument();
    expect(screen.getByText('¿Requiere asistencia para la marcha?')).toBeInTheDocument();
  });

  it('allows editing and calls saveDatos when saving', async () => {
    const onSaved = vi.fn();
    render(<PerfilDigitalRenderer perfilId="perfil-123" onSaved={onSaved} />);

    expect(await screen.findByText('Evaluación Cognitiva')).toBeInTheDocument();

    const input = screen.getByDisplayValue('Alerta y ubicado en tiempo y espacio');
    fireEvent.change(input, { target: { value: 'Nuevo estado cognitivo' } });

    const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(perfilDigitalService.saveDatos).toHaveBeenCalledWith(
        'perfil-123',
        expect.objectContaining({
          datos: expect.objectContaining({
            nivel_alerta: 'Nuevo estado cognitivo',
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(onSaved).toHaveBeenCalled();
    });
  });
});
