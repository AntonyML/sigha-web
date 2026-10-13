import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow">Página no encontrada</p>
      <h1>No encontramos esta dirección</h1>
      <p>Verifica el enlace o vuelve al inicio de SIGHa.</p>
      <Link className="button button-primary" href="/">Ir al inicio</Link>
    </main>
  )
}
