import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export default function PlansPage() {
  return (
    <main>
      <section className="public-page-hero"><div className="marketing-container"><span className="eyebrow">Planes y acompañamiento</span><h1>Una solución que parte <span>de tu forma de trabajar.</span></h1><p>La puesta en marcha depende de las áreas, el equipo y los procesos de cada organización. Por eso el primer paso es conocer tu operación.</p></div></section>
      <section className="section-padding"><div className="marketing-container plan-grid"><article className="plan-card"><span className="eyebrow">Implementación conversada</span><h2>Diseñemos el alcance juntos.</h2><p>Revisamos tus flujos de atención, usuarios y prioridades antes de proponer una configuración.</p><ul><li><Check size={17} /> Revisión de procesos actuales</li><li><Check size={17} /> Recorrido por los módulos</li><li><Check size={17} /> Alcance de configuración y adopción</li><li><Check size={17} /> Próximos pasos claros</li></ul><Link className="button button-primary" href="/contacto">Conversar con el equipo <ArrowRight size={16} /></Link></article><aside className="plan-note"><span className="plan-note-icon">i</span><h3>Precios claros requieren contexto.</h3><p>El número de usuarios, la configuración y el acompañamiento varían entre organizaciones. En la conversación inicial podemos entender lo que necesitas y preparar una propuesta adecuada.</p><a href="mailto:soporte@hogar-ancianos.com">Escríbenos directamente <ArrowRight size={15} /></a></aside></div></section>
    </main>
  )
}
