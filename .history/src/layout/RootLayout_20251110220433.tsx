// FILE: src/layout/RootLayout.tsx
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getSession, clearSession } from '../lib/auth/session'
import styles from './RootLayout.module.css'
import HudBox from '../components/ui/HudBox'  // ← gleiches UI-Element wie Buttons

export default function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getSession()

  // Session-Check: Nur bei geschützten Routes redirect zur Login-Seite
  useEffect(() => {
    const protectedRoutes = ['/ma', '/pkl']
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route))
    
    if (!session && isProtectedRoute) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate, location.pathname])

  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

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

            <nav className="flex gap-6 text-sm items-center">
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? 'text-white' : 'text-slate-400 hover:text-white')}
              >
                Home
              </NavLink>

              <NavLink
                to="/ma"
                className={({ isActive }) => (isActive ? 'text-white' : 'text-slate-400 hover:text-white')}
              >
                MA
              </NavLink>

              <NavLink
                to="/pkl"
                className={({ isActive }) => (isActive ? 'text-white' : 'text-slate-400 hover:text-white')}
              >
                PKL
              </NavLink>

              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">{session.name}</span>

              <button
                onClick={handleLogout}
                className="ml-2 px-2 py-1 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition"
              >
                Logout
              </button>
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
