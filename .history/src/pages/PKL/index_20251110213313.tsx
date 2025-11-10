import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../lib/auth/session";
import { getOrdersByPersonalNr, type Order } from "../../lib/db/indexeddb";
import HudBox from "../../components/ui/HudBox";
import "./pkl.css";

export default function PKL() {
  const navigate = useNavigate();
  const session = getSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ProtectedRoute stellt sicher, dass session existiert
    if (!session) return;

    (async () => {
      try {
        const data = await getOrdersByPersonalNr(session.personalNr);
        setOrders(data);
      } catch (error) {
        console.error("Fehler beim Laden der Aufträge:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "offen":
        return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300";
      case "in-bearbeitung":
        return "bg-blue-500/20 border-blue-500/40 text-blue-300";
      case "abgeschlossen":
        return "bg-green-500/20 border-green-500/40 text-green-300";
      default:
        return "bg-gray-500/20 border-gray-500/40 text-gray-300";
    }
  };

  if (!session) return null;
  if (loading) return <div className="p-6">⏳ Lädt Aufträge…</div>;

  return (
    <section className="pkl-page">
      <div className="pkl-header">
        <h1>👷 PKL - Baustellen</h1>
        <p>Hallo <strong>{session.name}</strong>, wähle eine Baustelle aus:</p>
        <button
          className="pkl-history-link"
          onClick={() => navigate("/pkl/history")}
          title="Deine eingereichten Abrechnungen ansehen"
        >
          📋 Meine Abrechnungen
        </button>
      </div>

      {orders.length === 0 ? (
        <HudBox padding="lg">
          <div className="text-center py-8">
            <p className="text-slate-400">📦 Keine Aufträge vorhanden.</p>
          </div>
        </HudBox>
      ) : (
        <HudBox padding="lg">
          {/* Desktop Table */}
          <div className="pkl-table-desktop">
            <table>
              <thead>
                <tr>
                  <th>Auftrags-Nr.</th>
                  <th>Baustelle</th>
                  <th>Status</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-sm">{order.auftragsNr}</td>
                    <td>{order.baustelle}</td>
                    <td>
                      <span className={`pkl-status-badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/pkl/abrechnung?orderId=${order.id}`)}
                        className="pkl-action-btn"
                      >
                        📋 Abrechnung
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="pkl-cards-mobile">
            {orders.map((order) => (
              <div key={order.id} className="pkl-card">
                <div className="pkl-card-header">
                  <div>
                    <p className="pkl-card-title">{order.auftragsNr}</p>
                    <p className="pkl-card-location">{order.baustelle}</p>
                  </div>
                  <span className={`pkl-status-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/pkl/abrechnung?orderId=${order.id}`)}
                  className="pkl-card-btn"
                >
                  📋 Abrechnung erstellen
                </button>
              </div>
            ))}
          </div>
        </HudBox>
      )}
    </section>
  );
}
