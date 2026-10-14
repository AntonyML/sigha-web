import type { ReactNode } from 'react'
import Link from 'next/link'
import MarketingNavigation from '@/modules/marketing/presentation/components/MarketingNavigation'
import StickyDemoCta from '@/modules/marketing/presentation/components/StickyDemoCta'
import { contactEmail, legalNavigation } from '@/modules/marketing/presentation/content/marketingContent'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-site">
      <header className="marketing-header">
        <div className="marketing-container marketing-header-inner">
          <Link aria-label="SIGHA, inicio" className="brand" href="/">
            <span aria-hidden="true" className="brand-mark">S</span>
            <span>SIGHA</span>
          </Link>
          <MarketingNavigation />
          <div className="marketing-header-actions">
            <Link className="login-link" href="/login">Iniciar sesión</Link>
            <Link className="button button-primary button-small" href="/contacto">Solicitar demo</Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="marketing-footer">
        <div className="marketing-container footer-main">
          <div>
            <Link aria-label="SIGHA, inicio" className="brand footer-brand" href="/">
              <span aria-hidden="true" className="brand-mark">S</span><span>SIGHA</span>
            </Link>
            <p>Información clara para coordinar mejor el cuidado de cada persona.</p>
          </div>
          <div className="footer-links">
            <span>Explora SIGHA</span>
            <Link href="/funcionalidades">Funcionalidades</Link>
            <Link href="/como-funciona">Cómo funciona</Link>
            <Link href="/planes">Planes</Link>
          </div>
          <div className="footer-links">
            <span>Atención</span>
            <Link href="/contacto">Contacto</Link>
            <Link href="/login">Acceso al sistema</Link>
            <a href={`mailto:${contactEmail}`}>Soporte</a>
          </div>
          <div className="footer-links">
            <span>Información</span>
            {legalNavigation.map(({ href, label }) => <Link href={href} key={href}>{label}</Link>)}
          </div>
        </div>
        <div className="marketing-container footer-bottom">
          <span>© {new Date().getFullYear()} SIGHA</span>
          <span>Plataforma del Sistema Integral de Gestión Holística y de Asistencia</span>
        </div>
      </footer>
      <StickyDemoCta />
    </div>
  )
}
