// FILE: vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    // Dev-only plugin: block serving of existing production-built files from /assets
    // This prevents Vite from trying to analyze bundled files that live in the repo root
    // (they can contain dynamic import patterns the analyzer can't parse).
    {
      name: "dev-ignore-built-assets",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          try {
            const url = req.url || "";
            if (url.startsWith("/assets/")) {
              // Return 404 for built assets during dev to avoid analysis/warnings.
              res.statusCode = 404;
              res.end();
              return;
            }
          } catch (e) {
            // swallow errors and continue
          }
          next();
        });
      },
    },
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["offline.html"],
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
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
          { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
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
  // For GitHub Pages (user site at https://bembeconnect.github.io) set the base
  // so built assets are referenced under /bembeconnect.github.io/.
  base: "/",
});
