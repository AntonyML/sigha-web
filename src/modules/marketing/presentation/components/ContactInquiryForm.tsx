'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { contactEmail } from '../content/marketingContent'
import { contactInquiryService } from '@/infrastructure/api/services/contactInquiryService'
import styles from './ContactInquiryForm.module.css'

export default function ContactInquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')
    setStatusMessage('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const organization = String(formData.get('organization') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()

    try {
      const response = await contactInquiryService.submitInquiry({
        name,
        organization,
        email,
        message,
      })
      setStatus('success')
      setStatusMessage(
        response.message ||
          'Tu consulta fue enviada con éxito. Te hemos enviado un acuse de recibo a tu correo.',
      )
      form.reset()
    } catch (err: any) {
      setStatus('error')
      const errorMsg =
        err?.response?.data?.message ||
        `No se pudo enviar la consulta en este momento. Puedes escribirnos directamente a ${contactEmail}.`
      setStatusMessage(Array.isArray(errorMsg) ? errorMsg.join('. ') : errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field} htmlFor="contact-name">
        Nombre
        <input autoComplete="name" id="contact-name" name="name" required disabled={isSubmitting} />
      </label>
      <label className={styles.field} htmlFor="contact-organization">
        Organización
        <input
          autoComplete="organization"
          id="contact-organization"
          name="organization"
          disabled={isSubmitting}
        />
      </label>
      <label className={styles.field} htmlFor="contact-email">
        Correo electrónico
        <input
          autoComplete="email"
          id="contact-email"
          name="email"
          required
          type="email"
          disabled={isSubmitting}
        />
      </label>
      <label className={styles.field} htmlFor="contact-message">
        ¿Qué te gustaría conocer?
        <textarea id="contact-message" name="message" required rows={5} disabled={isSubmitting} />
      </label>
      <p className={styles.privacyHint}>No incluyas información clínica ni datos personales de residentes.</p>

      {status === 'success' && (
        <div aria-live="polite" className={styles.statusSuccess} role="status">
          <p>
            <CheckCircle2 aria-hidden="true" size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            {statusMessage}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div aria-live="assertive" className={styles.statusError} role="alert">
          <p>
            <AlertCircle aria-hidden="true" size={18} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            {statusMessage}
          </p>
        </div>
      )}

      <button className="button button-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            Enviando... <Loader2 aria-hidden="true" size={16} className="animate-spin" />
          </>
        ) : (
          <>
            Enviar consulta <ArrowRight aria-hidden="true" size={16} />
          </>
        )}
      </button>
    </form>
  )
}
