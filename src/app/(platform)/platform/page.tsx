import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Plataforma',
}

export default function PlatformHomePage() {
  return (
    <section aria-labelledby="platform-heading">
      <h1 id="platform-heading" className="h3">
        Plano de plataforma
      </h1>
      <p className="text-muted">
        Gestión SaaS de SIGHA: organizaciones, planes y estado del servicio.
      </p>
      <Link className="btn btn-primary" href="/platform/organizations">
        Gestionar organizaciones
      </Link>
    </section>
  )
}
