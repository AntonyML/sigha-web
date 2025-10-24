import { describe, it, expect } from 'vitest'
import { userService } from '../../../src/services/userService'

describe('userService - Basic Structure Tests', () => {
  it('should export userService object', () => {
    expect(userService).toBeDefined()
    expect(typeof userService).toBe('object')
  })

  it('should have all required methods for user operations', () => {
    // Métodos principales para usuarios normales
    expect(userService.getProfile).toBeDefined()
    expect(typeof userService.getProfile).toBe('function')

    expect(userService.updateProfile).toBeDefined()
    expect(typeof userService.updateProfile).toBe('function')

    expect(userService.changeUserPassword).toBeDefined()
    expect(typeof userService.changeUserPassword).toBe('function')
  })

  it('should have admin methods (for completeness)', () => {
    // Métodos de administración (no usados por usuarios normales)
    expect(userService.getAllUsers).toBeDefined()
    expect(userService.getUserById).toBeDefined()
    expect(userService.createUser).toBeDefined()
    expect(userService.updateUser).toBeDefined()
    expect(userService.deleteUser).toBeDefined()
    expect(userService.searchUsers).toBeDefined()
    expect(userService.toggleUserStatus).toBeDefined()
  })

  it('should have utility methods', () => {
    expect(userService.getAllRoles).toBeDefined()
    expect(userService.getUsersByRole).toBeDefined()
  })

  it('should have correct method signatures', () => {
    // Verificar que son funciones
    expect(userService.getProfile).toBeInstanceOf(Function)
    expect(userService.updateProfile).toBeInstanceOf(Function)
    expect(userService.changeUserPassword).toBeInstanceOf(Function)
    expect(userService.getAllUsers).toBeInstanceOf(Function)
    expect(userService.searchUsers).toBeInstanceOf(Function)
  })

  it('should be able to import without errors', () => {
    // Test básico de importación - si llega aquí, el import funcionó
    expect(() => {
      // Intentar acceder a las propiedades
      const methods = Object.keys(userService)
      expect(methods.length).toBeGreaterThan(0)
    }).not.toThrow()
  })
})