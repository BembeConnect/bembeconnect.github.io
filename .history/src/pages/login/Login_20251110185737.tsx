import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initDb, seedDemoData } from "../../../lib/db/indexeddb";
import { setSession } from "../../../lib/auth/session";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([
    { personalNr: "001", name: "Max Mustermann", role: "PKL" as const },
    { personalNr: "002", name: "Anna Schmidt", role: "PKL" as const },
    { personalNr: "100", name: "Thomas Weber", role: "MA" as const },
  ]);
  const [selectedUser, setSelectedUser] = useState<string>("001");

  const handleLogin = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h1>BembeConnect — Login</h1>
      <p>Demo-Login: Wähle einen Nutzer aus</p>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="user-select" style={{ display: "block", marginBottom: "10px" }}>
          Nutzer:
        </label>
        <select
          id="user-select"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          {users.map((user) => (
            <option key={user.personalNr} value={user.personalNr}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "16px",
          backgroundColor: loading ? "#999" : "#0B1624",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Lädt..." : "Anmelden"}
      </button>
    </div>
  );
}
