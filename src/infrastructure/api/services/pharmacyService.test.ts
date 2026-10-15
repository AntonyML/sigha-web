import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pharmacyService } from './pharmacyService';
import { httpClient } from '@/infrastructure/api/httpClient';

vi.mock('@/infrastructure/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('pharmacyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMedications debe llamar a /pharmacy/medications con search y activeOnly', async () => {
    const mockData = [{ id: 1, name: 'Paracetamol 500mg' }];
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { data: mockData } } as never);

    const result = await pharmacyService.getMedications('para', true);

    expect(httpClient.get).toHaveBeenCalledWith('/pharmacy/medications', {
      params: { search: 'para', activeOnly: 'true' },
    });
    expect(result).toEqual(mockData);
  });

  it('getDailyKardex debe llamar a /pharmacy/kardex/daily con fecha', async () => {
    const mockSlots = [
      {
        prescriptionId: 10,
        olderAdultId: 1,
        medicationName: 'Losartán 50mg',
        scheduledTime: '08:00',
        status: 'scheduled',
      },
    ];
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockSlots } as never);

    const result = await pharmacyService.getDailyKardex('2026-10-14');

    expect(httpClient.get).toHaveBeenCalledWith('/pharmacy/kardex/daily', {
      params: { date: '2026-10-14', olderAdultId: undefined },
    });
    expect(result).toEqual(mockSlots);
  });

  it('recordAdministration debe enviar POST a /pharmacy/kardex/administrations', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: { success: true } } as never);

    const payload = {
      prescriptionId: 10,
      olderAdultId: 1,
      scheduledDate: '2026-10-14',
      scheduledTime: '08:00',
      status: 'administered' as const,
      administeredBy: 22,
    };

    const res = await pharmacyService.recordAdministration(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/pharmacy/kardex/administrations', payload);
    expect(res).toEqual({ success: true });
  });
});
