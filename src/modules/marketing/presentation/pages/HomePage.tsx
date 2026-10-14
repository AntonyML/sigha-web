import Link from 'next/link'
import { ArrowRight, CalendarDays, ClipboardPlus, LockKeyhole, UsersRound } from 'lucide-react'
import FaqSection from '../components/FaqSection'
import HomeHero from '../components/HomeHero'
import ModuleMarquee from '../components/ModuleMarquee'
import StatsStrip from '../components/StatsStrip'
import { featureAreas } from '../content/marketingContent'

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <StatsStrip />
      <ModuleMarquee />

      <section aria-labelledby="connected-care-title" className="section-padding">
        <div className="marketing-container">
          <div className="section-heading">
            <span className="eyebrow">Una operación más clara</span>
            <h2 id="connected-care-title">
              El cuidado tiene muchas partes.<br />
              <span>La información debería estar conectada.</span>
            </h2>
            <p>Consulta los módulos por área y conoce cómo se relacionan las tareas del equipo.</p>
          </div>
          <div className="capability-grid">
            {featureAreas.map(({ id, icon: Icon, title, text, moduleIds }, index) => (
              <article className="capability-card" key={id}>
                <span className={`capability-icon capability-icon-${(index % 3) + 1}`}><Icon aria-hidden="true" size={21} /></span>
                <span className="card-index">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <Link href={`/funcionalidades#${moduleIds[0]}`}>Conocer módulos <ArrowRight aria-hidden="true" size={15} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow-title" className="workflow-section section-padding">
        <div className="marketing-container workflow-grid">
          <div aria-hidden="true" className="workflow-art">
            <div className="workflow-card workflow-card-top"><span className="workflow-symbol symbol-teal"><UsersRound size={20} /></span><span><b>Equipo de atención</b><small>Información organizada</small></span><i>✓</i></div>
            <div className="workflow-card workflow-card-middle"><span className="workflow-symbol symbol-purple"><ClipboardPlus size={20} /></span><span><b>Expediente del residente</b><small>Registro consultable</small></span><i>✓</i></div>
            <div className="workflow-card workflow-card-bottom"><span className="workflow-symbol symbol-orange"><CalendarDays size={20} /></span><span><b>Atención programada</b><small>Seguimiento oportuno</small></span><i>✓</i></div>
            <div className="workflow-connector connector-one" />
            <div className="workflow-connector connector-two" />
          </div>
          <div className="workflow-copy">
            <span className="eyebrow">De la información a la acción</span>
            <h2 id="workflow-title">El equipo comparte contexto. <span>El cuidado gana continuidad.</span></h2>
            <p>Desde el ingreso de una persona hasta sus controles y seguimientos, SIGHA ayuda a que cada área consulte la información que necesita para realizar su trabajo.</p>
            <ul>
              <li><span>01</span> Organiza registros en un espacio de trabajo.</li>
              <li><span>02</span> Coordina las atenciones entre áreas.</li>
              <li><span>03</span> Consulta actividad y cambios registrados.</li>
            </ul>
            <Link className="text-link" href="/como-funciona">Así funciona SIGHA <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="security-title" className="security-section section-padding">
        <div className="marketing-container security-grid">
          <div>
            <span className="eyebrow">Acceso y trazabilidad</span>
            <h2 id="security-title">La información sensible necesita <span>accesos responsables.</span></h2>
            <p>Define funciones para cada integrante del equipo y conserva el registro de acciones importantes dentro de la plataforma.</p>
            <Link className="text-link" href="/funcionalidades#auditoria">Conocer los controles disponibles <ArrowRight aria-hidden="true" size={16} /></Link>
          </div>
          <div aria-hidden="true" className="security-visual">
            <div className="security-shield"><LockKeyhole size={31} /></div>
            <div className="security-bubble bubble-a">Acceso por rol <b>Disponible</b></div>
            <div className="security-bubble bubble-b">Actividad registrada <b>✓</b></div>
            <div className="security-ring ring-outer" />
            <div className="security-ring ring-inner" />
          </div>
        </div>
      </section>

      <FaqSection />

      <section aria-labelledby="contact-cta-title" className="final-cta-section" id="contact-cta">
        <div className="marketing-container final-cta">
          <div>
            <span className="eyebrow">Conoce SIGHA</span>
            <h2 id="contact-cta-title">Una conversación puede aclarar el siguiente paso.</h2>
            <p>Cuéntanos cómo trabaja tu centro y conversemos sobre la plataforma.</p>
          </div>
          <Link className="button button-light" href="/contacto">Solicitar una demostración <ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
      </section>
    </main>
  )
}
