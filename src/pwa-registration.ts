// FILE: src/pwa-registration.ts
/// <reference types="vite-plugin-pwa/client" />

import { registerSW } from "virtual:pwa-register";

/**
 * Auto-Update: Sobald ein neues SW installiert ist,
 * wird die App ohne Nachfrage neu geladen.
 */
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Neues SW wartet → sofort aktivieren & Seite neu laden
    updateSW(true);
  },
  onOfflineReady() {
    // offline.html wurde gecached – kein UI nötig
  },
});
