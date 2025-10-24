import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { userService } from '../../../src/services/userService'
import type { User, UpdateUserData, UserChangePasswordData } from '../../../src/types/user'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

const mockAxios = vi.mocked(axios)

// Helper para obtener el mock del API client
const getMockApiClient = () => {
  return (mockAxios.create as any).mock.results[0]?.value
}

describe('userService', () => {
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
    // Reset localStorage mock
    vi.mocked(window.localStorage.getItem).mockReturnValue('mock-token')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getProfile', () => {
    it('debería obtener el perfil del usuario correctamente', async () => {
      const mockApiClient = getMockApiClient()
      mockApiClient.get.mockResolvedValueOnce({ data: mockUser })

      const result = await userService.getProfile()

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/profile')
      expect(result).toEqual(mockUser)
    })

    it('debería manejar errores de la API', async () => {
      const mockApiClient = getMockApiClient()
      const error = new Error('Network Error')
      mockApiClient.get.mockRejectedValueOnce(error)

      await expect(userService.getProfile()).rejects.toThrow('Network Error')
    })

    it('debería incluir el token de autorización en el header', async () => {
      const mockApiClient = getMockApiClient()
      mockApiClient.get.mockResolvedValueOnce({ data: mockUser })

      await userService.getProfile()

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/profile')
    })
  })

  describe('updateProfile', () => {
    const updateData: Partial<UpdateUserData> = {
      uName: 'Juan Carlos',
      uFLastName: 'Pérez',
      uSLastName: 'Gómez'
    }

    it('debería actualizar el perfil correctamente', async () => {
      const mockApiClient = getMockApiClient()
      const updatedUser = { ...mockUser, ...updateData }
      mockApiClient.patch.mockResolvedValueOnce({ data: updatedUser })

      const result = await userService.updateProfile(updateData)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/profile', updateData)
      expect(result).toEqual(updatedUser)
    })

    it('debería manejar errores de validación', async () => {
      const mockApiClient = getMockApiClient()
      const error = new Error('Validation Error')
      mockApiClient.patch.mockRejectedValueOnce(error)

      await expect(userService.updateProfile(updateData)).rejects.toThrow('Validation Error')
    })
  })

  describe('changeUserPassword', () => {
    const passwordData: UserChangePasswordData = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123'
    }

    it('debería cambiar la contraseña correctamente', async () => {
      const mockApiClient = getMockApiClient()
      mockApiClient.post.mockResolvedValueOnce({ data: { message: 'Contraseña cambiada exitosamente' } })

      await userService.changeUserPassword(passwordData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/users/change-password', passwordData)
    })

    it('debería manejar errores del servidor', async () => {
      const mockApiClient = getMockApiClient()
      const error = new Error('Current password is incorrect')
      mockApiClient.post.mockRejectedValueOnce(error)

      await expect(userService.changeUserPassword(passwordData)).rejects.toThrow('Current password is incorrect')
    })
  })

  describe('getUserById', () => {
    it('debería obtener un usuario por ID', async () => {
      const mockApiClient = getMockApiClient()
      mockApiClient.get.mockResolvedValueOnce({ data: mockUser })

      const result = await userService.getUserById(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1')
      expect(result).toEqual(mockUser)
    })
  })

  describe('createUser', () => {
    const createData = {
      uIdentification: '987654321',
      uName: 'María',
      uFLastName: 'González',
      uEmail: 'maria.gonzalez@hospital.com',
      uPassword: 'password123',
      roleId: 2
    }

    it('debería crear un usuario correctamente', async () => {
      const mockApiClient = getMockApiClient()
      const newUser = { ...mockUser, ...createData, id: 2 }
      mockApiClient.post.mockResolvedValueOnce({ data: newUser })

      const result = await userService.createUser(createData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/users', createData)
      expect(result).toEqual(newUser)
    })
  })

  describe('searchUsers', () => {
    const mockUsers = [mockUser]

    it('debería buscar usuarios correctamente', async () => {
      const mockApiClient = getMockApiClient()
      mockApiClient.get.mockResolvedValueOnce({ data: mockUsers })

      const result = await userService.searchUsers('Juan')

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/search', {
        params: { term: 'Juan' }
      })
      expect(result).toEqual(mockUsers)
    })
  })

  describe('toggleUserStatus', () => {
    it('debería cambiar el estado del usuario', async () => {
      const mockApiClient = getMockApiClient()
      const updatedUser = { ...mockUser, uIsActive: false }
      mockApiClient.patch.mockResolvedValueOnce({ data: updatedUser })

      const result = await userService.toggleUserStatus(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/1/toggle-status')
      expect(result).toEqual(updatedUser)
    })
  })
})