// FILE: src/layout/RootLayout.tsx
import { Link, NavLink, Outlet } from 'react-router-dom'
import styles from './RootLayout.module.css'

export default function RootLayout() {
  return (
    <div className={styles.wrapper}>
      <header className={`${styles.header} sticky top-0 z-20`}>
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="font-semibold tracking-wide">
            bembe-app
          </Link>
          <nav className="flex gap-6 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'text-white' : 'text-slate-400')}
            >
              Home
            </NavLink>

            <NavLink
              to="/ma"
              className={({ isActive }) => (isActive ? 'text-white' : 'text-slate-400')}
            >
              MA
            </NavLink>

            <NavLink
              to="/pkl"
              className={({ isActive }) => (isActive ? 'text-white' : 'text-slate-400')}
            >
              PKL
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="container mx-auto px-4 py-4">
          © {new Date().getFullYear()} bembe-app
        </div>
      </footer>
    </div>
  )
}
