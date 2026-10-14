import styles from './HeroAmbient.module.css'

/** Decorative animated background for the hero: soft drifting colour fields over a faint dot grid. */
export default function HeroAmbient() {
  return (
    <div aria-hidden="true" className={styles.ambient}>
      <span className={`${styles.blob} ${styles.blobBlue}`} />
      <span className={`${styles.blob} ${styles.blobWarm}`} />
      <span className={`${styles.blob} ${styles.blobSage}`} />
      <span className={styles.dots} />
    </div>
  )
}
