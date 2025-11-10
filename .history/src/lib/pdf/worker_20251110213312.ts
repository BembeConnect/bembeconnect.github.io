// src/lib/pdf/worker.ts
// Use the legacy build entrypoints which are compatible with ESM bundlers
// Dynamically resolve pdfjs and its worker at runtime. Different versions of
// pdfjs-dist expose different entrypoints, and static imports can fail during
// build if a specific deep path does not exist. We therefore try a few
// candidates at runtime and fall back to a CDN worker if none are found.

export async function setupPdfJsWorker() {
  let pdfjsLib: any = null;

  // Try to load the library from a few common entrypoints. Use @vite-ignore to
  // avoid Vite's static import analysis which would fail the build if the
  // deep path doesn't exist.
  const libCandidates = [
    "pdfjs-dist/legacy/build/pdf",
    "pdfjs-dist/build/pdf",
    "pdfjs-dist",
  ];

  for (const cand of libCandidates) {
    try {
      // @ts-ignore: dynamic import
      pdfjsLib = await import(/* @vite-ignore */ cand);
      // Some packages export the module as default
      if (pdfjsLib && pdfjsLib.default) pdfjsLib = pdfjsLib.default;
      break;
    } catch (e) {
      // try next
    }
  }

  if (!pdfjsLib) {
    // Last resort: try to import the package normally (may throw)
    try {
      // @ts-ignore
      pdfjsLib = await import("pdfjs-dist");
      if (pdfjsLib && pdfjsLib.default) pdfjsLib = pdfjsLib.default;
    } catch (e) {
      // Give up — PDF features will not work, but fail gracefully.
      // eslint-disable-next-line no-console
      console.warn('[setupPdfJsWorker] could not load pdfjs-dist:', e);
      return;
    }
  }

  // Try to resolve a worker URL from common paths. Use ?url so Vite returns a
  // string pointing to the built asset at runtime. Use @vite-ignore to avoid
  // static resolution errors when a path doesn't exist.
  const workerCandidates = [
    "pdfjs-dist/legacy/build/pdf.worker.min.js?url",
    "pdfjs-dist/build/pdf.worker.min.js?url",
    "pdfjs-dist/build/pdf.worker.js?url",
  ];

  let workerUrl: string | null = null;
  for (const cand of workerCandidates) {
    try {
      // @ts-ignore
      const mod = await import(/* @vite-ignore */ cand);
      workerUrl = (mod && (mod.default || mod)) as string;
      if (workerUrl) break;
    } catch (e) {
      // try next
    }
  }

  if (!workerUrl) {
    // Fallback to CDN (best-effort). This avoids build failures but relies on
    // external network access in environments without the worker file present.
    workerUrl = "https://unpkg.com/pdfjs-dist@latest/build/pdf.worker.min.js";
  }

  try {
    (pdfjsLib as any).GlobalWorkerOptions = (pdfjsLib as any).GlobalWorkerOptions || {};
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl as string;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[setupPdfJsWorker] failed to set workerSrc', e);
  }
}
