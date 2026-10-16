import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateTimePicker from './DateTimePicker'

describe('DateTimePicker component', () => {
  it('renders trigger input and opens popover with date and time tabs', () => {
    render(<DateTimePicker placeholder="Seleccionar fecha y hora" value="" />)

    const trigger = screen.getByRole('button', { name: /Seleccionar fecha y hora/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: /^Fecha/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Hora/i })).toBeInTheDocument()
  })

  it('allows picking date and time and confirming', () => {
    const onChange = vi.fn()
    render(<DateTimePicker value="2026-10-10T08:00" onChange={onChange} />)

    const trigger = screen.getByRole('button', { name: /10 Oct 2026/i })
    fireEvent.click(trigger)

    // Pick a date
    const day20 = screen.getByRole('button', { name: /^20 de Octubre de 2026$/i })
    fireEvent.click(day20)

    // Switch to Time tab
    const timeTab = screen.getByRole('button', { name: /^Hora/i })
    fireEvent.click(timeTab)

    // Pick hour 15
    const h15 = screen.getByRole('button', { name: 'Hora 15' })
    fireEvent.click(h15)

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: /Confirmar/i })
    fireEvent.click(confirmBtn)

    expect(onChange).toHaveBeenCalledWith('2026-10-20T15:00', expect.any(Date))
  })
})
