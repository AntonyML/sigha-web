import { describe, it, expect, vi, beforeEach } from 'vitest';
import { encountersService } from './encountersService';
import { httpClient } from '@/infrastructure/api/httpClient';

vi.mock('@/infrastructure/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('encountersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updateSoap debe enviar PATCH a /clinical-encounters/:id/soap', async () => {
    const mockEncounter = { id: 10, soSubjective: 'Dolor leve' };
    vi.mocked(httpClient.patch).mockResolvedValueOnce({ data: mockEncounter } as never);

    const payload = { soSubjective: 'Dolor leve', status: 'in_progress' as const };
    const res = await encountersService.updateSoap(10, payload);

    expect(httpClient.patch).toHaveBeenCalledWith('/clinical-encounters/10/soap', payload);
    expect(res).toEqual(mockEncounter);
  });

  it('signEncounter debe enviar POST a /clinical-encounters/:id/sign', async () => {
    const mockSigned = { id: 10, isSigned: true };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockSigned } as never);

    const res = await encountersService.signEncounter(10);

    expect(httpClient.post).toHaveBeenCalledWith('/clinical-encounters/10/sign');
    expect(res).toEqual(mockSigned);
  });

  it('createAddendum debe enviar POST a /clinical-encounters/:id/addendums', async () => {
    const mockAddendum = { id: 1, addendumText: 'Texto aclaratorio' };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockAddendum } as never);

    const payload = {
      addendumText: 'Texto aclaratorio',
      reasonForAddendum: 'Aclaración de dosis',
    };
    const res = await encountersService.createAddendum(10, payload);

    expect(httpClient.post).toHaveBeenCalledWith('/clinical-encounters/10/addendums', payload);
    expect(res).toEqual(mockAddendum);
  });

  it('recordVitalSigns debe enviar POST a /vital-signs', async () => {
    const mockVitals = { id: 5, systolicBp: 120, diastolicBp: 80 };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockVitals } as never);

    const payload = { idOlderAdult: 1, systolicBp: 120, diastolicBp: 80 };
    const res = await encountersService.recordVitalSigns(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/vital-signs', payload);
    expect(res).toEqual(mockVitals);
  });

  it('recordNursingRound debe enviar POST a /nursing-rounds', async () => {
    const mockRound = { id: 2, shift: 'morning' as const };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: mockRound } as never);

    const payload = { idOlderAdult: 1, shift: 'morning' as const };
    const res = await encountersService.recordNursingRound(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/nursing-rounds', payload);
    expect(res).toEqual(mockRound);
  });
});
