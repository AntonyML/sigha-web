import Link from 'next/link'
import { ArrowRight, Eye, Keyboard, MessageSquareText } from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <main>
      <section className="public-page-hero">
        <div className="marketing-container">
          <span className="eyebrow">Accesibilidad</span>
          <h1>Una experiencia que busca ser <span>clara y utilizable.</span></h1>
          <p>Trabajamos para que la información y las acciones de SIGHA se puedan encontrar y usar con diferentes dispositivos y formas de navegación.</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="marketing-container legal-page-grid">
          <article className="legal-page-card">
            <span className="legal-page-icon"><Keyboard size={22} /></span>
            <h2>Navegación con teclado</h2>
            <p>Los controles interactivos de esta experiencia pública se pueden recorrer con teclado y muestran un indicador de foco.</p>
          </article>
          <article className="legal-page-card">
            <span className="legal-page-icon"><Eye size={22} /></span>
            <h2>Contenido legible</h2>
            <p>Usamos estructura de encabezados, etiquetas en formularios y controles con nombres accesibles. Las animaciones respetan la preferencia del sistema para reducir movimiento.</p>
          </article>
          <article className="legal-page-card">
            <span className="legal-page-icon"><MessageSquareText size={22} /></span>
            <h2>Ayúdanos a mejorar</h2>
            <p>Si encuentras una barrera para acceder a la información o completar una acción, cuéntanos qué página usabas y qué necesitabas hacer.</p>
            <Link href="/contacto">Enviar un comentario <ArrowRight aria-hidden="true" size={15} /></Link>
          </article>
        </div>
      </section>
      <section className="public-bottom-cta" id="contact-cta">
        <div className="marketing-container public-bottom-cta-inner">
          <div><h2>¿Encontraste una barrera de acceso?</h2><p>Cuéntanos cómo podemos mejorar esa experiencia.</p></div>
          <Link className="button button-primary" href="/contacto">Enviar un comentario <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  )
}
