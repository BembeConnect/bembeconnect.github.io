// src/lib/pdf/worker.ts
// Use the legacy build entrypoints which are compatible with ESM bundlers
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.js?url";

export function setupPdfJsWorker() {
  // pdfjs typings sind teilweise unvollständig – wir setzen den Wert explizit.
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl as string;
}
