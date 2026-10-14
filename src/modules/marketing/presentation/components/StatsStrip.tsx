import { platformStats } from '../content/marketingContent'
import CountUp from './CountUp'
import { stagger } from './stagger'
import shared from './shared.module.css'
import styles from './StatsStrip.module.css'

/** Product facts derived from the module catalogue — no invented marketing numbers. */
export default function StatsStrip() {
  return (
    <section aria-label="La plataforma en cifras" className={styles.strip}>
      <ul className={`marketing-container ${styles.grid}`}>
        {platformStats.map(({ value, label }, index) => (
          <li className={`${styles.stat} ${shared.reveal}`} key={label} style={stagger(index)}>
            <strong className={styles.value}><CountUp value={value} /></strong>
            <span className={styles.label}>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
