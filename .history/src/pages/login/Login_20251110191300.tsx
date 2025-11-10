import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initDb, seedDemoData } from "../../lib/db/indexeddb";
import { setSession } from "../../lib/auth/session";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users] = useState([
    { personalNr: "001", name: "Max Mustermann", role: "PKL" as const, icon: "👷" },
    { personalNr: "002", name: "Anna Schmidt", role: "PKL" as const, icon: "👷‍♀️" },
    { personalNr: "100", name: "Thomas Weber", role: "MA" as const, icon: "👔" },
  ]);
  const [selectedUser, setSelectedUser] = useState<string>("001");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // DB initialieren + Demo-Daten seedern
      await initDb();
      await seedDemoData();

      // Session setzen
      const user = users.find((u) => u.personalNr === selectedUser);
      if (user) {
        setSession({
          personalNr: user.personalNr,
          name: user.name,
          role: user.role,
        });

        // Redirect nach Rolle
        if (user.role === "PKL") {
          navigate("/pkl");
        } else {
          navigate("/ma");
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Fehler beim Anmelden. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const currentUser = users.find((u) => u.personalNr === selectedUser);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🎯</div>
          <h1>BembeConnect</h1>
          <p>Parkettleger Abrechnung & Management</p>
        </div>

        <div className="login-body">
          <label htmlFor="user-select" className="login-label">
            👤 Nutzer auswählen:
          </label>

          <div className="login-select-wrapper">
            <select
              id="user-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="login-select"
            >
              {users.map((user) => (
                <option key={user.personalNr} value={user.personalNr}>
                  {user.icon} {user.name} — {user.role}
                </option>
              ))}
            </select>
            <span className="login-select-icon">▼</span>
          </div>

          {currentUser && (
            <div className="login-preview">
              <div className="login-preview-icon">{currentUser.icon}</div>
              <div className="login-preview-text">
                <div className="login-preview-name">{currentUser.name}</div>
                <div className="login-preview-role">
                  {currentUser.role === "PKL" ? "🔨 Parkettleger" : "📊 Management"}
                </div>
              </div>
            </div>
          )}

          {error && <div className="login-error">⚠️ {error}</div>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`login-button ${loading ? "loading" : ""}`}
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span>
                <span>Wird angemeldet…</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Anmelden</span>
              </>
            )}
          </button>

          <div className="login-info">
            <p>Demo-Modus: Alle Nutzer sind vorkonfiguriert.</p>
            <p>IndexedDB wird lokal initialisiert mit Testdaten.</p>
          </div>
        </div>
      </div>

      <div className="login-footer">
        <p>© 2025 BembeConnect — Parkettleger Management System</p>
      </div>
    </div>
  );
}
