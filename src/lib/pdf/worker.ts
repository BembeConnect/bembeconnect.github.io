// src/lib/pdf/worker.ts
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

export function setupPdfJsWorker() {
  // pdfjs typings sind teilweise unvollständig – wir setzen den Wert explizit.
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl as string;
}
