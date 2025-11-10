import { useState } from "react";
import { Submission, updateSubmission } from "../../lib/db/indexeddb";
import "./SubmissionReviewModal.css";

interface SubmissionReviewModalProps {
  submission: Submission | null;
  onClose: () => void;
  onUpdate: (submission: Submission) => void;
}

export default function SubmissionReviewModal({
  submission,
  onClose,
  onUpdate,
}: SubmissionReviewModalProps) {
  const [status, setStatus] = useState<Submission["status"]>(submission?.status || "ausstehend");
  const [notes, setNotes] = useState(submission?.notes || "");
  const [saving, setSaving] = useState(false);

  if (!submission) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated: Submission = {
        ...submission,
        status,
        notes,
        changedAt: new Date().toISOString(),
      };
      await updateSubmission(updated);
      onUpdate(updated);
      onClose();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (s: Submission["status"]) => {
    switch (s) {
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

  return (
    <div className="submission-modal-overlay" onClick={onClose}>
      <div className="submission-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="submission-modal-header">
          <h2>📋 Abrechnung prüfen</h2>
          <button className="submission-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="submission-modal-body">
          {/* Info Section */}
          <div className="submission-info">
            <div className="submission-info-row">
              <span className="label">Auftrag:</span>
              <span className="value">{submission.auftragsId}</span>
            </div>
            <div className="submission-info-row">
              <span className="label">Von PKL:</span>
              <span className="value">{submission.personalNr}</span>
            </div>
            <div className="submission-info-row">
              <span className="label">Eingereicht:</span>
              <span className="value">
                {new Date(submission.submittedAt).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Form Data Display */}
          <div className="submission-formdata">
            <h3>Eingefüllte Daten:</h3>
            <div className="submission-formdata-grid">
              {Object.entries(submission.formData).map(([key, value]) => (
                <div key={key} className="submission-formdata-item">
                  <span className="field-label">{key}:</span>
                  <span className="field-value">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div className="submission-status-select">
            <label>Status:</label>
            <div className="submission-status-buttons">
              {(["ausstehend", "geprüft", "genehmigt", "mit-änderungen"] as const).map((s) => (
                <button
                  key={s}
                  className={`status-button ${status === s ? "active" : ""}`}
                  onClick={() => setStatus(s)}
                >
                  <span className="icon">{getStatusIcon(s)}</span>
                  <span className="label">{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="submission-notes">
            <label htmlFor="notes">Notizen/Änderungen:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Bitte Quadratmeter nochmal prüfen..."
              rows={4}
              className="submission-notes-input"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="submission-modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Abbrechen
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "⏳ Speichert…" : "✓ Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
