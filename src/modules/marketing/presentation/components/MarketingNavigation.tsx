'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { primaryNavigation } from '../content/marketingContent'
import styles from './MarketingNavigation.module.css'

const navigationId = 'marketing-primary-navigation'

export default function MarketingNavigation() {
  const pathname = usePathname()
  const [openForPath, setOpenForPath] = useState({ path: pathname, open: false })
  const isOpen = openForPath.path === pathname && openForPath.open

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenForPath({ path: pathname, open: false })
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen, pathname])

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className={`${styles.menu} marketing-nav`}
        data-open={isOpen}
        id={navigationId}
      >
        {primaryNavigation.map((item) => (
          <Link href={item.href} key={item.href} onClick={() => setOpenForPath({ path: pathname, open: false })}>
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        aria-controls={navigationId}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        className={styles.toggle}
        onClick={() => setOpenForPath({ path: pathname, open: !isOpen })}
        type="button"
      >
        {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
      </button>
    </>
  )
}
