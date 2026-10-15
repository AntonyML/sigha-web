import React, { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ResidentSearchPicker from './ResidentSearchPicker';
import { virtualFileService } from '@/infrastructure/api/services/virtualFileService';
import type { PatientBasicInfo } from '@/shared/types/virtualFile';

vi.mock('@/infrastructure/api/services/virtualFileService', () => ({
  virtualFileService: { searchPatientsBasic: vi.fn() },
}));

const resident: PatientBasicInfo = {
  id: 52, identification: '101010101', name: 'María', firstLastName: 'Pérez', secondLastName: 'Rojas',
  fullName: 'María Pérez Rojas', birthdate: '1940-01-01', gender: 'female', phone: '', email: '', status: 'active',
};

function PickerHarness() {
  const [value, setValue] = useState<PatientBasicInfo | null>(null);
  return <ResidentSearchPicker value={value} onChange={setValue} required />;
}

describe('ResidentSearchPicker', () => {
  beforeEach(() => {
    vi.mocked(virtualFileService.searchPatientsBasic).mockResolvedValue([resident]);
  });
  afterEach(() => vi.clearAllMocks());

  it('searches residents, selects one, and clears the selection without stale results', async () => {
    render(<PickerHarness />);
    const input = screen.getByLabelText('Residente *');
    fireEvent.change(input, { target: { value: 'Mar' } });

    fireEvent.click(await screen.findByRole('button', { name: /María Pérez Rojas/ }));
    await waitFor(() => expect(virtualFileService.searchPatientsBasic).toHaveBeenCalledWith('Mar'));
    expect(input).toHaveValue('María Pérez Rojas');

    fireEvent.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: /María Pérez Rojas/ })).not.toBeInTheDocument();
  });
});
