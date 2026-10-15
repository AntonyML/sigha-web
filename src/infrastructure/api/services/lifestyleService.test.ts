import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lifestyleService } from './lifestyleService';
import { httpClient } from '@/infrastructure/api/httpClient';

vi.mock('@/infrastructure/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('lifestyleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createAssessment debe enviar POST a /lifestyle/assessments', async () => {
    const payload = {
      idOlderAdult: 1,
      dietType: 'soft',
      dailyFluidIntakeMl: 1800,
    };
    const response = { id: 10, ...payload, assessedAt: '2026-10-14T10:00:00Z' };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: response } as never);

    const result = await lifestyleService.createAssessment(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/lifestyle/assessments', payload);
    expect(result).toEqual(response);
  });

  it('getLatestAssessment debe llamar a /lifestyle/patient/:id', async () => {
    const mockData = { id: 10, idOlderAdult: 1, dietType: 'diabetic' };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockData } as never);

    const result = await lifestyleService.getLatestAssessment(1);

    expect(httpClient.get).toHaveBeenCalledWith('/lifestyle/patient/1');
    expect(result).toEqual(mockData);
  });

  it('getAssessmentHistory debe llamar a /lifestyle/patient/:id/history', async () => {
    const mockList = [{ id: 10, idOlderAdult: 1 }, { id: 9, idOlderAdult: 1 }];
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { data: mockList } } as never);

    const result = await lifestyleService.getAssessmentHistory(1);

    expect(httpClient.get).toHaveBeenCalledWith('/lifestyle/patient/1/history');
    expect(result).toEqual(mockList);
  });
});
