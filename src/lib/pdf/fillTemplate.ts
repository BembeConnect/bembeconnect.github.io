// src/lib/pdf/fillTemplate.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type MappingItem = {
  key: string;
  x: number;
  y: number;
  size?: number;
  align?: "left" | "center" | "right";
  color?: { r: number; g: number; b: number };
};

export type FillData = Record<string, string | number | undefined | null>;

export async function fillTemplate(
  templateArrayBuffer: ArrayBuffer,
  data: FillData,
  mapping: MappingItem[]
): Promise<Blob> {
  const pdfDoc = await PDFDocument.load(templateArrayBuffer);
  const page = pdfDoc.getPage(0);

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

  const bytes = await pdfDoc.save();                 // Uint8Array
  return new Blob([bytes.buffer], { type: "application/pdf" });
}
