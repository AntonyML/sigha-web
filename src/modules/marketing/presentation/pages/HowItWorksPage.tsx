import Link from 'next/link'
import { ArrowRight, ClipboardCheck, Layers3, MessagesSquare, ShieldCheck } from 'lucide-react'

const steps = [
  { icon: Layers3, title: 'Organiza la información', text: 'Centraliza el expediente y los registros de cada residente para que el equipo consulte una fuente común.' },
  { icon: MessagesSquare, title: 'Coordina las áreas', text: 'Comparte el contexto necesario entre enfermería, atención clínica y áreas de apoyo.' },
  { icon: ClipboardCheck, title: 'Registra la atención', text: 'Documenta consultas, actividades y seguimientos dentro de los procesos del centro.' },
  { icon: ShieldCheck, title: 'Revisa con trazabilidad', text: 'Consulta permisos, actividad y cambios para mantener una operación verificable.' },
]

export default function HowItWorksPage() {
  return (
    <main>
      <section className="public-page-hero"><div className="marketing-container"><span className="eyebrow">Cómo funciona</span><h1>Un flujo claro para <span>un trabajo complejo.</span></h1><p>SIGHA organiza el ciclo diario de información y atención sin perder de vista a la persona que recibe el cuidado.</p></div></section>
      <section className="section-padding"><div className="marketing-container steps-grid">{steps.map(({ icon: Icon, title, text }, index) => <article className="step-card" key={title}><span className="step-number">0{index + 1}</span><span className="step-icon"><Icon size={23} /></span><h2>{title}</h2><p>{text}</p></article>)}</div></section>
      <section className="quote-panel"><div className="marketing-container quote-panel-inner"><span>“</span><div><p>La tecnología funciona mejor cuando ayuda a que el equipo comparta información útil y dedique más atención a las personas.</p><small>El principio detrás de SIGHA</small></div></div></section>
      <section className="public-bottom-cta"><div className="marketing-container public-bottom-cta-inner"><div><h2>Conoce el flujo en una demostración.</h2><p>Revisamos contigo las áreas y procesos de tu centro.</p></div><Link className="button button-primary" href="/contacto">Hablemos <ArrowRight size={16} /></Link></div></section>
    </main>
  )
}
