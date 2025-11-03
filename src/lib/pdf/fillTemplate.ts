// src/lib/pdf/fillImageTemplate.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type MappingItem = {
  key: string;
  x: number;
  y: number;                         // PDF-Punkte, Null unten links
  size?: number;                     // Default 10
  align?: "left" | "center" | "right";
  color?: { r: number; g: number; b: number }; // 0..1
};

export type FillData = Record<string, string | number | undefined | null>;

function isPng(bytes: Uint8Array) {
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}
function isJpeg(bytes: Uint8Array) {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
}

/** Erzeugt ein 1-seitiges A4-PDF:
 *  - legt PNG/JPG als Vollseiten-Hintergrund
 *  - schreibt Text laut Mapping oben drauf
 */
export async function fillImageTemplate(
  bgImageArrayBuffer: ArrayBuffer,
  data: FillData,
  mapping: MappingItem[]
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();

  // A4 (pt): 595 x 842
  const pageWidth = 595;
  const pageHeight = 842;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  const bgBytes = new Uint8Array(bgImageArrayBuffer);
  let bgImg;
  if (isPng(bgBytes)) bgImg = await pdfDoc.embedPng(bgBytes);
  else if (isJpeg(bgBytes)) bgImg = await pdfDoc.embedJpg(bgBytes);
  else throw new Error("Hintergrundbild muss PNG oder JPG sein.");

  page.drawImage(bgImg, { x: 0, y: 0, width: pageWidth, height: pageHeight });

  const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
  for (const m of mapping) {
    const raw = data[m.key];
    const value = raw == null ? "" : String(raw);

    let x = m.x;
    if (m.align && value) {
      const w = helv.widthOfTextAtSize(value, m.size ?? 10);
      if (m.align === "center") x = m.x - w / 2;
      if (m.align === "right") x = m.x - w;
    }

    page.drawText(value, {
      x,
      y: m.y,
      size: m.size ?? 10,
      font: helv,
      color: rgb(m.color?.r ?? 0, m.color?.g ?? 0, m.color?.b ?? 0),
    });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: "application/pdf" });
}
