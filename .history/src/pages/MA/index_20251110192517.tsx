// FILE: src/pages/MA/index.tsx
import { useState, useEffect } from "react";
import { getAllOrders, getAllSubmissions, type Submission } from "../../lib/db/indexeddb";
import HudBox from "../../components/ui/HudBox";
import "./ma.css";

type Tab = "orders" | "submissions";

export default function MA() {
  const session = getSession();
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state für neuen Auftrag
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    auftragsNr: "",
    baustelle: "",
    personalNr: "",
    datum: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    (async () => {
      try {
        const [ordersData, submissionsData] = await Promise.all([
          getAllOrders(),
          getAllSubmissions(),
        ]);
        setOrders(ordersData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Fehler beim Laden:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateOrder = async () => {
    if (!formData.auftragsNr || !formData.baustelle || !formData.personalNr) {
      alert("Bitte alle Felder füllen");
      return;
    }

    const { getAllOrders: reloadOrders, addOrder } = await import("../../lib/db/indexeddb");

    try {
      const newOrder = {
        id: `order-${Date.now()}`,
        auftragsNr: formData.auftragsNr,
        baustelle: formData.baustelle,
        personalNr: formData.personalNr,
        datum: formData.datum,
        status: "offen" as const,
      };

      await addOrder(newOrder);
      const updated = await reloadOrders();
      setOrders(updated);

      setFormData({
        auftragsNr: "",
        baustelle: "",
        personalNr: "",
        datum: new Date().toISOString().split("T")[0],
      });
      setShowForm(false);
      alert("✓ Auftrag erstellt!");
    } catch (error) {
      console.error("Fehler beim Erstellen:", error);
      alert("Fehler beim Erstellen des Auftrags");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ausstehend: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300",
      geprüft: "bg-blue-500/20 border-blue-500/40 text-blue-300",
      genehmigt: "bg-green-500/20 border-green-500/40 text-green-300",
      "mit-änderungen": "bg-orange-500/20 border-orange-500/40 text-orange-300",
    };
    return colors[status] || "bg-gray-500/20 border-gray-500/40 text-gray-300";
  };

  if (loading) return <div className="p-6">⏳ Lädt…</div>;

  return (
    <div className="ma-page">
      <h1 className="ma-title">📊 Management — Aufträge & Inbox</h1>

      {/* Tabs */}
      <div className="ma-tabs">
        <button
          className={`ma-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          🏗️ Aufträge
          <span className="ma-tab-badge">{orders.length}</span>
        </button>
        <button
          className={`ma-tab ${activeTab === "submissions" ? "active" : ""}`}
          onClick={() => setActiveTab("submissions")}
        >
          📮 Eingereichte Abrechnungen
          <span className="ma-tab-badge">{submissions.length}</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "orders" && (
        <div className="ma-content">
          <div className="ma-header">
            <h2>Parkettleger-Aufträge</h2>
            <button
              className="ma-btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "✕ Abbrechen" : "+ Neuer Auftrag"}
            </button>
          </div>

          {showForm && (
            <HudBox padding="lg" className="ma-form">
              <h3 className="mb-4 font-semibold">Neuen Auftrag erstellen</h3>
              <div className="ma-form-grid">
                <label>
                  <span>Auftrags-Nr.</span>
                  <input
                    type="text"
                    placeholder="z.B. A-2024-001"
                    value={formData.auftragsNr}
                    onChange={(e) => handleFormChange("auftragsNr", e.target.value)}
                    className="ma-form-input"
                  />
                </label>
                <label>
                  <span>Baustelle</span>
                  <input
                    type="text"
                    placeholder="z.B. Schulweg 5"
                    value={formData.baustelle}
                    onChange={(e) => handleFormChange("baustelle", e.target.value)}
                    className="ma-form-input"
                  />
                </label>
                <label>
                  <span>Personal-Nr. (PKL)</span>
                  <input
                    type="text"
                    placeholder="z.B. 001"
                    value={formData.personalNr}
                    onChange={(e) => handleFormChange("personalNr", e.target.value)}
                    className="ma-form-input"
                  />
                </label>
                <label>
                  <span>Datum</span>
                  <input
                    type="date"
                    value={formData.datum}
                    onChange={(e) => handleFormChange("datum", e.target.value)}
                    className="ma-form-input"
                  />
                </label>
              </div>
              <button
                className="ma-btn-primary mt-4 w-full"
                onClick={handleCreateOrder}
              >
                ✓ Auftrag erstellen
              </button>
            </HudBox>
          )}

          {orders.length === 0 ? (
            <HudBox padding="lg" className="text-center py-8">
              <p className="text-slate-400">📭 Keine Aufträge vorhanden</p>
            </HudBox>
          ) : (
            <div className="ma-orders-grid">
              {orders.map((order) => (
                <HudBox key={order.id} padding="lg" className="ma-order-card">
                  <div className="mb-3">
                    <p className="font-mono text-sm font-semibold">{order.auftragsNr}</p>
                    <p className="text-slate-300 text-sm">{order.baustelle}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>PKL: {order.personalNr}</span>
                    <span className={`px-2 py-1 rounded border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </HudBox>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "submissions" && (
        <div className="ma-content">
          <h2 className="mb-4">Eingereichte Abrechnungen</h2>

          {submissions.length === 0 ? (
            <HudBox padding="lg" className="text-center py-8">
              <p className="text-slate-400">📭 Keine Abrechnungen eingereicht</p>
            </HudBox>
          ) : (
            <div className="ma-submissions-grid">
              {submissions.map((submission) => (
                <HudBox key={submission.id} padding="lg" className="ma-submission-card">
                  <div className="mb-3">
                    <p className="font-semibold text-sm">Auftrag: {submission.auftragsId}</p>
                    <p className="text-slate-400 text-xs">von PKL {submission.personalNr}</p>
                  </div>
                  <div className="mb-3 text-xs text-slate-500">
                    <p>Eingereicht: {new Date(submission.submittedAt).toLocaleDateString("de-DE")}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded border text-xs ${getStatusBadge(submission.status)}`}>
                      {submission.status}
                    </span>
                    <button className="ma-btn-secondary text-xs">
                      Prüfen →
                    </button>
                  </div>
                </HudBox>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
