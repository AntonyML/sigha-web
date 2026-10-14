'use client'

import { useId, useState } from 'react'
import { useOrganizationSettings } from '@/app/providers/SettingsContext'
import { reloadPage } from '@/shared/lib/navigationUtils'

export default function OrganizationSwitcher() {
  const id = useId()
  const { organizations, activeOrganization, switchOrganization } = useOrganizationSettings()
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState('')

  if (organizations.length <= 1) return null

  async function handleChange(value: string) {
    const organizationId = Number(value)
    if (!Number.isInteger(organizationId) || organizationId === activeOrganization?.id) return

    setSwitching(true)
    setError('')
    try {
      await switchOrganization(organizationId)
      reloadPage()
    } catch {
      setError('No se pudo cambiar de organización.')
      setSwitching(false)
    }
  }

  return (
    <div className="flex min-w-0 flex-col">
      <label htmlFor={`active-organization-${id}`} className="sr-only">Cambiar organización</label>
      <select
        id={`active-organization-${id}`}
        aria-label="Cambiar organización"
        value={activeOrganization?.id ?? ''}
        disabled={switching || !activeOrganization}
        onChange={(event) => void handleChange(event.target.value)}
        className="max-w-48 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground disabled:opacity-60"
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>{organization.name}</option>
        ))}
      </select>
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
