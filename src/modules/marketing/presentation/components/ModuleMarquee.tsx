'use client'

import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { platformModules } from '../content/marketingContent'
import styles from './ModuleMarquee.module.css'

/**
 * Slow marquee of the real module names. Moving content longer than five seconds
 * needs a pause control (WCAG 2.2.2), and reduced-motion visitors get a static,
 * wrapped list instead of any animation.
 */
export default function ModuleMarquee() {
  const [paused, setPaused] = useState(false)

  return (
    <section aria-label="Módulos de la plataforma" className={styles.marquee}>
      <div className={`marketing-container ${styles.head}`}>
        <p className={styles.caption}>Una plataforma para conectar las tareas esenciales del centro</p>
        <button className={styles.toggle} onClick={() => setPaused((current) => !current)} type="button">
          {paused ? <Play aria-hidden="true" size={13} /> : <Pause aria-hidden="true" size={13} />}
          <span>{paused ? 'Reanudar movimiento' : 'Pausar movimiento'}</span>
        </button>
      </div>
      <div className={styles.viewport}>
        <ul className={styles.track} data-paused={paused}>
          {platformModules.map(({ id, title, icon: Icon }) => (
            <li className={styles.item} key={id}>
              <Icon aria-hidden="true" className={styles.icon} size={15} /> {title}
            </li>
          ))}
          {platformModules.map(({ id, title, icon: Icon }) => (
            <li aria-hidden="true" className={`${styles.item} ${styles.duplicate}`} key={`${id}-copy`}>
              <Icon aria-hidden="true" className={styles.icon} size={15} /> {title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
