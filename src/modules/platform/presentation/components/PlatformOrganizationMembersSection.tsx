'use client'

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { Alert, Button, Input, LoadingSpinner } from '@/shared/ui'
import {
  platformOrganizationsService,
  type PlatformOrganizationMember,
} from '@/infrastructure/api/services/platformOrganizationsService'

function extractMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message
    if (typeof message === 'string') return message
  }
  return fallback
}

const isSixDigitCode = (value: string) => /^\d{6}$/.test(value.trim())

const formatDateTime = (value: string) => new Date(value).toLocaleString('es-CR')

export interface PlatformOrganizationMembersSectionProps {
  organizationId: number
  initialMemberCount?: number
}

export default function PlatformOrganizationMembersSection({
  organizationId,
  initialMemberCount = 0,
}: PlatformOrganizationMembersSectionProps) {
  const [members, setMembers] = useState<PlatformOrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [stepUpCode, setStepUpCode] = useState('')
  const [stepUpActive, setStepUpActive] = useState(
    platformOrganizationsService.hasStepUpToken(),
  )

  const [newUserId, setNewUserId] = useState('')
  const [newRoleId, setNewRoleId] = useState('')
  const [roleDrafts, setRoleDrafts] = useState<Record<number, string>>({})

  const syncRoleDrafts = useCallback((items: PlatformOrganizationMember[]) => {
    const next: Record<number, string> = {}
    for (const item of items) {
      next[item.userId] = String(item.roleId)
    }
    setRoleDrafts(next)
  }, [])

  const loadMembers = useCallback(async () => {
    setError(null)
    try {
      const data = await platformOrganizationsService.listMembers(organizationId)
      const list = Array.isArray(data) ? data : []
      setMembers(list)
      syncRoleDrafts(list)
    } catch (err) {
      setError(extractMessage(err, 'No se pudieron cargar las membresías.'))
    }
  }, [organizationId, syncRoleDrafts])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await platformOrganizationsService.listMembers(organizationId)
        if (active) {
          const list = Array.isArray(data) ? data : []
          setMembers(list)
          syncRoleDrafts(list)
        }
      } catch (err) {
        if (active) {
          setError(extractMessage(err, 'No se pudieron cargar las membresías.'))
        }
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [organizationId, syncRoleDrafts])

  const ensureStepUp = useCallback(async (): Promise<boolean> => {
    if (platformOrganizationsService.hasStepUpToken()) {
      setStepUpActive(true)
      return true
    }
    if (!isSixDigitCode(stepUpCode)) {
      setError('Ingresa un código 2FA de 6 dígitos para confirmar el cambio.')
      return false
    }
    await platformOrganizationsService.requestStepUp(stepUpCode.trim())
    setStepUpCode('')
    setStepUpActive(true)
    return true
  }, [stepUpCode])

  const handleAddMember = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      setNotice(null)

      const parsedUserId = Number(newUserId.trim())
      const parsedRoleId = Number(newRoleId.trim())
      if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
        setError('Ingresa un ID de usuario válido.')
        return
      }
      if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
        setError('Ingresa un ID de rol válido.')
        return
      }

      setBusy(true)
      try {
        if (!(await ensureStepUp())) return
        const created = await platformOrganizationsService.addMember(organizationId, {
          userId: parsedUserId,
          roleId: parsedRoleId,
        })
        setNotice(`Membresía añadida para ${created.name} (${created.roleName}).`)
        setNewUserId('')
        setNewRoleId('')
        await loadMembers()
      } catch (err) {
        setError(extractMessage(err, 'No se pudo añadir la membresía.'))
      } finally {
        setBusy(false)
      }
    },
    [ensureStepUp, loadMembers, newRoleId, newUserId, organizationId],
  )

  const handleUpdateRole = useCallback(
    async (member: PlatformOrganizationMember) => {
      setError(null)
      setNotice(null)

      const rawRoleId = roleDrafts[member.userId] ?? String(member.roleId)
      const parsedRoleId = Number(rawRoleId.trim())
      if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
        setError('Ingresa un ID de rol válido.')
        return
      }

      setBusy(true)
      try {
        if (!(await ensureStepUp())) return
        const updated = await platformOrganizationsService.updateMemberRole(
          organizationId,
          member.userId,
          { roleId: parsedRoleId },
        )
        setNotice(`Rol de ${updated.name} actualizado a ${updated.roleName}.`)
        await loadMembers()
      } catch (err) {
        setError(extractMessage(err, 'No se pudo actualizar el rol de la membresía.'))
      } finally {
        setBusy(false)
      }
    },
    [ensureStepUp, loadMembers, organizationId, roleDrafts],
  )

  const handleRemoveMember = useCallback(
    async (member: PlatformOrganizationMember) => {
      setError(null)
      setNotice(null)
      setBusy(true)
      try {
        if (!(await ensureStepUp())) return
        const result = await platformOrganizationsService.removeMember(
          organizationId,
          member.userId,
        )
        const promoSuffix =
          result.promotedUserId !== null
            ? ` Se promovió otra membresía primaria del usuario #${result.promotedUserId}.`
            : ''
        setNotice(`Membresía de ${member.name} eliminada.${promoSuffix}`)
        await loadMembers()
      } catch (err) {
        setError(extractMessage(err, 'No se pudo eliminar la membresía.'))
      } finally {
        setBusy(false)
      }
    },
    [ensureStepUp, loadMembers, organizationId],
  )

  const displayedCount = loading ? initialMemberCount : members.length || initialMemberCount

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h2 className="h6">Membresías</h2>
        <p className="mb-3">
          <span className="h4 me-2">{displayedCount}</span>
          <span className="text-muted">
            {displayedCount === 1 ? 'miembro registrado' : 'miembros registrados'}
          </span>
        </p>

        {error && (
          <Alert variant="error" title="No se pudo completar la acción">
            {error}
          </Alert>
        )}
        {notice && (
          <Alert variant="success" title="Listo">
            {notice}
          </Alert>
        )}

        <div className="border rounded p-3 mb-3 bg-light">
          <h3 className="h6 mb-1">Verificación 2FA</h3>
          <p className="text-muted small mb-2">
            Las mutaciones de membresías requieren re-verificar tu código TOTP (válido 5 minutos).
          </p>
          {stepUpActive ? (
            <span className="badge text-bg-success" role="status">
              Verificación 2FA activa
            </span>
          ) : (
            <Input
              label="Código 2FA (6 dígitos)"
              value={stepUpCode}
              onChange={(event) => setStepUpCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              aria-label="Código 2FA"
            />
          )}
        </div>

        <form className="border rounded p-3 mb-3" onSubmit={handleAddMember}>
          <h3 className="h6 mb-2">Añadir miembro</h3>
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <Input
                label="ID de usuario"
                value={newUserId}
                onChange={(event) => setNewUserId(event.target.value)}
                inputMode="numeric"
                required
              />
            </div>
            <div className="col-md-5">
              <Input
                label="ID de rol"
                value={newRoleId}
                onChange={(event) => setNewRoleId(event.target.value)}
                inputMode="numeric"
                required
              />
            </div>
            <div className="col-md-2 mb-3">
              <Button type="submit" disabled={busy}>
                Añadir miembro
              </Button>
            </div>
          </div>
        </form>

        {loading ? (
          <LoadingSpinner message="Cargando membresías..." />
        ) : members.length === 0 ? (
          <p className="text-muted mb-0">No hay miembros registrados en esta organización.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Rol actual</th>
                  <th scope="col">Primaria</th>
                  <th scope="col">Cuenta creada</th>
                  <th scope="col">Cambiar rol (ID)</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.userId}>
                    <td>
                      <div className="fw-semibold">{member.name}</div>
                      <div className="text-muted small">
                        {member.email} · ID #{member.userId}
                      </div>
                    </td>
                    <td>
                      <span className="badge text-bg-light border text-dark">
                        {member.roleName} (#{member.roleId})
                      </span>
                    </td>
                    <td>
                      {member.isPrimary ? (
                        <span className="badge text-bg-primary">Primaria</span>
                      ) : (
                        <span className="text-muted small">Secundaria</span>
                      )}
                    </td>
                    <td className="small text-muted">
                      {member.joinedAt ? formatDateTime(member.joinedAt) : '—'}
                    </td>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <input
                          type="number"
                          min={1}
                          className="form-control form-control-sm"
                          style={{ maxWidth: '6rem' }}
                          aria-label={`Nuevo rol para ${member.name}`}
                          value={roleDrafts[member.userId] ?? String(member.roleId)}
                          onChange={(event) =>
                            setRoleDrafts((prev) => ({
                              ...prev,
                              [member.userId]: event.target.value,
                            }))
                          }
                          disabled={busy}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="btn-sm"
                          disabled={busy}
                          onClick={() => void handleUpdateRole(member)}
                        >
                          Cambiar rol
                        </Button>
                      </div>
                    </td>
                    <td>
                      <Button
                        type="button"
                        variant="danger"
                        className="btn-sm"
                        disabled={busy}
                        onClick={() => void handleRemoveMember(member)}
                      >
                        Quitar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
