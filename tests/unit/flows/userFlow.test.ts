import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { userFlow } from '../../../src/infrastructure/flows/userFlow'
import * as userServiceModule from '../../../src/services/userService'
import type { User, UpdateUserData, UserChangePasswordData } from '../../../src/types/user'

// Mock del userService
vi.mock('../../../src/services/userService', () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changeUserPassword: vi.fn()
  }
}))

const mockUserService = vi.mocked(userServiceModule.userService)

describe('userFlow', () => {
  const mockUser: User = {
    id: 1,
    uIdentification: '123456789',
    uName: 'Juan',
    uFLastName: 'Pérez',
    uSLastName: 'Gómez',
    uEmail: 'juan.perez@hospital.com',
    uEmailVerified: true,
    uIsActive: true,
    createAt: '2024-01-01T00:00:00.000Z',
    roleId: 3,
    role: {
      id: 3,
      rName: 'Enfermera',
      rDescription: 'Personal de enfermería'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('debería retornar éxito cuando obtiene el perfil correctamente', async () => {
      mockUserService.getProfile.mockResolvedValueOnce(mockUser)

      const result = await userFlow.getProfile()

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeUndefined()
      expect(mockUserService.getProfile).toHaveBeenCalledTimes(1)
    })

    it('debería manejar error 401 (no autenticado)', async () => {
      const error = {
        response: { status: 401 },
        message: 'Unauthorized'
      }
      mockUserService.getProfile.mockRejectedValueOnce(error)

      const result = await userFlow.getProfile()

      expect(result.success).toBe(false)
      expect(result.user).toBeUndefined()
      expect(result.error).toBe('No estás autenticado. Por favor inicia sesión.')
    })

    it('debería manejar error 403 (sin permisos)', async () => {
      const error = {
        response: { status: 403 },
        message: 'Forbidden'
      }
      mockUserService.getProfile.mockRejectedValueOnce(error)

      const result = await userFlow.getProfile()

      expect(result.success).toBe(false)
      expect(result.error).toBe('No tienes permisos para acceder a tu perfil.')
    })

    it('debería manejar error 404 (usuario no encontrado)', async () => {
      const error = {
        response: { status: 404 },
        message: 'Not Found'
      }
      mockUserService.getProfile.mockRejectedValueOnce(error)

      const result = await userFlow.getProfile()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Tu perfil no fue encontrado.')
    })

    it('debería manejar errores genéricos', async () => {
      const error = new Error('Network Error')
      mockUserService.getProfile.mockRejectedValueOnce(error)

      const result = await userFlow.getProfile()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Error al obtener tu perfil. Inténtalo nuevamente.')
    })

    it('debería loggear errores en consola', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test Error')
      mockUserService.getProfile.mockRejectedValueOnce(error)

      await userFlow.getProfile()

      expect(consoleSpy).toHaveBeenCalledWith('Error en userFlow.getProfile:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('updateProfile', () => {
    const validData: Partial<UpdateUserData> = {
      uName: 'Juan Carlos',
      uFLastName: 'Pérez',
      uSLastName: 'Gómez'
    }

    const updatedUser = { ...mockUser, ...validData }

    it('debería actualizar el perfil correctamente con datos válidos', async () => {
      mockUserService.updateProfile.mockResolvedValueOnce(updatedUser)

      const result = await userFlow.updateProfile(validData)

      expect(result.success).toBe(true)
      expect(result.user).toEqual(updatedUser)
      expect(result.error).toBeUndefined()
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(validData)
    })

    it('debería rechazar cuando uName está vacío', async () => {
      const invalidData = { ...validData, uName: '' }

      const result = await userFlow.updateProfile(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('El nombre es obligatorio.')
      expect(mockUserService.updateProfile).not.toHaveBeenCalled()
    })

    it('debería rechazar cuando uFLastName está vacío', async () => {
      const invalidData = { ...validData, uFLastName: '' }

      const result = await userFlow.updateProfile(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('El primer apellido es obligatorio.')
      expect(mockUserService.updateProfile).not.toHaveBeenCalled()
    })

    it('debería manejar errores de validación del backend (400)', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: ['uName debe ser una cadena de texto', 'uFLastName es requerido']
          }
        }
      }
      mockUserService.updateProfile.mockRejectedValueOnce(error)

      const result = await userFlow.updateProfile(validData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('uName debe ser una cadena de texto, uFLastName es requerido')
    })

    it('debería manejar error 409 (conflicto)', async () => {
      const error = {
        response: { status: 409 }
      }
      mockUserService.updateProfile.mockRejectedValueOnce(error)

      const result = await userFlow.updateProfile(validData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Ya existe un usuario con esos datos.')
    })
  })

  describe('changePassword', () => {
    const validPasswordData: UserChangePasswordData = {
      currentPassword: 'oldPassword123',
      newPassword: 'NewPassword123'
    }

    it('debería cambiar la contraseña correctamente', async () => {
      mockUserService.changeUserPassword.mockResolvedValueOnce(undefined)

      const result = await userFlow.changePassword(validPasswordData)

      expect(result.success).toBe(true)
      expect(result.message).toBe('Contraseña cambiada exitosamente.')
      expect(result.error).toBeUndefined()
      expect(mockUserService.changeUserPassword).toHaveBeenCalledWith(validPasswordData)
    })

    it('debería rechazar cuando currentPassword está vacío', async () => {
      const invalidData = { ...validPasswordData, currentPassword: '' }

      const result = await userFlow.changePassword(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('La contraseña actual es obligatoria.')
      expect(mockUserService.changeUserPassword).not.toHaveBeenCalled()
    })

    it('debería rechazar cuando newPassword está vacío', async () => {
      const invalidData = { ...validPasswordData, newPassword: '' }

      const result = await userFlow.changePassword(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('La nueva contraseña es obligatoria.')
      expect(mockUserService.changeUserPassword).not.toHaveBeenCalled()
    })

    it('debería rechazar cuando newPassword tiene menos de 8 caracteres', async () => {
      const invalidData = { ...validPasswordData, newPassword: '1234567' }

      const result = await userFlow.changePassword(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('La nueva contraseña debe tener al menos 8 caracteres.')
      expect(mockUserService.changeUserPassword).not.toHaveBeenCalled()
    })

    it('debería rechazar cuando newPassword no tiene complejidad suficiente', async () => {
      const invalidData = { ...validPasswordData, newPassword: 'password123' } // Solo minúsculas y números

      const result = await userFlow.changePassword(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('La contraseña debe contener al menos una mayúscula, una minúscula y un número.')
      expect(mockUserService.changeUserPassword).not.toHaveBeenCalled()
    })

    it('debería rechazar cuando newPassword es igual a currentPassword', async () => {
      const invalidData = {
        currentPassword: 'samePassword123',
        newPassword: 'samePassword123'
      }

      const result = await userFlow.changePassword(invalidData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('La nueva contraseña debe ser diferente a la actual.')
      expect(mockUserService.changeUserPassword).not.toHaveBeenCalled()
    })

    it('debería manejar error 400 (contraseña actual incorrecta)', async () => {
      const error = {
        response: { status: 400 }
      }
      mockUserService.changeUserPassword.mockRejectedValueOnce(error)

      const result = await userFlow.changePassword(validPasswordData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('La contraseña actual es incorrecta.')
    })

    it('debería manejar error 422 (contraseña no diferente)', async () => {
      const error = {
        response: { status: 422 }
      }
      mockUserService.changeUserPassword.mockRejectedValueOnce(error)

      const result = await userFlow.changePassword(validPasswordData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('La nueva contraseña debe ser diferente a la actual.')
    })

    it('debería manejar errores de autenticación (401)', async () => {
      const error = {
        response: { status: 401 }
      }
      mockUserService.changeUserPassword.mockRejectedValueOnce(error)

      const result = await userFlow.changePassword(validPasswordData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No estás autenticado. Por favor inicia sesión.')
    })

    it('debería manejar errores de permisos (403)', async () => {
      const error = {
        response: { status: 403 }
      }
      mockUserService.changeUserPassword.mockRejectedValueOnce(error)

      const result = await userFlow.changePassword(validPasswordData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('No tienes permisos para cambiar tu contraseña.')
    })
  })
})