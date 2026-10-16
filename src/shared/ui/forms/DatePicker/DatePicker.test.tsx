import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DatePicker from './DatePicker'

describe('DatePicker component', () => {
  it('renders trigger input with placeholder and opens popover on click', () => {
    render(<DatePicker placeholder="Elige un día" value="" />)

    const trigger = screen.getByRole('button', { name: /Elige un día/i })
    expect(trigger).toBeInTheDocument()

    // Popover is not open initially
    expect(screen.queryByRole('region', { name: 'Calendario' })).not.toBeInTheDocument()

    // Click trigger opens popover
    fireEvent.click(trigger)
    expect(screen.getByRole('region', { name: 'Calendario' })).toBeInTheDocument()
  })

  it('selects date from calendar and calls onChange with ISO date', () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-10-01" onChange={onChange} />)

    const trigger = screen.getByRole('button', { name: /1 Oct 2026/i })
    fireEvent.click(trigger)

    const day16 = screen.getByRole('button', { name: /^16 de Octubre de 2026$/i })
    fireEvent.click(day16)

    expect(onChange).toHaveBeenCalledWith('2026-10-16', expect.any(Date))
    // Popover closes after selection
    expect(screen.queryByRole('region', { name: 'Calendario' })).not.toBeInTheDocument()
  })

  it('clears selection when clicking the clear icon', () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-10-16" onChange={onChange} allowClear={true} />)

    const clearBtn = screen.getByRole('button', { name: 'Borrar selección' })
    fireEvent.click(clearBtn)

    expect(onChange).toHaveBeenCalledWith('', undefined)
  })

  it('closes popover on Escape key', () => {
    render(<DatePicker value="2026-10-16" />)
    const trigger = screen.getByRole('button', { name: /16 Oct 2026/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('region', { name: 'Calendario' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: 'Calendario' })).not.toBeInTheDocument()
  })
})
