'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { contactEmail } from '../content/marketingContent'
import styles from './ContactInquiryForm.module.css'

export default function ContactInquiryForm() {
  const [draftRequested, setDraftRequested] = useState(false)

  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const organization = String(form.get('organization') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()
    const body = [
      `Nombre: ${name}`,
      `Organización: ${organization}`,
      `Correo: ${email}`,
      '',
      message,
    ].join('\n')
    const href = `mailto:${contactEmail}?subject=${encodeURIComponent('Consulta sobre SIGHa')}&body=${encodeURIComponent(body)}`

    setDraftRequested(true)
    window.location.assign(href)
  }

  return (
    <form className={styles.form} onSubmit={prepareEmail}>
      <label className={styles.field} htmlFor="contact-name">
        Nombre
        <input autoComplete="name" id="contact-name" name="name" required />
      </label>
      <label className={styles.field} htmlFor="contact-organization">
        Organización
        <input autoComplete="organization" id="contact-organization" name="organization" required />
      </label>
      <label className={styles.field} htmlFor="contact-email">
        Correo electrónico
        <input autoComplete="email" id="contact-email" name="email" required type="email" />
      </label>
      <label className={styles.field} htmlFor="contact-message">
        ¿Qué te gustaría conocer?
        <textarea id="contact-message" name="message" required rows={5} />
      </label>
      <p className={styles.privacyHint}>No incluyas información clínica ni datos personales de residentes.</p>
      <button className="button button-primary" type="submit">
        Preparar correo <ArrowRight aria-hidden="true" size={16} />
      </button>
      {draftRequested && (
        <p aria-live="polite" className={styles.status}>
          Se solicitó abrir un borrador de correo. Si no se abrió, escríbenos a {contactEmail}.
        </p>
      )}
    </form>
  )
}
