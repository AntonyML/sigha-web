import { describe, it, expect, vi, beforeEach } from 'vitest';
import { inpatientService } from './inpatientService';
import { httpClient } from '@/infrastructure/api/httpClient';

vi.mock('@/infrastructure/api/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('inpatientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRooms debe llamar a /inpatient/rooms con activeOnly', async () => {
    const mockRooms = [{ id: 1, roomNumber: '101', name: 'Habitación 101', capacity: 2, isActive: true }];
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { data: mockRooms } } as never);

    const result = await inpatientService.getRooms(true);

    expect(httpClient.get).toHaveBeenCalledWith('/inpatient/rooms', {
      params: { activeOnly: 'true' },
    });
    expect(result).toEqual(mockRooms);
  });

  it('createRoom debe enviar POST a /inpatient/rooms con el payload adecuado', async () => {
    const newRoom = { roomNumber: '102', name: 'Pabellón Norte', floorWing: 'Ala A', capacity: 3, isActive: true };
    const created = { id: 2, ...newRoom };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: { data: created } } as never);

    const result = await inpatientService.createRoom(newRoom);

    expect(httpClient.post).toHaveBeenCalledWith('/inpatient/rooms', newRoom);
    expect(result).toEqual(created);
  });

  it('assignBed debe enviar POST a /inpatient/beds/assign', async () => {
    const payload = { idOlderAdult: 5, idRoom: 1, bedLabel: 'Cama A', notes: 'Cerca de la ventana' };
    const response = { id: 10, ...payload, assignedAt: '2026-10-14T10:00:00Z', isCurrent: true };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: response } as never);

    const result = await inpatientService.assignBed(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/inpatient/beds/assign', payload);
    expect(result).toEqual(response);
  });

  it('getCurrentBedAssignment debe llamar a /inpatient/beds/patient/:id', async () => {
    const mockAssignment = { id: 10, idOlderAdult: 5, idRoom: 1, bedLabel: 'Cama A', assignedAt: '2026-10-14', isCurrent: true };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: mockAssignment } as never);

    const result = await inpatientService.getCurrentBedAssignment(5);

    expect(httpClient.get).toHaveBeenCalledWith('/inpatient/beds/patient/5');
    expect(result).toEqual(mockAssignment);
  });

  it('getAllCurrentAssignments debe llamar a /inpatient/beds/current', async () => {
    const mockList = [{ id: 10, idOlderAdult: 5, idRoom: 1, bedLabel: 'Cama A', assignedAt: '2026-10-14', isCurrent: true }];
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { data: mockList } } as never);

    const result = await inpatientService.getAllCurrentAssignments();

    expect(httpClient.get).toHaveBeenCalledWith('/inpatient/beds/current');
    expect(result).toEqual(mockList);
  });
});
