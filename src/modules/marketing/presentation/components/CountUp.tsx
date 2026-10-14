'use client'

import { useEffect, useRef, useState } from 'react'
import shared from './shared.module.css'

interface CountUpProps {
  readonly value: number
  readonly durationMs?: number
}

/**
 * Counts from 0 to `value` the first time it scrolls into view.
 * The server renders the final value (and a screen-reader copy), so the number is
 * correct without JavaScript and for visitors who prefer reduced motion.
 */
export default function CountUp({ value, durationMs = 1200 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(Math.round(value * eased))
          if (progress < 1) frame = requestAnimationFrame(tick)
        }

        setDisplay(0)
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, durationMs])

  return (
    <>
      <span aria-hidden="true" ref={ref}>{display}</span>
      <span className={shared.srOnly}>{value}</span>
    </>
  )
}
