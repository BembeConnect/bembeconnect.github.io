// src/pages/PKL/abrechnung/mapping.ts
import type { MappingItem } from "../../../lib/pdf/fillImageTemplate";

export const pklMapping: MappingItem[] = [
  // Kopfzeile (Zeile mit Name / Personal-Nr. / VB-Nr. / Auftrags-Nr. / Studio)
  { key: "name",       x:  70, y: 735, size: 10 },
  { key: "personalNr", x: 320, y: 735, size: 10 },
  { key: "vbNr",       x: 400, y: 735, size: 10 },
  { key: "auftragsNr", x: 480, y: 735, size: 10 },
  { key: "studio",     x: 545, y: 735, size: 10 },

  // Baustelle (Zeile darunter)
  { key: "baustelle",  x:  70, y: 705, size: 10 },
];


// Optional: gemeinsame Datentypen / Defaults für das Formular
export type PklData = {
  name: string;
  personalNr: string;
  vbNr: string;
  auftragsNr: string;
  studio: string;
  baustelle: string;
};

export const initialPklData: PklData = {
  name: "Max Mustermann",
  personalNr: "",
  vbNr: "",
  auftragsNr: "",
  studio: "",
  baustelle: "",
};
