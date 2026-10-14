import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ModuleCatalog from '../components/ModuleCatalog'

export default function FeaturesPage() {
  return (
    <main>
      <section className="public-page-hero">
        <div className="marketing-container">
          <span className="eyebrow">Funcionalidades</span>
          <h1>Las piezas de la operación, <span>en un mismo lugar.</span></h1>
          <p>Explora los módulos por área y encuentra herramientas para organizar registros, atenciones y tareas del centro.</p>
        </div>
      </section>
      <section aria-label="Catálogo de módulos de SIGHA" className="section-padding">
        <div className="marketing-container">
          <ModuleCatalog />
        </div>
      </section>
      <section className="public-bottom-cta" id="contact-cta">
        <div className="marketing-container public-bottom-cta-inner">
          <div>
            <h2>¿Quieres ver cómo encaja con tu operación?</h2>
            <p>Conversemos sobre las necesidades de tu equipo.</p>
          </div>
          <Link className="button button-primary" href="/contacto">Solicitar una demo <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </section>
    </main>
  )
}
