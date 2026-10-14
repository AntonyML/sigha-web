import { faqItems } from '../content/marketingContent'
import styles from './FaqSection.module.css'

export default function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className={`section-padding ${styles.section}`}>
      <div className={`marketing-container ${styles.layout}`}>
        <div className={styles.intro}>
          <span className="eyebrow">Preguntas frecuentes</span>
          <h2 id="faq-title">Respuestas para empezar con claridad.</h2>
          <p>Si necesitas revisar un caso concreto, conversemos sobre el trabajo de tu organización.</p>
        </div>
        <div className={styles.items}>
          {faqItems.map(({ id, question, answer }) => (
            <details className={styles.item} key={id}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
