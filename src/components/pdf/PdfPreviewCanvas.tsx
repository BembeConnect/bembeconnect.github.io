// src/components/pdf/PdfPreviewCanvas.tsx
import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

export type PdfPreviewCanvasProps = {
  pdfBlob: Blob | null;
  className?: string;
  onClickCoords?: (x: number, y: number) => void; // PDF-Punkte (Nullpunkt unten links)
};

export default function PdfPreviewCanvas({
  pdfBlob,
  className,
  onClickCoords,
}: PdfPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!pdfBlob || !canvasRef.current) return;

    let cancelled = false;

    (async () => {
      const data = await pdfBlob.arrayBuffer();
      const pdf = await (pdfjsLib as any).getDocument({ data }).promise;
      const page = await pdf.getPage(1);

      const canvas = canvasRef.current!;
      const desiredWidth = canvas.clientWidth || 700;
      const vp = page.getViewport({ scale: 1 });
      const scale = desiredWidth / vp.width;
      const scaled = page.getViewport({ scale });

      sizeRef.current = { w: vp.width, h: vp.height };

      const ctx = canvas.getContext("2d")!;
      canvas.width = scaled.width;
      canvas.height = scaled.height;

      if (!cancelled) {
        await page.render({ canvasContext: ctx, viewport: scaled }).promise;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfBlob]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onClickCoords) return;

    const handler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const page = sizeRef.current;
      if (!page) return;

      const scaleX = page.w / canvas.width;
      const scaleY = page.h / canvas.height;

      const pdfX = Math.round(px * scaleX);
      const pdfY = Math.round(page.h - py * scaleY); // von oben → von unten
      onClickCoords(pdfX, pdfY);
    };

    canvas.addEventListener("click", handler);
    return () => canvas.removeEventListener("click", handler);
  }, [onClickCoords]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
}
