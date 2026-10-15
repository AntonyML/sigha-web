import { httpClient } from '@/infrastructure/api/httpClient';

export interface FacilityRoomItem {
  id: number;
  roomNumber: string;
  name: string;
  floorWing?: string;
  capacity: number;
  isActive: boolean;
}

export interface PatientBedAssignmentItem {
  id: number;
  idOlderAdult: number;
  idRoom: number;
  bedLabel: string;
  assignedAt: string;
  dischargedAt?: string;
  isCurrent: boolean;
  notes?: string;
  room?: FacilityRoomItem;
  olderAdult?: {
    id: number;
    oaName?: string;
    oaFLastName?: string;
    oaIdentification?: string;
  };
}

export interface AssignBedPayload {
  idOlderAdult: number;
  idRoom: number;
  bedLabel?: string;
  notes?: string;
}

export const inpatientService = {
  getRooms: (activeOnly: boolean = false): Promise<FacilityRoomItem[]> =>
    httpClient
      .get('/inpatient/rooms', { params: { activeOnly: activeOnly ? 'true' : 'false' } })
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),

  createRoom: (payload: { roomNumber: string; name: string; floorWing?: string; capacity?: number; isActive?: boolean }): Promise<FacilityRoomItem> =>
    httpClient
      .post('/inpatient/rooms', payload)
      .then((r) => r.data?.data ?? r.data),

  assignBed: (payload: AssignBedPayload): Promise<PatientBedAssignmentItem> =>
    httpClient
      .post('/inpatient/beds/assign', payload)
      .then((r) => r.data?.data ?? r.data),

  getCurrentBedAssignment: (patientId: number): Promise<PatientBedAssignmentItem | null> =>
    httpClient
      .get(`/inpatient/beds/patient/${patientId}`)
      .then((r) => r.data?.data ?? r.data),

  getAllCurrentAssignments: (): Promise<PatientBedAssignmentItem[]> =>
    httpClient
      .get('/inpatient/beds/current')
      .then((r) => (Array.isArray(r.data) ? r.data : r.data?.data ?? [])),
};
