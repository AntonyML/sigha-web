import axios from 'axios';
import type { Patient, Appointment, AppointmentApiPayload, AppointmentStatus } from '../types/nursing';
import { config } from '../config/app.config';
import { navigateTo } from '../utils/navigationUtils';

const API_URL = config.api.baseUrl; //CONFIGURAR URL JONA

/**
 * Axios instance configured for nursing API calls
 */
const apiClient = axios.create({
  baseURL: `${API_URL}/api/nursing`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
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
  
  async getAllPatients(): Promise<Patient[]> {
    try {
      const response = await apiClient.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      return this.getMockPatients();
    }
  },

  async getPatientById(id: number): Promise<Patient> {
    try {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      const mockPatients = this.getMockPatients();
      const patient = mockPatients.find(p => p.id === id);
      if (!patient) {
        throw new Error(`Patient with ID ${id} not found`);
      }
      return patient;
    }
  },



  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const response = await apiClient.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return this.getMockAppointments();
    }
  },


  async getPendingAppointments(): Promise<Appointment[]> {
    try {
      const response = await apiClient.get('/appointments/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      const allAppointments = this.getMockAppointments();
      return allAppointments
        .filter(apt => apt.status === 'pending')
        .sort((a, b) => new Date(a.scheduledDate + 'T' + a.scheduledTime).getTime() - 
                       new Date(b.scheduledDate + 'T' + b.scheduledTime).getTime());
    }
  },


  async getAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    try {
      const response = await apiClient.get(`/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      const allAppointments = this.getMockAppointments();
      return allAppointments.filter(apt => apt.patientId === patientId);
    }
  },

  async createAppointment(appointmentData: AppointmentApiPayload): Promise<Appointment> {
    try {
      const response = await apiClient.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async updateAppointment(id: number, updateData: Partial<Appointment>): Promise<Appointment> {
    try {
      const response = await apiClient.put(`/appointments/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },


  async completeAppointment(id: number, completionData: any): Promise<Appointment> {
    try {
      const response = await apiClient.put(`/appointments/${id}/complete`, completionData);
      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  },

  async cancelAppointment(id: number, reason?: string): Promise<Appointment> {
    try {
      const response = await apiClient.put(`/appointments/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

//Eliminar los datos quemados 
  getMockPatients(): Patient[] {
    return [
      {
        id: 1,
        identification: '12345678',
        name: 'María',
        firstLastName: 'González',
        secondLastName: 'Pérez',
        birthDate: '1945-03-15',
        age: 79,
        phone: '2234-5678',
        emergencyContact: 'Juan González - 8765-4321',
        medicalConditions: 'Hipertensión, Diabetes',
        allergies: 'Penicilina',
        createAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        identification: '87654321',
        name: 'José',
        firstLastName: 'Rodríguez',
        secondLastName: 'López',
        birthDate: '1938-07-22',
        age: 86,
        phone: '2345-6789',
        emergencyContact: 'Ana López - 9876-5432',
        medicalConditions: 'Artritis, Problemas cardíacos',
        allergies: 'Ninguna conocida',
        createAt: '2024-01-20T14:30:00Z'
      },
      {
        id: 3,
        identification: '11223344',
        name: 'Carmen',
        firstLastName: 'Jiménez',
        secondLastName: 'Morales',
        birthDate: '1950-12-03',
        age: 73,
        phone: '2456-7890',
        emergencyContact: 'Luis Jiménez - 7890-1234',
        medicalConditions: 'Osteoporosis',
        allergies: 'Aspirina',
        createAt: '2024-02-01T09:15:00Z'
      }
    ];
  },

  getMockAppointments(): Appointment[] {
    const patients = this.getMockPatients();
    return [
      {
        id: 1,
        patientId: 1,
        patient: patients[0],
        appointmentType: 'consultation',
        scheduledDate: '2024-11-15',
        scheduledTime: '09:00',
        status: 'pending',
        reason: 'Control de presión arterial',
        notes: 'Paciente reporta mareos ocasionales',
        createAt: '2024-11-14T10:00:00Z'
      },
      {
        id: 2,
        patientId: 2,
        patient: patients[1],
        appointmentType: 'medication',
        scheduledDate: '2024-11-15',
        scheduledTime: '10:30',
        status: 'pending',
        reason: 'Administración de medicamento para el corazón',
        createAt: '2024-11-14T11:00:00Z'
      },
      {
        id: 3,
        patientId: 3,
        patient: patients[2],
        appointmentType: 'vital_signs',
        scheduledDate: '2024-11-16',
        scheduledTime: '14:00',
        status: 'pending',
        reason: 'Toma de signos vitales rutinaria',
        createAt: '2024-11-14T12:00:00Z'
      },
      {
        id: 4,
        patientId: 1,
        patient: patients[0],
        appointmentType: 'consultation',
        scheduledDate: '2024-11-10',
        scheduledTime: '15:00',
        status: 'completed',
        reason: 'Revisión general',
        diagnosis: 'Presión arterial controlada',
        nurseNotes: 'Paciente en buen estado general',
        vitalSigns: {
          bloodPressure: '120/80',
          heartRate: 72,
          temperature: 36.5,
          weight: 65,
          height: 160
        },
        createAt: '2024-11-09T10:00:00Z',
        updatedAt: '2024-11-10T15:30:00Z'
      }
    ];
  }
};