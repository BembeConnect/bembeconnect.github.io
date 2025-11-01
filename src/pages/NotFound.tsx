import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-slate-300">Seite nicht gefunden.</p>
      <Link to="/" className="inline-block rounded bg-slate-800 px-3 py-1">
        Zur Startseite
      </Link>
    </section>
  )
}
