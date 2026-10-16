import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MonthPicker from './MonthPicker'

describe('MonthPicker component', () => {
  it('renders trigger input and opens 12-month grid popover on click', () => {
    render(<MonthPicker value="2026-10" placeholder="Seleccionar mes" />)

    const trigger = screen.getByRole('button', { name: /Octubre 2026/i })
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ene' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dic' })).toBeInTheDocument()
  })

  it('selects a month and fires onChange with YYYY-MM', () => {
    const onChange = vi.fn()
    render(<MonthPicker value="2026-10" onChange={onChange} />)

    const trigger = screen.getByRole('button', { name: /Octubre 2026/i })
    fireEvent.click(trigger)

    const marBtn = screen.getByRole('button', { name: 'Mar' })
    fireEvent.click(marBtn)

    expect(onChange).toHaveBeenCalledWith('2026-03', 2026, 2)
  })

  it('navigates year with next/previous buttons', () => {
    render(<MonthPicker value="2026-10" />)

    const trigger = screen.getByRole('button', { name: /Octubre 2026/i })
    fireEvent.click(trigger)

    const nextYearBtn = screen.getByLabelText('Año siguiente')
    fireEvent.click(nextYearBtn)
    expect(screen.getByText('2027')).toBeInTheDocument()

    const prevYearBtn = screen.getByLabelText('Año anterior')
    fireEvent.click(prevYearBtn)
    expect(screen.getByText('2026')).toBeInTheDocument()
  })
})
