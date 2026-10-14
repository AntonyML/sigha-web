import Link from 'next/link'
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'

const values = [
  { icon: HeartHandshake, title: 'Cuidado centrado en la persona', copy: 'La información sirve para acompañar mejor el trabajo de atención.' },
  { icon: ShieldCheck, title: 'Responsabilidad con los datos', copy: 'Cada persona del equipo debe consultar lo que necesita para su función.' },
  { icon: Sparkles, title: 'Mejora paso a paso', copy: 'Los procesos pueden evolucionar con la experiencia del equipo y del centro.' },
]

export default function AboutPage() {
  return (
    <main>
      <section className="public-page-hero"><div className="marketing-container"><span className="eyebrow">Nosotros</span><h1>Una plataforma diseñada alrededor <span>del trabajo de cuidar.</span></h1><p>SIGHA acompaña la gestión holística y de asistencia conectando registros, atención y operación diaria.</p></div></section>
      <section className="section-padding"><div className="marketing-container about-intro"><div><span className="eyebrow">El propósito</span><h2>Hacer que la información ayude al equipo a estar presente.</h2></div><div><p>El trabajo de un centro implica coordinación entre muchas personas y áreas. SIGHA busca reducir la fragmentación de la información para que los equipos tengan más claridad al organizar la atención.</p><p>La plataforma reúne procesos administrativos y clínicos en un espacio común, con herramientas de seguimiento, roles y trazabilidad.</p></div></div></section>
      <section className="values-section section-padding"><div className="marketing-container"><div className="section-heading"><span className="eyebrow">Lo que guía el producto</span><h2>Principios sencillos, <span>decisiones más claras.</span></h2></div><div className="values-grid">{values.map(({ icon: Icon, title, copy }) => <article className="value-card" key={title}><span><Icon size={22} /></span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
      <section className="public-bottom-cta"><div className="marketing-container public-bottom-cta-inner"><div><h2>¿Quieres conocer más sobre SIGHA?</h2><p>Estamos disponibles para conversar sobre tu organización.</p></div><Link className="button button-primary" href="/contacto">Contactar <ArrowRight size={16} /></Link></div></section>
    </main>
  )
}
