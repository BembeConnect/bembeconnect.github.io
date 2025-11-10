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
            <Link to="/" className="font-semibold tracking-wide text-white no-underline">
              BembeConnect
            </Link>

            <nav className="flex gap-6 text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) => (isActive ? "text-white" : "text-slate-400 hover:text-white")}
              >
                Home
              </NavLink>
              <NavLink
                to="/ma"
                className={({ isActive }) => (isActive ? "text-white" : "text-slate-400 hover:text-white")}
              >
                MA
              </NavLink>
              <NavLink
                to="/pkl"
                className={({ isActive }) => (isActive ? "text-white" : "text-slate-400 hover:text-white")}
              >
                PKL
              </NavLink>
            </nav>
          </div>

          {/* Right: User */}
          <div className="flex items-center text-sm">
            {userName ? (
              <>
                <span className="text-slate-500">{"\u2022"}</span>
                <span className="text-xs text-slate-400 ml-2">{userName}</span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="ml-3 px-2 py-1 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded hover:bg-red-500/20 transition"
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
