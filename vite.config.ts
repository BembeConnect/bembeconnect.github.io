// FILE: vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/offline.html"],
      devOptions: {
        enabled: false, // SW im Dev aus → verhindert Cache-Verwirrung
      },
      manifest: {
        name: "bembe-app",
        short_name: "bembe-app",
        description: "Interne App",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#0B1624",
        background_color: "#0B1624",
        icons: [
          // Du kannst diese später ergänzen (public/icons/*). Leer lassen ist zulässig, nur nicht „installierbar“.
        ],
      },
      workbox: {
        // HTML/Navigationsanfragen: zuerst Netz, offline Fallback
        navigateFallback: "/offline.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Dokumente (Navigationen)
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              networkTimeoutSeconds: 3,
            },
          },
          {
            // gebaute Assets (JS/CSS/Import-Worker)
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style" ||
              request.destination === "worker",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "asset-cache",
            },
          },
          {
            // Bilder/Schriften
            urlPattern: ({ request }) =>
              request.destination === "image" || request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "static-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Tage
              },
            },
          },
        ],
      },
    }),
  ],
  base: "/", // User/Org-Site → Root
});
