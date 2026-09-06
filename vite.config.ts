// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Dva deploy cíle ze stejného repa:
// - server (Docker/Nitro SSR): výchozí, `npm run build` s NITRO_PRESET=node-server.
// - GitHub Pages (čistě statický CSR export, bez Node serveru): STATIC_BUILD=1
//   vypne nitro a vytvoří běžný `dist/index.html`, `base` nastaven na cestu repa.
const STATIC = process.env.STATIC_BUILD === "1";

export default defineConfig({
  vite: {
    base: STATIC ? "/kebab-house-vibes/" : process.env.VITE_BASE || "/",
  },
  nitro: STATIC ? false : undefined,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // SPA shell prerender (STATIC_BUILD=1): TanStack Start pre-renders "/" into
    // dist/client/index.html at build time, no Node server needed at runtime —
    // that's what makes a plain static host (GitHub Pages) work at all.
    ...(STATIC ? { spa: { enabled: true } } : {}),
  },
});
