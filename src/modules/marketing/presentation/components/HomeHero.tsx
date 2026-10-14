import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import HeroAmbient from './HeroAmbient'
import { stagger } from './stagger'
import shared from './shared.module.css'
import styles from './HomeHero.module.css'

export default function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="hero-section">
      <HeroAmbient />
      <div className="marketing-container hero-grid">
        <div className="hero-copy">
          <span className={`${styles.badge} ${shared.enter}`} style={stagger(0)}>
            <span aria-hidden="true" className={styles.pulse} />
            Tecnología para cuidar mejor
          </span>
          <h1 className={shared.enter} id="hero-title" style={stagger(1)}>
            Más tiempo para cuidar. <span className={styles.accent}>Menos tiempo buscando información.</span>
          </h1>
          <p className={`hero-lead ${shared.enter}`} style={stagger(2)}>
            SIGHa reúne la gestión de residentes, la atención clínica y la operación diaria del Sistema Integral de Gestión Holística y de Asistencia en un solo espacio de trabajo.
          </p>
          <div className={`hero-actions ${shared.enter}`} style={stagger(3)}>
            <Link className="button button-primary" href="/contacto">
              Solicitar una demostración <ArrowRight size={17} />
            </Link>
            <Link className="button button-secondary" href="/funcionalidades">Explorar funcionalidades</Link>
          </div>
          <div className={`hero-proof ${shared.enter}`} style={stagger(4)}>
            <LockKeyhole size={16} /> Accesos por rol y seguimiento de actividad
          </div>
        </div>

        <div
          aria-label="Vista de ejemplo de SIGHa con datos ficticios"
          className={`product-preview ${shared.enterRight}`}
          role="img"
        >
          <div className={styles.chip}>
            <span className={styles.chipIcon}><ShieldCheck size={16} /></span>
            <span>
              <b className={styles.chipTitle}>Cada rol, su acceso</b>
              <small className={styles.chipHint}>Permisos por módulo</small>
            </span>
          </div>
          <div className="preview-window">
            <div className="preview-topbar">
              <span className="preview-dots"><i /><i /><i /></span>
              <span>Vista de ejemplo · datos ilustrativos</span>
              <span className="preview-user">AM</span>
            </div>
            <div className="preview-body">
              <aside className="preview-sidebar"><b>S</b><span className="active" /><span /><span /><span /><span /></aside>
              <div className="preview-main">
                <div className="preview-greeting">
                  <div>
                    <span>CENTRO OPERACIONAL</span>
                    <h3>Buenos días, Ana</h3>
                    <p>Resumen de la operación de hoy</p>
                  </div>
                  <div className="preview-avatar">AM</div>
                </div>
                <div className="preview-metrics">
                  <div><span>Residentes activos</span><b>128</b><small><i className="metric-dot blue" /> En el centro</small></div>
                  <div><span>Movimientos del día</span><b>16</b><small><i className="metric-dot green" /> Entradas y salidas</small></div>
                  <div><span>Notificaciones</span><b>08</b><small><i className="metric-dot amber" /> Pendientes</small></div>
                </div>
                <div className="preview-lower">
                  <div className="preview-agenda">
                    <div className="preview-section-title"><b>Próximas atenciones</b><span>Ver agenda →</span></div>
                    <div className="agenda-row">
                      <i className="agenda-icon blue-bg"><HeartPulse size={15} /></i>
                      <div><b>Control de enfermería</b><small>María R. · 9:30 a. m.</small></div>
                      <span>En 20 min</span>
                    </div>
                    <div className="agenda-row">
                      <i className="agenda-icon green-bg"><CalendarDays size={15} /></i>
                      <div><b>Sesión de fisioterapia</b><small>José C. · 10:00 a. m.</small></div>
                      <span>En 50 min</span>
                    </div>
                  </div>
                  <div className="preview-activity">
                    <div className="preview-section-title"><b>Actividad reciente</b><ChartNoAxesCombined size={16} /></div>
                    <div className="activity-line">
                      <i className="activity-avatar av-blue">LC</i>
                      <span><b>Laura C.</b> actualizó un expediente<small>Hace 12 min</small></span>
                    </div>
                    <div className="activity-line">
                      <i className="activity-avatar av-orange">JM</i>
                      <span><b>Jorge M.</b> registró una atención<small>Hace 35 min</small></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="preview-note">
            <span className="preview-note-icon"><HeartPulse size={17} /></span>
            <span><b>Atención con contexto</b><small>La información acompaña al equipo.</small></span>
            <span className="preview-note-check">✓</span>
          </div>
        </div>
      </div>
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
    </section>
  )
}
