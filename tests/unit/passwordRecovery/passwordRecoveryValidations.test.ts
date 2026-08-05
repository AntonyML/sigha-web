import { describe, it, expect } from 'vitest';
import {
  getPasswordRecoveryErrorMessage,
  validatePasswordRecoveryRequest,
  validatePasswordResetRequest,
} from '../../../src/infrastructure/flows/passwordRecovery/validation/passwordRecoveryValidations';

describe('validatePasswordRecoveryRequest', () => {
  it('rechaza emails vacíos o no string', () => {
    expect(validatePasswordRecoveryRequest(undefined as unknown as string)).toBe('El email es requerido.');
    expect(validatePasswordRecoveryRequest('')).toBe('El email es requerido.');
    expect(validatePasswordRecoveryRequest('   ')).toBe('El email no puede estar vacío.');
  });

  it('rechaza emails con formato inválido', () => {
    expect(validatePasswordRecoveryRequest('correo-sin-formato')).toBe('El email no tiene un formato válido.');
    expect(validatePasswordRecoveryRequest('usuario@dominio')).toBe('El email no tiene un formato válido.');
    expect(validatePasswordRecoveryRequest('usuario@@dominio.com')).toBe('El email no tiene un formato válido.');
  });

  it('acepta emails válidos (ignorando espacios)', () => {
    expect(validatePasswordRecoveryRequest('valido@ejemplo.com')).toBeNull();
    expect(validatePasswordRecoveryRequest('  valido@ejemplo.com  ')).toBeNull();
  });
});

describe('validatePasswordResetRequest', () => {
  it('rechaza contraseñas ausentes', () => {
    expect(validatePasswordResetRequest(undefined as unknown as string, 'x')).toBe(
      'La nueva contraseña es requerida.',
    );
    expect(validatePasswordResetRequest('x', undefined as unknown as string)).toBe(
      'La confirmación de contraseña es requerida.',
    );
    expect(validatePasswordResetRequest('   ', '   ')).toBe('La nueva contraseña no puede estar vacía.');
  });

  it('rechaza contraseñas cortas', () => {
    expect(validatePasswordResetRequest('Corta1!', 'Corta1!')).toBe('La contraseña debe tener al menos 8 caracteres.');
  });

  it('exige mayúscula, minúscula, número y carácter especial', () => {
    expect(validatePasswordResetRequest('password123!', 'password123!')).toBe(
      'La contraseña debe contener al menos una letra mayúscula.',
    );
    expect(validatePasswordResetRequest('PASSWORD123!', 'PASSWORD123!')).toBe(
      'La contraseña debe contener al menos una letra minúscula.',
    );
    expect(validatePasswordResetRequest('Password!', 'Password!')).toBe(
      'La contraseña debe contener al menos un número.',
    );
    expect(validatePasswordResetRequest('Password123', 'Password123')).toBe(
      'La contraseña debe contener al menos un carácter especial.',
    );
  });

  it('rechaza contraseñas que no coinciden', () => {
    expect(validatePasswordResetRequest('Password123!', 'Password123?')).toBe('Las contraseñas no coinciden.');
  });

  it('acepta una contraseña que cumple todos los requisitos', () => {
    expect(validatePasswordResetRequest('Password123!', 'Password123!')).toBeNull();
  });
});

describe('getPasswordRecoveryErrorMessage', () => {
  it('prioriza el mensaje devuelto por la API', () => {
    expect(
      getPasswordRecoveryErrorMessage({ response: { data: { message: 'Token inválido o expirado' } } }),
    ).toBe('Token inválido o expirado');
  });

  it('mapea códigos de estado conocidos', () => {
    expect(getPasswordRecoveryErrorMessage({ response: { status: 404 } })).toBe('Usuario no encontrado.');
    expect(getPasswordRecoveryErrorMessage({ response: { status: 429 } })).toBe(
      'Demasiados intentos. Inténtalo más tarde.',
    );
    expect(getPasswordRecoveryErrorMessage({ response: { status: 500 } })).toBe(
      'Error del servidor. Inténtalo más tarde.',
    );
  });

  it('usa el mensaje del error o uno genérico como fallback', () => {
    expect(getPasswordRecoveryErrorMessage({ message: 'Algo salió mal' })).toBe('Algo salió mal');
    expect(getPasswordRecoveryErrorMessage({})).toBe('Error inesperado en la recuperación de contraseña.');
    expect(getPasswordRecoveryErrorMessage(null)).toBe('Error inesperado en la recuperación de contraseña.');
  });
});
