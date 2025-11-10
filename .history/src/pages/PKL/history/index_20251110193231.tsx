import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../lib/auth/session";
import { getSubmissionsByPersonalNr, type Submission } from "../../lib/db/indexeddb";
import HudBox from "../../components/ui/HudBox";
import "./history.css";

export default function PKLHistory() {
  const navigate = useNavigate();
  const session = getSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    (async () => {
      try {
        const data = await getSubmissionsByPersonalNr(session.personalNr);
        setSubmissions(data);
      } catch (error) {
        console.error("Fehler beim Laden:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ausstehend":
        return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300";
      case "geprüft":
        return "bg-blue-500/20 border-blue-500/40 text-blue-300";
      case "genehmigt":
        return "bg-green-500/20 border-green-500/40 text-green-300";
      case "mit-änderungen":
        return "bg-orange-500/20 border-orange-500/40 text-orange-300";
      default:
        return "bg-gray-500/20 border-gray-500/40 text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ausstehend":
        return "⏳";
      case "geprüft":
        return "👁️";
      case "genehmigt":
        return "✅";
      case "mit-änderungen":
        return "⚠️";
      default:
        return "❓";
    }
  };

  if (loading) return <div className="p-6">⏳ Lädt…</div>;

  return (
    <div className="pkl-history">
      <div className="pkl-history-header">
        <h1>📋 Meine eingereichten Abrechnungen</h1>
        <button
          className="pkl-history-back"
          onClick={() => navigate("/pkl")}
        >
          ← Zurück
        </button>
      </div>

      {submissions.length === 0 ? (
        <HudBox padding="lg" className="text-center py-8">
          <p className="text-slate-400">📭 Noch keine Abrechnungen eingereicht</p>
        </HudBox>
      ) : (
        <div className="pkl-history-grid">
          {submissions.map((submission) => (
            <HudBox
              key={submission.id}
              padding="lg"
              className="pkl-history-card"
            >
              <div className="pkl-history-card-header">
                <div>
                  <p className="pkl-history-card-title">
                    📄 {submission.auftragsId}
                  </p>
                  <p className="pkl-history-card-date">
                    {new Date(submission.submittedAt).toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={`pkl-history-badge ${getStatusColor(submission.status)}`}>
                  {getStatusIcon(submission.status)} {submission.status}
                </span>
              </div>

              {submission.notes && (
                <div className="pkl-history-notes">
                  <p className="pkl-history-notes-label">Notizen von MA:</p>
                  <p className="pkl-history-notes-text">{submission.notes}</p>
                </div>
              )}

              <div className="pkl-history-card-footer">
                <button
                  className="pkl-history-btn"
                  onClick={() => alert("PDF-Download wird noch implementiert")}
                >
                  ⬇️ PDF
                </button>
              </div>
            </HudBox>
          ))}
        </div>
      )}
    </div>
  );
}
