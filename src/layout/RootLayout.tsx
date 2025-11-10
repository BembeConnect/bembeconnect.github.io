// FILE: src/layout/RootLayout.tsx
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { getSession, clearSession } from '../lib/auth/session'
import styles from './RootLayout.module.css'
import Topbar from '../components/layout/Topbar'

export default function RootLayout() {
  const navigate = useNavigate()
  const session = getSession()

  // Session-Check: Wenn nicht eingeloggt, zur Login-Seite
  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

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
        <Topbar userName={session.name} onLogout={handleLogout} />
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
