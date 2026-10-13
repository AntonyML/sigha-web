import Link from 'next/link'
import { ArrowRight, CalendarDays, ClipboardList, FileHeart, LockKeyhole, UsersRound } from 'lucide-react'

const features = [
  { id: 'residentes', icon: UsersRound, title: 'Gestión de residentes', text: 'Organiza expedientes y consulta la información de las personas atendidas desde un registro centralizado.' },
  { id: 'atencion', icon: CalendarDays, title: 'Atenciones y seguimientos', text: 'Coordina citas, consultas y actividades de los equipos clínicos y profesionales.' },
  { id: 'expediente', icon: FileHeart, title: 'Información clínica', text: 'Conecta expedientes, antecedentes, medicamentos y registros de atención.' },
  { id: 'operacion', icon: ClipboardList, title: 'Operación diaria', text: 'Da seguimiento a ingresos, salidas, notificaciones y tareas frecuentes del centro.' },
  { id: 'seguridad', icon: LockKeyhole, title: 'Acceso y trazabilidad', text: 'Asigna permisos por módulo y rol y conserva un historial de actividad relevante.' },
]

export default function FeaturesPage() {
  return (
    <main>
      <section className="public-page-hero"><div className="marketing-container"><span className="eyebrow">Funcionalidades</span><h1>Las piezas de la operación, <span>en un mismo lugar.</span></h1><p>Herramientas para mantener conectados los registros, la agenda de atención y el trabajo de cada área.</p></div></section>
      <section className="section-padding"><div className="marketing-container features-list">{features.map(({ id, icon: Icon, title, text }, index) => <article className="feature-row" id={id} key={id}><div className="feature-row-number">0{index + 1}</div><div className="feature-row-icon"><Icon size={25} /></div><div><h2>{title}</h2><p>{text}</p></div><span className="feature-row-arrow"><ArrowRight size={18} /></span></article>)}</div></section>
      <section className="public-bottom-cta"><div className="marketing-container public-bottom-cta-inner"><div><h2>¿Quieres ver cómo encaja con tu operación?</h2><p>Conversemos sobre las necesidades de tu equipo.</p></div><Link className="button button-primary" href="/contacto">Solicitar una demo <ArrowRight size={16} /></Link></div></section>
    </main>
  )
}
