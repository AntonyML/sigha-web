import type { ReactNode } from 'react'
import Link from 'next/link'

const navigation = [
  { href: '/funcionalidades', label: 'Funcionalidades' },
  { href: '/como-funciona', label: 'Cómo funciona' },
  { href: '/planes', label: 'Planes' },
  { href: '/nosotros', label: 'Nosotros' },
]

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-site">
      <header className="marketing-header">
        <div className="marketing-container marketing-header-inner">
          <Link aria-label="SIGHa, inicio" className="brand" href="/">
            <span aria-hidden="true" className="brand-mark">S</span>
            <span>SIGHa</span>
          </Link>
          <nav aria-label="Navegación principal" className="marketing-nav">
            {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>
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
            <Link aria-label="SIGHa, inicio" className="brand footer-brand" href="/">
              <span aria-hidden="true" className="brand-mark">S</span><span>SIGHa</span>
            </Link>
            <p>Información clara para coordinar mejor el cuidado de cada persona.</p>
          </div>
          <div className="footer-links">
            <span>Explora SIGHa</span>
            <Link href="/funcionalidades">Funcionalidades</Link>
            <Link href="/como-funciona">Cómo funciona</Link>
            <Link href="/planes">Planes</Link>
          </div>
          <div className="footer-links">
            <span>Atención</span>
            <Link href="/contacto">Contacto</Link>
            <Link href="/login">Acceso al sistema</Link>
            <a href="mailto:soporte@hogar-ancianos.com">Soporte</a>
          </div>
        </div>
        <div className="marketing-container footer-bottom">
          <span>© {new Date().getFullYear()} SIGHa</span>
          <span>Plataforma de gestión para hogares de larga estancia</span>
        </div>
      </footer>
    </div>
  )
}
