import axios from 'axios';
import type {
  NursingAppointment,
  GetNursingAppointmentsDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto,
  CompleteAppointmentDto,
  NursingAppointmentResponse,
  SingleNursingAppointmentResponse,
  CompleteAppointmentResponse,
  NursingRecordsResponse
} from '../types/nursing';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
      navigateTo('/login');
    }
    return Promise.reject(error);
  }
);

export const nursingService = {
  
  /**
   * Get all nursing appointments with optional filters
   * 
   * @param filters Optional filters (status, priority, dateFrom, dateTo)
   * @returns Promise<NursingAppointment[]>
   * 
   * Endpoint: GET /nursing/appointments
   * Query params: status, priority, dateFrom, dateTo
   */
  async getNursingAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingAppointment[]> {
    try {
      const response = await apiClient.get<NursingAppointmentResponse>('/nursing/appointments', {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching nursing appointments:', error);
      throw error;
    }
  },

  /**
   * Get pending nursing appointments (scheduled + in_progress)
   * 
   * @param filters Optional filters (priority, dateFrom, dateTo)
   * @returns Promise<NursingAppointment[]>
   * 
   * Endpoint: GET /nursing/appointments/pending
   */
  async getPendingAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingAppointment[]> {
    try {
      const response = await apiClient.get<NursingAppointmentResponse>('/nursing/appointments/pending', {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pending nursing appointments:', error);
      throw error;
    }
  },

  /**
   * Get completed nursing appointments with their nursing records
   * 
   * @param filters Optional filters (priority, dateFrom, dateTo)
   * @returns Promise<NursingAppointment[]>
   * 
   * Endpoint: GET /nursing/appointments/completed
   */
  async getCompletedAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingAppointment[]> {
    try {
      const response = await apiClient.get<NursingAppointmentResponse>('/nursing/appointments/completed', {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching completed nursing appointments:', error);
      throw error;
    }
  },

  /**
   * Get cancelled nursing appointments
   * 
   * @param filters Optional filters (priority, dateFrom, dateTo)
   * @returns Promise<NursingAppointment[]>
   * 
   * Endpoint: GET /nursing/appointments/cancelled
   */
  async getCancelledAppointments(filters?: GetNursingAppointmentsDto): Promise<NursingAppointment[]> {
    try {
      const response = await apiClient.get<NursingAppointmentResponse>('/nursing/appointments/cancelled', {
        params: filters
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cancelled nursing appointments:', error);
      throw error;
    }
  },

  /**
   * Get all nursing appointments for a specific patient by patient ID
   * 
   * @param patientId Patient ID
   * @returns Promise<NursingAppointment[]>
   * 
   * Endpoint: GET /nursing/appointments/patient/:patientId
   */
  async getAppointmentsByPatientId(patientId: number): Promise<NursingAppointment[]> {
    try {
      const response = await apiClient.get<NursingAppointmentResponse>(
        `/nursing/appointments/patient/${patientId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient nursing appointments by ID:', error);
      throw error;
    }
  },

  /**
   * Get all nursing appointments for a specific patient by identification
   * 
   * @param identification Patient identification number
   * @returns Promise<NursingAppointment[]>
   * 
   * Endpoint: GET /nursing/appointments/patient/identification/:identification
   */
  async getAppointmentsByPatientIdentification(identification: string): Promise<NursingAppointment[]> {
    try {
      const response = await apiClient.get<NursingAppointmentResponse>(
        `/nursing/appointments/patient/identification/${identification}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient nursing appointments by identification:', error);
      throw error;
    }
  },

  /**
   * Get nursing records for a specific appointment
   * 
   * @param appointmentId Appointment ID
   * @returns Promise<NursingRecord[]>
   * 
   * Endpoint: GET /nursing/appointments/:id/records
   */
  async getNursingRecordsByAppointment(appointmentId: number): Promise<any[]> {
    try {
      const response = await apiClient.get<NursingRecordsResponse>(
        `/nursing/appointments/${appointmentId}/records`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching nursing records by appointment:', error);
      throw error;
    }
  },

  /**
   * Create a new nursing appointment
   * 
   * @param createDto Appointment data
   * @returns Promise<NursingAppointment>
   * 
   * Endpoint: POST /nursing/appointments
   * Required fields:
   * - saAppointmentDate: ISO datetime string
   * - saAppointmentType: AppointmentType
   * - saPriority: AppointmentPriority
   * - idArea: number (nursing area ID)
   * - idPatient: number
   * - idStaff: number
   * Optional fields:
   * - saNotes: string
   * - saDurationMinutes: number
   */
  async createAppointment(createDto: CreateAppointmentDto): Promise<NursingAppointment> {
    try {
      const response = await apiClient.post<SingleNursingAppointmentResponse>(
        '/nursing/appointments',
        createDto
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating nursing appointment:', error);
      throw error;
    }
  },

  /**
   * Update/Reschedule a nursing appointment
   * 
   * @param id Appointment ID
   * @param updateDto Updated appointment data (partial)
   * @returns Promise<NursingAppointment>
   * 
   * Endpoint: PUT /nursing/appointments/:id
   * Optional fields (all):
   * - saAppointmentDate: ISO datetime string
   * - saAppointmentType: AppointmentType
   * - saPriority: AppointmentPriority
   * - saNotes: string
   * - saObservations: string
   * - saDurationMinutes: number
   * - idStaff: number
   * 
   * Note: Cannot update completed or cancelled appointments
   */
  async updateAppointment(id: number, updateDto: UpdateAppointmentDto): Promise<NursingAppointment> {
    try {
      const response = await apiClient.put<SingleNursingAppointmentResponse>(
        `/nursing/appointments/${id}`,
        updateDto
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating nursing appointment:', error);
      throw error;
    }
  },

  /**
   * Cancel a nursing appointment
   * 
   * @param id Appointment ID
   * @param cancelDto Cancellation data
   * @returns Promise<NursingAppointment>
   * 
   * Endpoint: PATCH /nursing/appointments/:id/cancel
   * Optional fields:
   * - cancellationReason: string
   * 
   * Note: Cannot cancel completed appointments
   */
  async cancelAppointment(id: number, cancelDto: CancelAppointmentDto): Promise<NursingAppointment> {
    try {
      const response = await apiClient.patch<SingleNursingAppointmentResponse>(
        `/nursing/appointments/${id}/cancel`,
        cancelDto
      );
      return response.data.data;
    } catch (error) {
      console.error('Error cancelling nursing appointment:', error);
      throw error;
    }
  },

  /**
   * Complete a nursing appointment and create nursing record
   * 
   * @param id Appointment ID
   * @param completeDto Nursing record data
   * @returns Promise<{ appointment: NursingAppointment; nursingRecord: NursingRecord }>
   * 
   * Endpoint: POST /nursing/appointments/:id/complete
   * Optional fields (all):
   * - nrTemperature: number (30-45)
   * - nrBloodPressure: string (format: XXX/XXX)
   * - nrHeartRate: number (30-250)
   * - nrPainLevel: number (0-10)
   * - nrMobility: Mobility
   * - nrAppetite: QualityLevel
   * - nrSleepQuality: QualityLevel
   * - nrNotes: string
   * 
   * Note: Changes appointment status to 'completed' and creates nursing record
   */
  async completeAppointment(id: number, completeDto: CompleteAppointmentDto): Promise<{
    appointment: NursingAppointment;
    nursingRecord: any;
  }> {
    try {
      const response = await apiClient.post<CompleteAppointmentResponse>(
        `/nursing/appointments/${id}/complete`,
        completeDto
      );
      return response.data.data;
    } catch (error) {
      console.error('Error completing nursing appointment:', error);
      throw error;
    }
  }
};