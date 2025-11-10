// src/pages/PKL/abrechnung/index.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PdfPreviewCanvas from "../../../components/pdf/PdfPreviewCanvas";
import { setupPdfJsWorker } from "../../../lib/pdf/worker";
import { fillImageTemplate } from "../../../lib/pdf/fillImageTemplate";
import { pklMapping, initialPklData, type PklData } from "./mapping";
import { getSession } from "../../../lib/auth/session";
import { getOrderById, addSubmission, type Order, type Submission } from "../../../lib/db/indexeddb";
import "./index.css";

const BACKGROUND_URL = "/bembeconnect.github.io/templates/PKL/pkl-bg.png";

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

export default function PKLAbrechnungPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = getSession();
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState("Seite wird vorbereitet…");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const [form, setForm] = useState<PklData>(initialPklData);

  const bgBufRef = useRef<ArrayBuffer | null>(null);
  const [bgReady, setBgReady] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Authentifizierung (ProtectedRoute stellt sicher, dass session existiert)
  useEffect(() => {
    if (!session) return;

    // Auftrag sofort laden wenn session und orderId vorhanden
    if (!orderId) {
      setError("Keine Auftrags-ID vorhanden");
      return;
    }

    (async () => {
      try {
        const o = await getOrderById(orderId);
        if (!o) {
          setError("Auftrag nicht gefunden");
          return;
        }
        setOrder(o);
        setForm((prev) => ({
          ...prev,
          auftragsNr: o.auftragsNr,
          baustelle: o.baustelle,
          personalNr: session.personalNr,
          name: session.name,
        }));
        setStatus("Auftrag geladen");
      } catch (e: any) {
        setError(e?.message ?? "Fehler beim Laden des Auftrags");
      }
    })();
  }, [orderId, session]);

  // PDF.js Worker
  useEffect(() => {
    setupPdfJsWorker();
  }, []);

  // Hintergrund laden
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Hintergrund wird geladen …");
        const buf = await fetchAsArrayBuffer(BACKGROUND_URL);
        if (!cancelled) {
          bgBufRef.current = buf;
          setBgReady(true);
          setStatus("Bereit zur Abrechnung");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Vorschau erzeugen
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!bgBufRef.current) return;
        setStatus("Erzeuge Vorschau …");
        const blob = await fillImageTemplate(bgBufRef.current, form, pklMapping);
        if (!cancelled) {
          setPdfBlob(blob);
          setStatus("Vorschau aktuell");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bgReady, form]);

  const downloadPdf = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PKL-Abrechnung-ausgefüllt.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitAbrechnung = async () => {
    if (!session || !orderId) {
      setError("Session oder Auftrag fehlt");
      return;
    }

    setSubmitting(true);
    try {
      const submission: Submission = {
        id: `submission-${Date.now()}`,
        auftragsId: orderId,
        personalNr: session.personalNr,
        formData: form,
        submittedAt: new Date().toISOString(),
        status: "ausstehend",
      };

      await addSubmission(submission);
      setStatus("✓ Abrechnung erfolgreich eingereicht!");
      setTimeout(() => {
        navigate("/pkl");
      }, 2000);
    } catch (e: any) {
      setError(e?.message ?? "Fehler beim Einreichen");
    } finally {
      setSubmitting(false);
    }
  };

  const onChange = (key: keyof PklData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (!session) return null;
  if (!order && orderId) return <div className="p-4">Lädt Auftrag…</div>;

  return (
    <div className="pkl-layout">
      <div className="pkl-panel">
        <h1 className="pkl-title">PKL · Abrechnung</h1>
        {order && <p className="text-xs text-gray-500 mb-2">Auftrag: {order.auftragsNr}</p>}
        <p className={`pkl-status ${error ? "text-red-500" : "text-gray-600"}`}>
          {status}
          {error ? ` — ⚠ ${error}` : ""}
        </p>

        <div className="pkl-form-grid">
          <label className="pkl-label">
            <span>Name</span>
            <input className="pkl-input" value={form.name} onChange={onChange("name")} />
          </label>

          <label className="pkl-label">
            <span>Personal-Nr.</span>
            <input className="pkl-input" value={form.personalNr} onChange={onChange("personalNr")} />
          </label>

          <label className="pkl-label">
            <span>VB-Nr.</span>
            <input className="pkl-input" value={form.vbNr} onChange={onChange("vbNr")} />
          </label>

          <label className="pkl-label">
            <span>Auftrags-Nr.</span>
            <input className="pkl-input" value={form.auftragsNr} onChange={onChange("auftragsNr")} />
          </label>

          <label className="pkl-label">
            <span>Studio</span>
            <input className="pkl-input" value={form.studio} onChange={onChange("studio")} />
          </label>

          <label className="pkl-label">
            <span>Baustelle</span>
            <input className="pkl-input" value={form.baustelle} onChange={onChange("baustelle")} />
          </label>
        </div>

        <div className="pkl-actions">
          <button
            className="pkl-btn pkl-btn-secondary"
            onClick={downloadPdf}
            disabled={!pdfBlob}
          >
            📄 PDF anschauen
          </button>
          <button
            className="pkl-btn pkl-btn-primary"
            onClick={submitAbrechnung}
            disabled={submitting}
          >
            {submitting ? "⏳ Wird eingereicht…" : "✓ Abschicken"}
          </button>
          <button
            className="pkl-btn pkl-btn-secondary"
            onClick={() => navigate("/pkl")}
          >
            ← Zurück
          </button>
        </div>

        {coords && <div className="pkl-coords">Letzter Klick: X {coords.x}, Y {coords.y}</div>}
      </div>

      <div className="pkl-preview-wrap">
        <div className="pkl-preview-inner">
          {pdfBlob ? (
            <PdfPreviewCanvas
              pdfBlob={pdfBlob}
              onClickCoords={(x, y) => {
                setCoords({ x, y });
                console.info("[PKL] PDF coords:", x, y);
              }}
            />
          ) : (
            <div className="pkl-placeholder">
              Vorschau noch nicht verfügbar…
              <div className="text-sm mt-2">{status}</div>
              {error && <div className="text-red-500 text-sm mt-1">Fehler: {error}</div>}
            </div>
          )}
          {coords && <div className="pkl-fab">X {coords.x}, Y {coords.y}</div>}
        </div>
      </div>
    </div>
  );
}
