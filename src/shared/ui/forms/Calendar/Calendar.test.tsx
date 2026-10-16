import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Calendar from './Calendar'
import { formatDateIso } from './calendarUtils'

describe('Calendar component', () => {
  it('renders default single mode calendar with month header and days of week', () => {
    const fixedDate = new Date(2026, 9, 16) // Oct 16, 2026
    render(<Calendar initialDate={fixedDate} value="2026-10-16" />)

    expect(screen.getByText('Octubre')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('Lun')).toBeInTheDocument()
    expect(screen.getByText('Dom')).toBeInTheDocument()

    // Check selected date button
    const day16 = screen.getByRole('button', { name: /16 de Octubre de 2026/i })
    expect(day16).toBeInTheDocument()
    expect(day16).toHaveAttribute('aria-selected', 'true')
  })

  it('handles date selection and fires onChange', () => {
    const onChange = vi.fn()
    const fixedDate = new Date(2026, 9, 1)
    render(<Calendar initialDate={fixedDate} onChange={onChange} />)

    const day20 = screen.getByRole('button', { name: /20 de Octubre de 2026/i })
    fireEvent.click(day20)

    expect(onChange).toHaveBeenCalledWith('2026-10-20', expect.any(Date))
  })

  it('navigates next and previous month', () => {
    const fixedDate = new Date(2026, 9, 1) // Oct 2026
    render(<Calendar initialDate={fixedDate} />)

    expect(screen.getByText('Octubre')).toBeInTheDocument()

    // Click Next
    const nextBtn = screen.getByLabelText('Mes siguiente')
    fireEvent.click(nextBtn)
    expect(screen.getByText('Noviembre')).toBeInTheDocument()

    // Click Prev twice
    const prevBtn = screen.getByLabelText('Mes anterior')
    fireEvent.click(prevBtn)
    expect(screen.getByText('Octubre')).toBeInTheDocument()
    fireEvent.click(prevBtn)
    expect(screen.getByText('Septiembre')).toBeInTheDocument()
  })

  it('handles Date Range mode with start and end selection', () => {
    const onRangeChange = vi.fn()
    const fixedDate = new Date(2026, 9, 1)
    render(<Calendar mode="range" initialDate={fixedDate} onRangeChange={onRangeChange} showPresets={true} />)

    // First click: start date
    const day10 = screen.getByRole('button', { name: /10 de Octubre de 2026/i })
    fireEvent.click(day10)
    expect(onRangeChange).toHaveBeenCalledWith({ start: '2026-10-10', end: '' })

    // Second click: end date
    const day15 = screen.getByRole('button', { name: /15 de Octubre de 2026/i })
    fireEvent.click(day15)
    expect(onRangeChange).toHaveBeenCalledWith({ start: '2026-10-10', end: '2026-10-15' })

    // Preset button "Hoy"
    const todayPreset = screen.getByRole('button', { name: 'Hoy' })
    fireEvent.click(todayPreset)
    expect(onRangeChange).toHaveBeenCalled()
  })

  it('respects minDate, maxDate and disabledDates restrictions', () => {
    const onChange = vi.fn()
    const fixedDate = new Date(2026, 9, 1)
    render(
      <Calendar
        initialDate={fixedDate}
        minDate="2026-10-10"
        maxDate="2026-10-20"
        disabledDates={['2026-10-15']}
        disableWeekends={true}
        onChange={onChange}
      />
    )

    // Day 5 is before minDate -> disabled
    const day5 = screen.getByRole('button', { name: /^5 de Octubre de 2026$/i })
    expect(day5).toBeDisabled()
    expect(day5).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(day5)
    expect(onChange).not.toHaveBeenCalled()

    // Day 15 is explicitly in disabledDates -> disabled
    const day15 = screen.getByRole('button', { name: /^15 de Octubre de 2026$/i })
    expect(day15).toBeDisabled()

    // Day 17 is Saturday (weekend) -> disabled
    const day17 = screen.getByRole('button', { name: /^17 de Octubre de 2026$/i })
    expect(day17).toBeDisabled()

    // Day 12 is Monday, within [10, 20], not disabled -> clickable
    const day12 = screen.getByRole('button', { name: /^12 de Octubre de 2026$/i })
    expect(day12).not.toBeDisabled()
    fireEvent.click(day12)
    expect(onChange).toHaveBeenCalledWith('2026-10-12', expect.any(Date))
  })

  it('renders Special Dates with indicators and titles', () => {
    const fixedDate = new Date(2026, 9, 1)
    const specialDates = [
      { date: '2026-10-12', label: 'Cita Médica General', color: 'red' as const },
      { date: '2026-10-18', label: 'Cumpleaños Residente', color: 'green' as const },
    ]
    render(<Calendar initialDate={fixedDate} specialDates={specialDates} />)

    const day12 = screen.getByRole('button', { name: /^12 de Octubre de 2026$/i })
    const indicator12 = day12.querySelector('span[title="Cita Médica General"]')
    expect(indicator12).toBeInTheDocument()
    expect(indicator12).toHaveClass('bg-rose-500')
  })

  it('supports Multiple Selection mode', () => {
    const onMultipleChange = vi.fn()
    const fixedDate = new Date(2026, 9, 1)
    render(
      <Calendar
        mode="multiple"
        initialDate={fixedDate}
        multipleValue={['2026-10-05']}
        onMultipleChange={onMultipleChange}
      />
    )

    const day5 = screen.getByRole('button', { name: /^5 de Octubre de 2026$/i })
    expect(day5).toHaveAttribute('aria-selected', 'true')

    // Click day 10 to add to selection
    const day10 = screen.getByRole('button', { name: /^10 de Octubre de 2026$/i })
    fireEvent.click(day10)
    expect(onMultipleChange).toHaveBeenCalledWith(['2026-10-05', '2026-10-10'])

    // Click day 5 to remove
    fireEvent.click(day5)
    expect(onMultipleChange).toHaveBeenCalledWith([])
  })

  it('supports Month Picker mode', () => {
    const onChange = vi.fn()
    const fixedDate = new Date(2026, 9, 1)
    render(<Calendar mode="month" initialDate={fixedDate} onChange={onChange} />)

    // Month grid buttons
    const marBtn = screen.getByRole('button', { name: 'Mar' })
    fireEvent.click(marBtn)
    expect(onChange).toHaveBeenCalledWith('2026-03', expect.any(Date))
  })

  it('supports Islamic Calendar toggle and rendering', () => {
    const fixedDate = new Date(2026, 9, 16)
    render(<Calendar initialDate={fixedDate} calendarSystem="islamic" showCalendarSystemToggle={true} />)

    // Header should contain Islamic subtitle
    expect(screen.getByTitle(/Calendario Islámico/i)).toBeInTheDocument()

    // Toggle button should cycle through gregorian, both, islamic
    const toggleBtn = screen.getByLabelText('Alternar sistema de calendario')
    fireEvent.click(toggleBtn)
    // cycles to gregorian
    expect(screen.getByLabelText('Alternar sistema de calendario')).toBeInTheDocument()
  })
})
