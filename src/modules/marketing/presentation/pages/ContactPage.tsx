import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle } from 'lucide-react'
import ContactInquiryForm from '../components/ContactInquiryForm'
import { contactEmail } from '../content/marketingContent'

export default function ContactPage() {
  return (
    <main>
      <section className="public-page-hero">
        <div className="marketing-container">
          <span className="eyebrow">Contacto</span>
          <h1>Conversemos sobre <span>tu centro y tu equipo.</span></h1>
          <p>Cuéntanos qué procesos quieres organizar y te ayudamos a conocer el siguiente paso.</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="marketing-container contact-grid">
          <article className="contact-card">
            <span className="contact-icon"><Mail aria-hidden="true" size={22} /></span>
            <span className="eyebrow">Cuéntanos sobre tu organización</span>
            <h2>Solicita información</h2>
            <p>Completa el mensaje y abriremos un borrador en tu aplicación de correo para que lo revises y lo envíes.</p>
            <ContactInquiryForm />
            <small>También puedes escribir a <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</small>
          </article>
          <aside className="contact-aside">
            <span className="contact-icon contact-icon-soft"><MessageCircle aria-hidden="true" size={22} /></span>
            <h3>¿Qué podemos revisar?</h3>
            <ul>
              <li>Las áreas y procesos que usas hoy</li>
              <li>Los módulos que te interesa conocer</li>
              <li>La configuración para tu equipo</li>
              <li>La forma de iniciar una demostración</li>
            </ul>
            <p>Si ya tienes una cuenta de SIGHa, puedes entrar al espacio de trabajo.</p>
            <Link className="text-link" href="/login">Ir al inicio de sesión <ArrowRight aria-hidden="true" size={15} /></Link>
          </aside>
        </div>
      </section>
    </main>
  )
}
