import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardPlus,
  HeartHandshake,
  HeartPulse,
  LockKeyhole,
  UsersRound,
} from 'lucide-react'

const capabilities = [
  {
    icon: ClipboardPlus,
    title: 'Expedientes conectados',
    copy: 'Consulta información personal y clínica desde un registro organizado y disponible para el equipo autorizado.',
  },
  {
    icon: CalendarDays,
    title: 'Atención coordinada',
    copy: 'Organiza citas, seguimientos y actividades de los equipos de enfermería y áreas especializadas.',
  },
  {
    icon: UsersRound,
    title: 'Un equipo alineado',
    copy: 'Da contexto a cada persona que participa en la atención, con funciones y accesos definidos.',
  },
]

export default function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="marketing-container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><HeartHandshake size={16} /> Tecnología para cuidar mejor</span>
            <h1>Más tiempo para cuidar. <span>Menos tiempo buscando información.</span></h1>
            <p className="hero-lead">
              SIGHa reúne la gestión de residentes, la atención clínica y la operación diaria del Sistema Integral de Gestión Holística y de Asistencia en un solo espacio de trabajo.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/contacto">Solicitar una demostración <ArrowRight size={17} /></Link>
              <Link className="button button-secondary" href="/funcionalidades">Explorar funcionalidades</Link>
            </div>
            <div className="hero-proof"><LockKeyhole size={16} /> Accesos por rol y seguimiento de actividad</div>
          </div>

          <div aria-label="Vista ilustrativa de la plataforma SIGHa" className="product-preview">
            <div className="preview-window">
              <div className="preview-topbar"><span className="preview-dots"><i /><i /><i /></span><span>SIGHa · Centro operacional</span><span className="preview-user">AM</span></div>
              <div className="preview-body">
                <aside className="preview-sidebar"><b>S</b><span className="active" /><span /><span /><span /><span /></aside>
                <div className="preview-main">
                  <div className="preview-greeting"><div><span>CENTRO OPERACIONAL</span><h3>Buenos días, Ana</h3><p>Resumen de la operación de hoy</p></div><div className="preview-avatar">AM</div></div>
                  <div className="preview-metrics">
                    <div><span>Residentes activos</span><b>128</b><small><i className="metric-dot blue" /> En el centro</small></div>
                    <div><span>Movimientos del día</span><b>16</b><small><i className="metric-dot green" /> Entradas y salidas</small></div>
                    <div><span>Notificaciones</span><b>08</b><small><i className="metric-dot amber" /> Pendientes</small></div>
                  </div>
                  <div className="preview-lower">
                    <div className="preview-agenda"><div className="preview-section-title"><b>Próximas atenciones</b><span>Ver agenda →</span></div><div className="agenda-row"><i className="agenda-icon blue-bg"><HeartPulse size={15} /></i><div><b>Control de enfermería</b><small>María R. · 9:30 a. m.</small></div><span>En 20 min</span></div><div className="agenda-row"><i className="agenda-icon green-bg"><CalendarDays size={15} /></i><div><b>Sesión de fisioterapia</b><small>José C. · 10:00 a. m.</small></div><span>En 50 min</span></div></div>
                    <div className="preview-activity"><div className="preview-section-title"><b>Actividad reciente</b><ChartNoAxesCombined size={16} /></div><div className="activity-line"><i className="activity-avatar av-blue">LC</i><span><b>Laura C.</b> actualizó un expediente<small>Hace 12 min</small></span></div><div className="activity-line"><i className="activity-avatar av-orange">JM</i><span><b>Jorge M.</b> registró una atención<small>Hace 35 min</small></span></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="preview-note"><span className="preview-note-icon"><HeartPulse size={17} /></span><span><b>Atención con contexto</b><small>La información acompaña al equipo.</small></span><span className="preview-note-check">✓</span></div>
          </div>
        </div>
        <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
      </section>

      <section className="trust-strip">
        <div className="marketing-container trust-inner"><span>Una plataforma para conectar las tareas esenciales del centro</span><div><b>Personas</b><i /> <b>Atención</b><i /> <b>Operación</b><i /> <b>Seguridad</b></div></div>
      </section>

      <section className="section-padding">
        <div className="marketing-container">
          <div className="section-heading"><span className="eyebrow">Una operación más clara</span><h2>El cuidado tiene muchas partes.<br /><span>La información debería estar conectada.</span></h2><p>Menos registros dispersos y más continuidad entre las personas, las atenciones y las tareas del equipo.</p></div>
          <div className="capability-grid">{capabilities.map(({ icon: Icon, title, copy }, index) => <article className="capability-card" key={title}><span className={`capability-icon capability-icon-${index + 1}`}><Icon size={21} /></span><span className="card-index">0{index + 1}</span><h3>{title}</h3><p>{copy}</p><Link href="/funcionalidades">Conocer más <ArrowRight size={15} /></Link></article>)}</div>
        </div>
      </section>

      <section className="workflow-section section-padding">
        <div className="marketing-container workflow-grid"><div className="workflow-art"><div className="workflow-card workflow-card-top"><span className="workflow-symbol symbol-teal"><UsersRound size={20} /></span><span><b>Equipo de atención</b><small>Información compartida</small></span><i>✓</i></div><div className="workflow-card workflow-card-middle"><span className="workflow-symbol symbol-purple"><ClipboardPlus size={20} /></span><span><b>Expediente del residente</b><small>Registro organizado</small></span><i>✓</i></div><div className="workflow-card workflow-card-bottom"><span className="workflow-symbol symbol-orange"><CalendarDays size={20} /></span><span><b>Atención programada</b><small>Seguimiento oportuno</small></span><i>✓</i></div><div className="workflow-connector connector-one" /><div className="workflow-connector connector-two" /></div><div className="workflow-copy"><span className="eyebrow">De la información a la acción</span><h2>El equipo comparte contexto. <span>El cuidado gana continuidad.</span></h2><p>Desde el ingreso de una persona hasta sus controles y seguimientos, SIGHa ayuda a que cada área consulte la información que necesita para realizar su trabajo.</p><ul><li><span>01</span> Registra una vez, consulta cuando hace falta.</li><li><span>02</span> Coordina las atenciones entre áreas.</li><li><span>03</span> Mantén trazabilidad sobre cambios y acciones.</li></ul><Link className="text-link" href="/como-funciona">Así funciona SIGHa <ArrowRight size={16} /></Link></div></div>
      </section>

      <section className="security-section section-padding"><div className="marketing-container security-grid"><div><span className="eyebrow">Privacidad desde el diseño</span><h2>La información sensible necesita <span>accesos responsables.</span></h2><p>Define funciones para cada integrante del equipo y conserva el registro de acciones importantes dentro de la plataforma.</p><Link className="text-link" href="/funcionalidades#seguridad">Conocer los controles de acceso <ArrowRight size={16} /></Link></div><div className="security-visual"><div className="security-shield"><LockKeyhole size={31} /></div><div className="security-bubble bubble-a">Acceso por rol <b>Activo</b></div><div className="security-bubble bubble-b">Actividad registrada <b>✓</b></div><div className="security-ring ring-outer" /><div className="security-ring ring-inner" /></div></div></section>

      <section className="final-cta-section"><div className="marketing-container final-cta"><div><span className="eyebrow">Conoce SIGHa</span><h2>Una conversación puede aclarar el siguiente paso.</h2><p>Cuéntanos cómo trabaja tu centro y conversemos sobre la plataforma.</p></div><Link className="button button-light" href="/contacto">Solicitar una demostración <ArrowRight size={17} /></Link></div></section>
    </main>
  )
}
