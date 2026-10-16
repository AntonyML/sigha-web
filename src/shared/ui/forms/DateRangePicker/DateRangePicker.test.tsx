import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateRangePicker from './DateRangePicker'

describe('DateRangePicker component', () => {
  it('renders trigger input with formatted range', () => {
    render(<DateRangePicker value={{ start: '2026-10-01', end: '2026-10-15' }} />)

    const trigger = screen.getByRole('button', { name: /1 Oct 2026 — 15 Oct 2026/i })
    expect(trigger).toBeInTheDocument()

    // Opens popover on click
    fireEvent.click(trigger)
    expect(screen.getByRole('region', { name: 'Calendario' })).toBeInTheDocument()
  })

  it('selects range dates and fires onChange', () => {
    const onChange = vi.fn()
    render(<DateRangePicker value={{ start: '', end: '' }} onChange={onChange} />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    const day5 = screen.getByRole('button', { name: /^5 de /i })
    fireEvent.click(day5)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ start: expect.stringMatching(/^\d{4}-\d{2}-05$/) }))
  })

  it('clears range selection', () => {
    const onChange = vi.fn()
    render(<DateRangePicker value={{ start: '2026-10-01', end: '2026-10-15' }} onChange={onChange} allowClear={true} />)

    const clearBtn = screen.getByRole('button', { name: 'Borrar rango' })
    fireEvent.click(clearBtn)

    expect(onChange).toHaveBeenCalledWith({ start: '', end: '' })
  })
})
