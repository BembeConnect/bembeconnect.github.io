// FILE: src/components/layout/Topbar.tsx
import { Link, NavLink } from "react-router-dom";
import HudBox from "../../components/ui/HudBox";
import styles from "./Topbar.module.css";

export type TopbarProps = {
  userName?: string;
  onLogout?: () => void;
};

export default function Topbar({ userName, onLogout }: TopbarProps) {
  return (
    <div className={styles.stickyWrap}>
      <HudBox hover={false} padding="md" className={styles.topbar}>
        <div className={`container mx-auto px-4 ${styles.inner}`}>
          {/* Left: Brand + Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className={`font-semibold tracking-wide ${styles.brandGradient}`}>
              BembeConnect
            </Link>

            <nav className={styles.nav}>
              <NavLink to="/" end className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                Home
              </NavLink>
              <NavLink to="/ma" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                MA
              </NavLink>
              <NavLink to="/pkl" className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                PKL
              </NavLink>
            </nav>
          </div>

          {/* Right: User */}
          <div className="flex items-center text-sm">
            {userName ? (
              <>
                <span style={{ color: "#64748b" }}>{"\u2022"}</span>
                <span className="ml-2" style={{ color: "#94a3b8", fontSize: 12 }}>{userName}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="ml-3 px-2 py-1 text-xs rounded transition"
                    style={{
                      background: "rgba(239, 68, 68, 0.10)",
                      border: "1px solid rgba(239, 68, 68, 0.30)",
                      color: "#f87171",
                    }}
                  >
                    Logout
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </HudBox>
    </div>
  );
}
