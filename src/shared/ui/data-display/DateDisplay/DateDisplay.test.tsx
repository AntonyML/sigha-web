import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DateDisplay from './DateDisplay'
import DateBadge from './DateBadge'

describe('DateDisplay and DateBadge components', () => {
  it('formats dates in various formats', () => {
    const { rerender } = render(<DateDisplay value="2026-10-16" format="date" />)
    expect(screen.getByText('16 Oct 2026')).toBeInTheDocument()

    rerender(<DateDisplay value="2026-10-16" format="month-only" />)
    expect(screen.getByText('Octubre')).toBeInTheDocument()

    rerender(<DateDisplay value="2026-10-16" format="year-only" />)
    expect(screen.getByText('2026')).toBeInTheDocument()

    rerender(<DateDisplay value="2026-10-16T14:30:00" format="time" />)
    expect(screen.getByText('14:30')).toBeInTheDocument()

    rerender(<DateDisplay value="2026-10-16" format="full" />)
    expect(screen.getByText(/16 de Octubre de 2026/i)).toBeInTheDocument()
  })

  it('renders Islamic date when calendarSystem is islamic or both', () => {
    const { rerender } = render(<DateDisplay value="2026-10-16" calendarSystem="islamic" />)
    // Should render Hijri date formatted
    expect(screen.getByText(/1448/i)).toBeInTheDocument()

    rerender(<DateDisplay value="2026-10-16" calendarSystem="both" />)
    expect(screen.getByText('16 Oct 2026')).toBeInTheDocument()
    expect(screen.getByText(/\(.*1448.*\)/i)).toBeInTheDocument()
  })

  it('renders DateBadge with variant styles', () => {
    render(<DateBadge value="2026-10-16" variant="success" />)
    const badge = screen.getByText('16 Oct 2026').closest('span.border')
    expect(badge).toHaveClass('bg-emerald-50')
  })
})
