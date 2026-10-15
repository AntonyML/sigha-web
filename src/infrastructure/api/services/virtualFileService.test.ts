import { describe, it, expect } from 'vitest';
import { virtualFileService } from './virtualFileService';
import { defaultVirtualFile } from '@/shared/types/virtualFile';
import type { ApiFamily } from '@/shared/types/virtualFile';

describe('virtualFileService validation guards', () => {
  const validFamily: ApiFamily = {
    pf_identification: '1-2345-6789',
    pf_name: 'Maria',
    pf_f_last_name: 'Perez',
    pf_s_last_name: 'Gonzalez',
    pf_phone_number: '8888-8888',
    pf_email: 'maria@example.com',
    pf_kinship: 'daughter',
  };

  it('rejects createVirtualFile when other income is indicated without description', async () => {
    const data = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      trabajoPrevio: 'otros',
      otroTrabajoDescripcion: '',
      otrasCondiciones: '',
    };

    await expect(
      virtualFileService.createVirtualFile(data, validFamily)
    ).rejects.toThrow('La descripción de otros ingresos es requerida');
  });

  it('rejects createVirtualFile when email format is invalid', async () => {
    const data = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      email: 'not-an-email',
    };

    await expect(
      virtualFileService.createVirtualFile(data, validFamily)
    ).rejects.toThrow('El formato del correo electrónico del residente es inválido');
  });

  it('rejects createVirtualFile when neoplasias is indicated without detail', async () => {
    const data = {
      ...defaultVirtualFile,
      cedula: '1-1111-1111',
      nombreApellido: 'Juan Perez Gonzalez',
      fechaNacimiento: '1950-01-01',
      neoplasias: true,
      neoplasiasDetalle: '',
    };

    await expect(
      virtualFileService.createVirtualFile(data, validFamily)
    ).rejects.toThrow('El detalle de neoplasias es requerido');
  });
});
