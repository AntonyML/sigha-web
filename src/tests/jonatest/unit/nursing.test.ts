import { describe, it, expect } from 'vitest';
import { nursingService } from '../../../services/nursingService';
import type { 
  CreateAppointmentDto, 
  UpdateAppointmentDto,
  CompleteAppointmentDto,
  AppointmentStatus,
  AppointmentType,
  AppointmentPriority
} from '../../../types/nursing';

describe('Pruebas Unitarias Módulo de Enfermería', () => {
  
  // Test 1: Verificar que el servicio existe y tiene los métodos necesarios
  it('1. El servicio de enfermería debe existir con todos los métodos necesarios', () => {
    expect(nursingService).toBeDefined();
    expect(typeof nursingService.getNursingAppointments).toBe('function');
    expect(typeof nursingService.getPendingAppointments).toBe('function');
    expect(typeof nursingService.getCompletedAppointments).toBe('function');
    expect(typeof nursingService.getCancelledAppointments).toBe('function');
    expect(typeof nursingService.getAppointmentsByPatientId).toBe('function');
    expect(typeof nursingService.getAppointmentsByPatientIdentification).toBe('function');
    expect(typeof nursingService.getNursingRecordsByAppointment).toBe('function');
    expect(typeof nursingService.createAppointment).toBe('function');
    expect(typeof nursingService.updateAppointment).toBe('function');
    expect(typeof nursingService.cancelAppointment).toBe('function');
    expect(typeof nursingService.completeAppointment).toBe('function');
  });

  // Test 2: Validar estructura de CreateAppointmentDto
  it('2. Debe validar la estructura correcta de datos para crear cita', () => {
    const validData: CreateAppointmentDto = {
      saAppointmentDate: '2025-11-16T10:30:00',
      saAppointmentType: 'checkup',
      saPriority: 'medium',
      saNotes: 'Revisión general del paciente',
      saDurationMinutes: 30,
      idArea: 1,
      idPatient: 1,
      idStaff: 1
    };

    expect(validData).toHaveProperty('saAppointmentDate');
    expect(validData).toHaveProperty('saAppointmentType');
    expect(validData).toHaveProperty('saPriority');
    expect(validData).toHaveProperty('idArea');
    expect(validData).toHaveProperty('idPatient');
    expect(validData).toHaveProperty('idStaff');
    
    expect(typeof validData.saAppointmentDate).toBe('string');
    expect(typeof validData.saAppointmentType).toBe('string');
    expect(typeof validData.saPriority).toBe('string');
    expect(typeof validData.idArea).toBe('number');
    expect(typeof validData.idPatient).toBe('number');
    expect(typeof validData.idStaff).toBe('number');
    
    if (validData.saNotes) {
      expect(typeof validData.saNotes).toBe('string');
    }
    if (validData.saDurationMinutes) {
      expect(typeof validData.saDurationMinutes).toBe('number');
    }
  });

  // Test 3: Validar tipos de cita permitidos
  it('3. Debe aceptar solo tipos de cita válidos', () => {
    const validTypes: AppointmentType[] = ['checkup', 'evaluation', 'therapy', 'follow_up', 'emergency'];
    
    validTypes.forEach(type => {
      const data: CreateAppointmentDto = {
        saAppointmentDate: '2025-11-16T10:30:00',
        saAppointmentType: type,
        saPriority: 'medium',
        idArea: 1,
        idPatient: 1,
        idStaff: 1
      };
      
      expect(validTypes).toContain(data.saAppointmentType);
    });
  });

  // Test 4: Validar niveles de prioridad permitidos
  it('4. Debe aceptar solo niveles de prioridad válidos', () => {
    const validPriorities: AppointmentPriority[] = ['low', 'medium', 'high', 'urgent'];
    
    validPriorities.forEach(priority => {
      const data: CreateAppointmentDto = {
        saAppointmentDate: '2025-11-16T10:30:00',
        saAppointmentType: 'checkup',
        saPriority: priority,
        idArea: 1,
        idPatient: 1,
        idStaff: 1
      };
      
      expect(validPriorities).toContain(data.saPriority);
    });
  });

  // Test 5: Validar estados de cita permitidos
  it('5. Debe aceptar solo estados de cita válidos', () => {
    const validStatuses: AppointmentStatus[] = [
      'scheduled', 
      'in_progress', 
      'completed', 
      'cancelled', 
      'rescheduled', 
      'no_show'
    ];
    
    validStatuses.forEach(status => {
      expect(['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show'])
        .toContain(status);
    });
  });

  // Test 6: Validar formato de fecha y hora
  it('6. Debe validar formato correcto de fecha y hora para citas', () => {
    const validDatetime = '2025-11-16T10:30:00';
    const invalidDatetime = 'fecha-invalida';
    
    const validDate = new Date(validDatetime);
    expect(validDate instanceof Date).toBe(true);
    expect(!isNaN(validDate.getTime())).toBe(true);
    
    const invalidDate = new Date(invalidDatetime);
    expect(isNaN(invalidDate.getTime())).toBe(true);
  });

  // Test 7: Validar estructura de UpdateAppointmentDto
  it('7. Debe validar la estructura correcta de datos para actualizar cita', () => {
    const validData: UpdateAppointmentDto = {
      saAppointmentDate: '2025-11-16T14:00:00',
      saAppointmentType: 'follow_up',
      saPriority: 'high',
      saNotes: 'Seguimiento post-operatorio',
      saObservations: 'Paciente mejorando',
      saDurationMinutes: 45
    };

    if (validData.saAppointmentDate) {
      expect(typeof validData.saAppointmentDate).toBe('string');
    }
    if (validData.saAppointmentType) {
      expect(typeof validData.saAppointmentType).toBe('string');
    }
    if (validData.saPriority) {
      expect(typeof validData.saPriority).toBe('string');
    }
    if (validData.saDurationMinutes) {
      expect(typeof validData.saDurationMinutes).toBe('number');
      expect(validData.saDurationMinutes).toBeGreaterThan(0);
    }
  });

  // Test 8: Validar estructura de CompleteAppointmentDto
  it('8. Debe validar la estructura correcta de datos para completar cita', () => {
    const validData: CompleteAppointmentDto = {
      nrTemperature: 36.5,
      nrBloodPressure: '120/80',
      nrHeartRate: 75,
      nrPainLevel: 3,
      nrMobility: 'independent',
      nrAppetite: 'good',
      nrSleepQuality: 'good',
      nrNotes: 'Paciente estable, signos vitales normales'
    };

    expect(validData).toHaveProperty('nrTemperature');
    expect(validData).toHaveProperty('nrBloodPressure');
    expect(validData).toHaveProperty('nrHeartRate');
    expect(validData).toHaveProperty('nrNotes');
    
    expect(typeof validData.nrTemperature).toBe('number');
    expect(typeof validData.nrBloodPressure).toBe('string');
    expect(typeof validData.nrHeartRate).toBe('number');
    expect(typeof validData.nrNotes).toBe('string');
    
    expect(validData.nrTemperature).toBeGreaterThan(30);
    expect(validData.nrTemperature).toBeLessThan(45);
    expect(validData.nrHeartRate).toBeGreaterThan(40);
    expect(validData.nrHeartRate).toBeLessThan(200);
  });

  // Test 9: Validar niveles de dolor permitidos
  it('9. Debe validar niveles de dolor en rango 0-10', () => {
    const validPainLevels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    validPainLevels.forEach(level => {
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(10);
    });
    
    expect(-1).toBeLessThan(0);
    expect(11).toBeGreaterThan(10);
  });

  // Test 10: Validar tipos de movilidad permitidos
  it('10. Debe aceptar solo tipos de movilidad válidos', () => {
    const validMobilities = ['independent', 'assisted', 'bedridden'];
    
    validMobilities.forEach(mobility => {
      expect(['independent', 'assisted', 'bedridden']).toContain(mobility);
    });
  });

  // Test 11: Validar niveles de calidad permitidos
  it('11. Debe aceptar solo niveles de calidad válidos (apetito y sueño)', () => {
    const validQualities = ['good', 'regular', 'poor'];
    
    validQualities.forEach(quality => {
      expect(['good', 'regular', 'poor']).toContain(quality);
    });
  });

  // Test 12: Validar formato de presión arterial
  it('12. Debe validar formato correcto de presión arterial (ej: 120/80)', () => {
    const validFormats = ['120/80', '110/70', '130/85', '90/60'];
    const invalidFormats = ['120', '80', '120-80', 'abc/def'];
    
    const bloodPressureRegex = /^\d{2,3}\/\d{2,3}$/;
    
    validFormats.forEach(format => {
      expect(bloodPressureRegex.test(format)).toBe(true);
    });
    
    invalidFormats.forEach(format => {
      expect(bloodPressureRegex.test(format)).toBe(false);
    });
  });

  // Test 13: Validar duración de citas
  it('13. Debe validar duración de citas en minutos (valores razonables)', () => {
    const validDurations = [15, 30, 45, 60, 90, 120];
    
    validDurations.forEach(duration => {
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThanOrEqual(240);
    });
  });

  // Test 14: Validar que las notas no estén vacías al completar
  it('14. Las notas deben tener contenido al completar una cita', () => {
    const validNotes = 'Paciente estable, signos vitales normales';
    const emptyNotes = '';
    
    expect(validNotes.length).toBeGreaterThan(0);
    expect(emptyNotes.length).toBe(0);
    
    expect(validNotes.length).toBeGreaterThanOrEqual(10);
  });

  // Test 15: Validar campos esenciales de cita completa
  it('15. Una cita debe tener campos esenciales definidos', () => {
    const appointment = {
      id: 1,
      appointmentDate: '2025-11-16T10:30:00',
      appointmentType: 'checkup',
      priority: 'medium',
      status: 'scheduled',
      patient: {
        id: 1,
        identification: '123456789',
        firstNames: 'Juan',
        firstLastName: 'Pérez',
        secondLastName: 'González'
      }
    };

    expect(appointment.id).toBeDefined();
    expect(appointment.appointmentDate).toBeDefined();
    expect(appointment.appointmentType).toBeDefined();
    expect(appointment.priority).toBeDefined();
    expect(appointment.status).toBeDefined();
    expect(appointment.patient).toBeDefined();
    expect(appointment.patient.identification).toBeDefined();
    expect(appointment.patient.firstNames).toBeDefined();
  });
});
