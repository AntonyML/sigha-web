import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import OlderAdultSelector from './OlderAdultSelector';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';

vi.mock('@/infrastructure/api/services/virtualFileService', () => ({
  virtualFileService: {
    searchPatientsBasic: vi.fn(),
  },
}));

const patients = [
  {
    id: 101,
    identification: '102340567',
    name: 'María',
    firstLastName: 'González',
    secondLastName: 'Rojas',
    fullName: 'María González Rojas',
    birthdate: '1950-01-01',
    gender: 'F',
    phone: '',
    email: '',
    status: 'alive',
  },
  {
    id: 202,
    identification: '203450678',
    name: 'Juan',
    firstLastName: 'Pérez',
    secondLastName: 'León',
    fullName: 'Juan Pérez León',
    birthdate: '1948-05-05',
    gender: 'M',
    phone: '',
    email: '',
    status: 'alive',
  },
];

describe('OlderAdultSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no pide ni muestra el ID interno: solo búsqueda por cédula/nombre y select', () => {
    const onSelect = vi.fn();
    const { container } = render(<OlderAdultSelector value={null} onSelect={onSelect} />);

    expect(screen.getByPlaceholderText(/cédula o por nombre/i)).toBeDefined();
    expect(screen.getByRole('combobox', { name: /adulto mayor/i })).toBeDefined();

    // Nunca se pide el ID en la UI
    expect(screen.queryByText(/ID Adulto Mayor/i)).toBeNull();
    expect(screen.queryByLabelText(/ID/i)).toBeNull();
    // El texto visible no contiene el id interno numérico
    expect(container.textContent).not.toContain('101');
    expect(container.textContent).not.toContain('202');
  });

  it('busca por nombre y puebla el select con nombre + cédula', async () => {
    vi.mocked(virtualFileService.searchPatientsBasic).mockResolvedValueOnce(patients);
    const onSelect = vi.fn();
    render(<OlderAdultSelector value={null} onSelect={onSelect} />);

    fireEvent.change(screen.getByPlaceholderText(/cédula o por nombre/i), {
      target: { value: 'María' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(virtualFileService.searchPatientsBasic).toHaveBeenCalledWith('María');
    });

    const select = screen.getByRole('combobox', { name: /adulto mayor/i }) as HTMLSelectElement;
    await waitFor(() => {
      expect(select.options.length).toBe(3); // placeholder + 2 resultados
    });
    expect(select.textContent).toContain('María González Rojas — Cédula: 102340567');
    expect(select.textContent).toContain('Juan Pérez León — Cédula: 203450678');
  });

  it('al elegir una opción notifica la selección y muestra nombre/cédula sin el ID', async () => {
    vi.mocked(virtualFileService.searchPatientsBasic).mockResolvedValueOnce(patients);
    const onSelect = vi.fn();
    const { rerender } = render(<OlderAdultSelector value={null} onSelect={onSelect} />);

    fireEvent.change(screen.getByPlaceholderText(/cédula o por nombre/i), {
      target: { value: '10234' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(virtualFileService.searchPatientsBasic).toHaveBeenCalledWith('10234');
    });

    const select = screen.getByRole('combobox', { name: /adulto mayor/i }) as HTMLSelectElement;
    await waitFor(() => {
      expect(select.options.length).toBe(3);
    });

    fireEvent.change(select, { target: { value: '101' } });
    expect(onSelect).toHaveBeenCalledWith(patients[0]);

    // Simula el padre guardando la selección y re-renderiza la confirmación
    rerender(<OlderAdultSelector value={patients[0]} onSelect={onSelect} />);
    expect(screen.getAllByText(/María González Rojas/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/102340567/).length).toBeGreaterThanOrEqual(1);
    // La confirmación no expone el ID interno como texto
    const status = screen.getByRole('status').textContent ?? '';
    expect(status).not.toMatch(/ID\s*:?\s*101/i);
  });

  it('muestra error accesible si la búsqueda falla', async () => {
    vi.mocked(virtualFileService.searchPatientsBasic).mockRejectedValueOnce(new Error('down'));
    render(<OlderAdultSelector value={null} onSelect={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/cédula o por nombre/i), {
      target: { value: 'Pedro' },
    });
    fireEvent.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText(/No se pudo buscar/i)).toBeDefined();
    });
  });
});
