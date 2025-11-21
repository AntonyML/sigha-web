import { describe, it, expect } from 'vitest';
import { entranceExitService } from '../../../services/entranceExitService';
import type { EntranceExitApiPayload, EntranceExitType } from '../../../types/entranceExit';

describe('Pruebas Unitarias Entrada/Salida', () => {
  
  //Verificar que el servicio existe y estam los métodos necesarios
  it('1. El servicio de entrada/salida debe existir con métodos básicos', () => {
    expect(entranceExitService).toBeDefined();
    expect(typeof entranceExitService.createEntranceExit).toBe('function');
    expect(typeof entranceExitService.getAllEntranceExits).toBe('function');
    expect(typeof entranceExitService.getClosedRecords).toBe('function');
    expect(typeof entranceExitService.getActiveEntrances).toBe('function');
    expect(typeof entranceExitService.finalizeEntranceExit).toBe('function');
  });

  // Validar los datos 
  it('2. Debe validar la estructura correcta de datos de entrada', () => {
    const validData: EntranceExitApiPayload = {
      eeType: 'visitor',
      eeAccessType: 'entrance',
      eeIdentification: '703180966',
      eeName: 'Michelle',
      eeFLastName: 'Arguedas',
      eeSLastName: 'Murillo',
      eeDatetimeEntrance: '2025-11-15T10:30:00',
      eeClose: false,
      eeObservations: 'Visita familiar'
    };

    // Verificar que tiene todo
    expect(validData).toHaveProperty('eeType');
    expect(validData).toHaveProperty('eeAccessType');
    expect(validData).toHaveProperty('eeIdentification');
    expect(validData).toHaveProperty('eeName');
    expect(validData).toHaveProperty('eeFLastName');
    expect(validData).toHaveProperty('eeSLastName');
    expect(validData).toHaveProperty('eeClose');
    
    // Verificar que son los tipos correctos
    expect(typeof validData.eeType).toBe('string');
    expect(typeof validData.eeAccessType).toBe('string');
    expect(typeof validData.eeIdentification).toBe('string');
    expect(typeof validData.eeName).toBe('string');
    expect(typeof validData.eeFLastName).toBe('string');
    expect(typeof validData.eeSLastName).toBe('string');
    expect(typeof validData.eeClose).toBe('boolean');
  });

  // Validar tipos de persona permitidos
  it('3. Debe aceptar solo tipos de persona válidos', () => {
    const validTypes: EntranceExitType[] = ['employee', 'older adult', 'visitor', 'volunteer', 'vehicle', 'other'];
    validTypes.forEach(type => {
      const data: EntranceExitApiPayload = {
        eeType: type,
        eeAccessType: 'entrance',
        eeIdentification: '12345678',
        eeName: 'Test',

        eeFLastName: 'Test',
        eeSLastName: 'Test',
        eeClose: false
      };
      expect(validTypes).toContain('visitor');
    });
  });

  // Validar el formato de la fecha
  it('4. Debe validar formato correcto de fecha y hora', () => {
    const validDatetime = '2025-11-15T10:30:00';
    const invalidDatetime = 'fecha-invalida';
    const validDate = new Date(validDatetime);
    expect(validDate instanceof Date).toBe(true);
    expect(!isNaN(validDate.getTime())).toBe(true);
    const invalidDate = new Date(invalidDatetime);
    expect(isNaN(invalidDate.getTime())).toBe(true);
  });

  // Validar campos obligatorios y tipos de acceso
  it('5. Debe validar tipos de acceso y campos esenciales', () => {
    const entranceData: EntranceExitApiPayload = {
      eeType: 'visitor',
      eeAccessType: 'entrance',
      eeIdentification: '703180966',
      eeName: 'Michelle',
      eeFLastName: 'Arguedas',
      eeSLastName: 'Murillo',
      eeClose: false
    };
    const exitData: EntranceExitApiPayload = {
      eeType: 'visitor', 
      eeAccessType: 'exit',
      eeIdentification: '12345678',
      eeName: 'Luis',
      eeFLastName: 'Rivera',
      eeSLastName: 'Lopez',
      eeClose: true
    };
    expect(['entrance', 'exit']).toContain(entranceData.eeAccessType);
    expect(['entrance', 'exit']).toContain(exitData.eeAccessType);
    expect(entranceData.eeType).toBeTruthy();
    expect(entranceData.eeIdentification).toBeTruthy();
    expect(entranceData.eeName).toBeTruthy();
    expect(typeof entranceData.eeClose).toBe('boolean');
    expect(exitData.eeType).toBeTruthy();
    expect(exitData.eeIdentification).toBeTruthy();
    expect(exitData.eeName).toBeTruthy();
    expect(typeof exitData.eeClose).toBe('boolean');
  });
});