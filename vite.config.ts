// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages build: `GITHUB_PAGES=true npm run build` produces a client-only
// SPA (shell prerendered to dist/client/index.html) served from a subpath.
const isGitHubPages = process.env["GITHUB_PAGES"] === "true";

export default defineConfig({
  vite: isGitHubPages ? { base: "/personal-book-nest/" } : {},

  ...(isGitHubPages ? { nitro: false as const } : {}),



  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // On GitHub Pages there is no server runtime, so ship a static SPA shell.
    ...(isGitHubPages ? { spa: { enabled: true } } : {}),
  },
});
