import Link from 'next/link'
import { ArrowRight, LockKeyhole, ScrollText, UsersRound } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main>
      <section className="public-page-hero">
        <div className="marketing-container">
          <span className="eyebrow">Privacidad y seguridad</span>
          <h1>La información de cada organización requiere <span>accesos responsables.</span></h1>
          <p>Estos son los controles disponibles en SIGHa y el canal para consultar sobre el tratamiento de información.</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="marketing-container legal-page-grid">
          <article className="legal-page-card">
            <span className="legal-page-icon"><UsersRound size={22} /></span>
            <h2>Acceso por organización y función</h2>
            <p>La información de trabajo se consulta desde el espacio de la organización activa. Los permisos por rol y módulo determinan qué acciones puede realizar cada cuenta.</p>
          </article>
          <article className="legal-page-card">
            <span className="legal-page-icon"><ScrollText size={22} /></span>
            <h2>Registro de actividad</h2>
            <p>La plataforma ofrece paneles de auditoría para revisar actividad, eventos de seguridad y estado del sistema según los permisos de la cuenta.</p>
          </article>
          <article className="legal-page-card">
            <span className="legal-page-icon"><LockKeyhole size={22} /></span>
            <h2>Consultas sobre datos</h2>
            <p>Las consultas sobre finalidades, conservación, derechos y responsabilidades aplicables a una organización deben revisarse con el equipo responsable de esa organización.</p>
            <p>Para consultas sobre SIGHa, escribe a <a href="mailto:soporte@sigha.cr">soporte@sigha.cr</a>. No incluyas datos clínicos ni información identificable de residentes en el correo.</p>
          </article>
        </div>
      </section>
      <section className="public-bottom-cta" id="contact-cta">
        <div className="marketing-container public-bottom-cta-inner">
          <div><h2>¿Tienes una consulta sobre privacidad?</h2><p>Escríbenos sin incluir información personal de residentes.</p></div>
          <Link className="button button-primary" href="/contacto">Contactar a SIGHa <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  )
}
