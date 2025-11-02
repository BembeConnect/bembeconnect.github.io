// FILE: src/components/layout/Topbar.tsx
import { Link, NavLink } from "react-router-dom";
import HudBox from "../../components/ui/HudBox";
import styles from "./Topbar.module.css";

export default function Topbar() {
  return (
    <div className={styles.stickyWrap}>
      <HudBox hover={false} padding="md" className={styles.topbar}>
        <div className={`container mx-auto px-4 ${styles.inner}`}>
          <Link to="/" className="font-semibold tracking-wide">
            BembeConnect
          </Link>

          <nav className="flex gap-6 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "text-white" : "text-slate-400")}
            >
              Home
            </NavLink>
            <NavLink
              to="/ma"
              className={({ isActive }) => (isActive ? "text-white" : "text-slate-400")}
            >
              MA
            </NavLink>
            <NavLink
              to="/pkl"
              className={({ isActive }) => (isActive ? "text-white" : "text-slate-400")}
            >
              PKL
            </NavLink>
          </nav>
        </div>
      </HudBox>
    </div>
  );
}
