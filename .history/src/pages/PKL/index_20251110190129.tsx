import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../lib/auth/session";
import { getOrdersByPersonalNr, type Order } from "../../lib/db/indexeddb";
import HudBox from "../../components/ui/HudBox";

export default function PKL() {
  const navigate = useNavigate();
  const session = getSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/login");
      return;
    }

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
  }, [session, navigate]);

  const handleSelectOrder = (orderId: string) => {
    navigate(`/pkl/abrechnung?orderId=${orderId}`);
  };

  if (!session) return null;
  if (loading) return <div style={{ padding: "20px" }}>Lädt...</div>;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">PKL - Baustellen</h1>
        <p className="text-slate-300 mt-2">Hallo {session.name}, wähle eine Baustelle aus:</p>
      </div>

      {orders.length === 0 ? (
        <HudBox padding="lg">
          <p className="text-slate-400">Keine Aufträge vorhanden.</p>
        </HudBox>
      ) : (
        <HudBox padding="lg">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #444" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Auftrags-Nr.</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Baustelle</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #333" }}>
                  <td style={{ padding: "10px" }}>{order.auftragsNr}</td>
                  <td style={{ padding: "10px" }}>{order.baustelle}</td>
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          order.status === "offen"
                            ? "#fbbf24"
                            : order.status === "in-bearbeitung"
                              ? "#60a5fa"
                              : "#34d399",
                        fontSize: "12px",
                        color: "#000",
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => handleSelectOrder(order.id)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#0B1624",
                        color: "white",
                        border: "1px solid #444",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Abrechnung
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </HudBox>
      )}
    </section>
  );
}
