// src/pages/PKL/abrechnung/index.tsx
import React, { useEffect, useRef, useState } from "react";
import PdfPreviewCanvas from "../../../components/pdf/PdfPreviewCanvas";
import { setupPdfJsWorker } from "../../../lib/pdf/worker";
import { fillImageTemplate } from "../../../lib/pdf/fillImageTemplate";
import { pklMapping, initialPklData, type PklData } from "./mapping";
import "./index.css";

const BACKGROUND_URL = "/templates/PKL/pkl-bg.png";

// --- Hilfen ---
async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return await res.arrayBuffer();
}

export default function PKLAbrechnungPage() {
  const [status, setStatus] = useState("Seite ist eingerichtet.");
  const [error, setError] = useState<string | null>(null);

  // Formular-Daten (alles in einem Objekt; simpel zu erweitern)
  const [form, setForm] = useState<PklData>(initialPklData);

  // Template & Ausgabe
  const bgBufRef = useRef<ArrayBuffer | null>(null);
  const [bgReady, setBgReady] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Dev: letzte Klick-Koordinaten
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  // PDF.js Worker setzen
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
          setStatus("Hintergrund geladen.");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Vorschau erzeugen (bei erstem Laden + bei Änderungen im Formular)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!bgBufRef.current) return;
        setStatus("Erzeuge Vorschau …");
        const blob = await fillImageTemplate(bgBufRef.current, form, pklMapping);
        if (!cancelled) {
          setPdfBlob(blob);
          setStatus("Vorschau aktuell.");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? String(e));
      }
    })();
    return () => { cancelled = true; };
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

  const onChange = (key: keyof PklData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="pkl-layout">
      {/* Linke Spalte: Eingaben */}
      <div className="pkl-panel">
        <h1 className="pkl-title">PKL · Abrechnung</h1>
        <p className="pkl-status">
          {status}{error ? ` — Fehler: ${error}` : ""}
        </p>

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

        <div className="pkl-actions">
          <button className="pkl-btn" onClick={downloadPdf}>PDF herunterladen</button>
        </div>

        {coords && <div className="pkl-coords">Letzter Klick: X {coords.x}, Y {coords.y}</div>}
      </div>

      {/* Rechte Spalte: Vorschau */}
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
              Vorschau noch nicht verfügbar – {status}{error ? ` — Fehler: ${error}` : ""}
            </div>
          )}
          {coords && <div className="pkl-fab">X {coords.x}, Y {coords.y}</div>}
        </div>
      </div>
    </div>
  );
}
