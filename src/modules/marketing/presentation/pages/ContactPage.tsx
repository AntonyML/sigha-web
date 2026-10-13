import Link from 'next/link'
import { ArrowRight, Mail, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <main>
      <section className="public-page-hero"><div className="marketing-container"><span className="eyebrow">Contacto</span><h1>Conversemos sobre <span>tu hogar y tu equipo.</span></h1><p>Cuéntanos qué procesos quieres organizar y te ayudamos a conocer el siguiente paso.</p></div></section>
      <section className="section-padding"><div className="marketing-container contact-grid"><article className="contact-card"><span className="contact-icon"><Mail size={22} /></span><span className="eyebrow">Correo electrónico</span><h2>Escríbenos</h2><p>Cuéntanos sobre tu organización, las áreas que quieres conectar y cómo podemos ayudarte.</p><a className="button button-primary" href="mailto:soporte@hogar-ancianos.com?subject=Consulta%20sobre%20SIGHa">Enviar un correo <ArrowRight size={16} /></a><small>soporte@hogar-ancianos.com</small></article><aside className="contact-aside"><span className="contact-icon contact-icon-soft"><MessageCircle size={22} /></span><h3>¿Qué podemos revisar?</h3><ul><li>Las áreas y procesos que usas hoy</li><li>Los módulos que te interesa conocer</li><li>La configuración para tu equipo</li><li>La forma de iniciar una demostración</li></ul><p>Si ya tienes una cuenta de SIGHa, puedes entrar al espacio de trabajo.</p><Link className="text-link" href="/login">Ir al inicio de sesión <ArrowRight size={15} /></Link></aside></div></section>
    </main>
  )
}
