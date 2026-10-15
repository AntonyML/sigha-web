import { describe, it, expect } from 'vitest';
import {
  transformVirtualFileToApiPayload,
  defaultVirtualFile,
  mapApiToVirtualFile,
} from './virtualFile';
import type { VirtualFile } from './virtualFile';

describe('virtualFile payload transformations and validations', () => {
  it('does not send empty string for optional email and phone (prevents class-validator 400)', () => {
    const file: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      email: '',
      telefono: '',
    };

    const payload = transformVirtualFileToApiPayload(file);

    expect(payload.oa_email).toBeUndefined();
    expect(payload.oa_phone_numner).toBeUndefined();
  });

  it('sends trimmed email and phone when provided', () => {
    const file: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      email: ' juan@example.com ',
      telefono: ' 8888-8888 ',
    };

    const payload = transformVirtualFileToApiPayload(file);

    expect(payload.oa_email).toBe('juan@example.com');
    expect(payload.oa_phone_numner).toBe('8888-8888');
  });

  it('maps otroTrabajoDescripcion to oa_other_description when trabajoPrevio is otros', () => {
    const file: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      trabajoPrevio: 'otros',
      otroTrabajoDescripcion: 'Venta de frutas y verduras',
    };

    const payload = transformVirtualFileToApiPayload(file);

    expect(payload.oa_other).toBe(true);
    expect(payload.oa_other_description).toBe('Venta de frutas y verduras');
    expect(payload.oa_previous_work).toBe('Venta de frutas y verduras');
    expect(payload.oa_is_retired).toBe(false);
    expect(payload.oa_has_pension).toBe(false);
  });

  it('sets oa_other false and oa_other_description null when trabajoPrevio is jubilacion or pension', () => {
    const file: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      trabajoPrevio: 'jubilacion',
    };

    const payload = transformVirtualFileToApiPayload(file);

    expect(payload.oa_other).toBe(false);
    expect(payload.oa_other_description).toBeNull();
    expect(payload.oa_is_retired).toBe(true);
    expect(payload.oa_has_pension).toBe(false);
  });

  it('sanitizes dwelling to undefined if not in allowed backend enum list', () => {
    const file: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      vivienda: '',
    };

    const payload = transformVirtualFileToApiPayload(file);
    expect(payload.oa_dwelling).toBeUndefined();

    const fileValid: VirtualFile = {
      ...file,
      vivienda: 'Propia',
    };
    const payloadValid = transformVirtualFileToApiPayload(fileValid);
    expect(payloadValid.oa_dwelling).toBe('Propia');
  });

  it('handles neoplasias description correctly when indicated', () => {
    const fileWithNeo: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      neoplasias: true,
      neoplasiasDetalle: 'Carcinoma basocelular tratado',
    };

    const payload = transformVirtualFileToApiPayload(fileWithNeo);
    expect(payload.clinical_history.ch_neoplasms).toBe(true);
    expect(payload.clinical_history.ch_neoplasms_description).toBe('Carcinoma basocelular tratado');

    const fileWithoutNeo: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      neoplasias: false,
    };
    const payloadWithout = transformVirtualFileToApiPayload(fileWithoutNeo);
    expect(payloadWithout.clinical_history.ch_neoplasms).toBe(false);
    expect(payloadWithout.clinical_history.ch_neoplasms_description).toBeNull();
  });

  it('validates and formats blood pressure or defaults to 120/80', () => {
    const fileValidTa: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      ta: '130/85',
    };
    expect(transformVirtualFileToApiPayload(fileValidTa).clinical_history.ch_blood_pressure).toBe('130/85');

    const fileInvalidTa: VirtualFile = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      ta: '130/',
    };
    expect(transformVirtualFileToApiPayload(fileInvalidTa).clinical_history.ch_blood_pressure).toBe('120/80');
  });

  it('mapApiToVirtualFile maps oaOtherDescription to otroTrabajoDescripcion', () => {
    const rawApi = {
      id: 99,
      oaIdentification: '1-1111-1111',
      oaName: 'Juan',
      oaFLastName: 'Perez',
      oaOther: true,
      oaOtherDescription: 'Artesanías en madera',
    };

    const mapped = mapApiToVirtualFile(rawApi);
    expect(mapped.trabajoPrevio).toBe('otros');
    expect(mapped.otroTrabajoDescripcion).toBe('Artesanías en madera');
  });
});
