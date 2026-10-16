import type { Metadata } from 'next'

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
      <div className="alert alert-info" role="status">
        La gestión de organizaciones y planes estará disponible en una próxima entrega.
      </div>
    </section>
  )
}
