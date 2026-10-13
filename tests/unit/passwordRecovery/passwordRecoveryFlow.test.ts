import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/infrastructure/api/services/authService', () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

import { passwordRecoveryFlow } from '@/modules/auth/application/flows/passwordRecovery/passwordRecoveryFlow';
import { authService } from '@/infrastructure/api/services/authService';

const mockedForgotPassword = vi.mocked(authService.forgotPassword);
const mockedResetPassword = vi.mocked(authService.resetPassword);

describe('passwordRecoveryFlow.requestRecovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('rechaza un email inválido sin llamar a la API', async () => {
    const result = await passwordRecoveryFlow.requestRecovery('correo-invalido');

    expect(result.success).toBe(false);
    expect(result.error).toBe('El email no tiene un formato válido.');
    expect(mockedForgotPassword).not.toHaveBeenCalled();
  });

  it('guarda el email en sesión y devuelve éxito cuando la API responde', async () => {
    mockedForgotPassword.mockResolvedValue({ message: 'Código de recuperación enviado al email' });

    const result = await passwordRecoveryFlow.requestRecovery('valido@ejemplo.com');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Código de recuperación enviado al email');
    expect(mockedForgotPassword).toHaveBeenCalledWith('valido@ejemplo.com');
    expect(sessionStorage.getItem('recovery_email')).toBe('valido@ejemplo.com');
  });

  it('mapea los errores de la API a un mensaje amigable', async () => {
    mockedForgotPassword.mockRejectedValue({
      response: { data: { message: 'Error del servidor. Inténtalo más tarde.' } },
    });

    const result = await passwordRecoveryFlow.requestRecovery('valido@ejemplo.com');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Error del servidor. Inténtalo más tarde.');
  });
});

describe('passwordRecoveryFlow.validateRecoveryCodeFormat', () => {
  it('rechaza un código vacío', async () => {
    const result = await passwordRecoveryFlow.validateRecoveryCodeFormat('');

    expect(result.success).toBe(false);
    expect(result.error).toBe('El código de recuperación es requerido.');
  });

  it('rechaza un código que no tiene exactamente 8 dígitos', async () => {
    expect((await passwordRecoveryFlow.validateRecoveryCodeFormat('1234567')).error).toBe(
      'El código debe tener 8 dígitos.',
    );
    expect((await passwordRecoveryFlow.validateRecoveryCodeFormat('abcdefgh')).error).toBe(
      'El código debe tener 8 dígitos.',
    );
  });

  it('normaliza espacios y devuelve el token limpio', async () => {
    const result = await passwordRecoveryFlow.validateRecoveryCodeFormat('1234 5678');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Formato de código válido.');
    expect(result.cleanToken).toBe('12345678');
  });
});

describe('passwordRecoveryFlow.resetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('exige verificar el código antes de cambiar la contraseña', async () => {
    const result = await passwordRecoveryFlow.resetPassword('NuevaPassword1!', 'NuevaPassword1!');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Debes verificar el código de recuperación primero.');
    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it('valida la contraseña antes de llamar a la API', async () => {
    sessionStorage.setItem('recovery_token', '12345678');

    const result = await passwordRecoveryFlow.resetPassword('corta', 'corta');

    expect(result.success).toBe(false);
    expect(result.error).toBe('La contraseña debe tener al menos 8 caracteres.');
    expect(mockedResetPassword).not.toHaveBeenCalled();
  });

  it('cambia la contraseña y limpia los datos de recuperación', async () => {
    sessionStorage.setItem('recovery_email', 'valido@ejemplo.com');
    sessionStorage.setItem('recovery_token', '12345678');
    mockedResetPassword.mockResolvedValue({ message: 'Contraseña actualizada exitosamente' });

    const result = await passwordRecoveryFlow.resetPassword('NuevaPassword1!', 'NuevaPassword1!');

    expect(result.success).toBe(true);
    expect(result.message).toBe('Contraseña actualizada exitosamente');
    expect(mockedResetPassword).toHaveBeenCalledWith('12345678', 'NuevaPassword1!');
    expect(sessionStorage.getItem('recovery_email')).toBeNull();
    expect(sessionStorage.getItem('recovery_token')).toBeNull();
  });

  it('mapea los errores de la API a un mensaje amigable', async () => {
    sessionStorage.setItem('recovery_token', '12345678');
    mockedResetPassword.mockRejectedValue({
      response: { data: { message: 'Token inválido o expirado' } },
    });

    const result = await passwordRecoveryFlow.resetPassword('NuevaPassword1!', 'NuevaPassword1!');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Token inválido o expirado');
  });
});
