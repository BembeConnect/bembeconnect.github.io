// FILE: src/layout/RootLayout.tsx
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getSession } from '../lib/auth/session'
import styles from './RootLayout.module.css'
import HudBox from '../components/ui/HudBox'  // ← gleiches UI-Element wie Buttons

export default function RootLayout() {
  const navigate = useNavigate()
  const session = getSession()

  // Session-Check: Wenn nicht eingeloggt, zur Login-Seite
  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

  // Nicht rendern, wenn nicht eingeloggt
  if (!session) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <header className={`${styles.header} sticky top-0 z-20`}>
        {/* Topbar in HudBox, Hover aus */}
        <HudBox hover={false} padding="md" className="!py-0">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <Link to="/" className="font-semibold tracking-wide">
              BembeConnect
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
        </HudBox>
      </header>

      <main className={styles.main}>
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className="container mx-auto px-4 py-4">
          © {new Date().getFullYear()} BembeConnect
        </div>
      </footer>
    </div>
  )
}
