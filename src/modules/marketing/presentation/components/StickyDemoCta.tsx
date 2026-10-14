'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import styles from './StickyDemoCta.module.css'

export default function StickyDemoCta() {
  const pathname = usePathname()
  const [visibleCtaForPath, setVisibleCtaForPath] = useState({ path: pathname, visible: false })
  const hasVisibleCta = visibleCtaForPath.path === pathname && visibleCtaForPath.visible

  useEffect(() => {
    const ctas = document.querySelectorAll<HTMLElement>('.hero-actions, .final-cta-section, .public-bottom-cta')
    if (ctas.length === 0 || !('IntersectionObserver' in window)) return
    const intersectingCtas = new Set<Element>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersectingCtas.add(entry.target)
          else intersectingCtas.delete(entry.target)
        }
        setVisibleCtaForPath({ path: pathname, visible: intersectingCtas.size > 0 })
      },
      { threshold: 0.15 },
    )
    ctas.forEach((cta) => observer.observe(cta))
    return () => observer.disconnect()
  }, [pathname])

  if (pathname === '/contacto' || hasVisibleCta) return null

  return (
    <div className={styles.sticky}>
      <Link className="button button-primary" href="/contacto">
        Solicitar una demostración <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </div>
  )
}
