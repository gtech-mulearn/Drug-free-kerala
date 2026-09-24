import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vitest/config";

const fromRoot = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

/**
 * Next.js turns static image imports into `StaticImageData` objects; Vite turns
 * them into URL strings. Mirror Next's shape so `next/image` works in tests.
 */
const staticImageData = (): Plugin => ({
  name: "static-image-data",
  enforce: "pre",
  load(id) {
    if (!/\.(png|jpe?g|webp|avif|gif)$/.test(id)) return null;
    const src = `/_next/static/media/${path.basename(id)}`;
    return `export default ${JSON.stringify({
      src,
      width: 1200,
      height: 800,
      blurDataURL: "data:image/png;base64,iVBORw0KGgo=",
    })};`;
  },
});

export default defineConfig({
  plugins: [staticImageData(), react()],
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      "server-only": fromRoot("./src/test/stubs/empty-module.ts"),
      "next/font/google": fromRoot("./src/test/stubs/next-font-google.ts"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    clearMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});
