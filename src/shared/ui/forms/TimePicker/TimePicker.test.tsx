import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TimePicker from './TimePicker'

describe('TimePicker component', () => {
  it('renders trigger input and opens popover on click', () => {
    render(<TimePicker placeholder="08:00" value="" />)

    const trigger = screen.getByRole('button', { name: /08:00/i })
    expect(trigger).toBeInTheDocument()

    // Click trigger opens popover
    fireEvent.click(trigger)
    expect(screen.getByText('Hora')).toBeInTheDocument()
    expect(screen.getByText('Minuto')).toBeInTheDocument()
  })

  it('selects hour and minute, firing onChange', () => {
    const onChange = vi.fn()
    render(<TimePicker value="10:00" onChange={onChange} />)

    const trigger = screen.getByRole('button', { name: /10:00/i })
    fireEvent.click(trigger)

    // Select hour 14
    const hour14 = screen.getByRole('button', { name: '14' })
    fireEvent.click(hour14)
    expect(onChange).toHaveBeenCalledWith('14:00')

    // Select minute 30
    const min30 = screen.getByRole('button', { name: '30' })
    fireEvent.click(min30)
    expect(onChange).toHaveBeenCalledWith('10:30')
  })

  it('selects preset time', () => {
    const onChange = vi.fn()
    render(<TimePicker value="" onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const preset = screen.getByRole('button', { name: '09:00' })
    fireEvent.click(preset)
    expect(onChange).toHaveBeenCalledWith('09:00')
  })
})
