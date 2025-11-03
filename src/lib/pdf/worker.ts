// src/lib/pdf/worker.ts
import * as pdfjsLib from "pdfjs-dist";

// 👉 Standard: pdfjs-dist v4.x
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// ❗Falls du v3.x installiert hast und oben ein "Does the file exist?" kommt,
// nimm stattdessen diese Zeile und lösche die darüber:
// import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.js?url";

export function setupPdfJsWorker() {
  // @ts-expect-error: typings decken GlobalWorkerOptions nicht komplett ab
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl as string;
}
