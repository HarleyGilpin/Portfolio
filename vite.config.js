import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin: replace browser-only packages with noop stubs during
// the SSR (server) build so their module-scope `document` / `window`
// references never execute in Node.js during pre-rendering.
function ssrNoopPlugin() {
  const aliases = {
    "sonner": path.resolve(__dirname, "app/utils/sonner-noop.js"),
    "dompurify": path.resolve(__dirname, "app/utils/dompurify-noop.js"),
    "@emailjs/browser": path.resolve(__dirname, "app/utils/emailjs-noop.js"),
    "quill": path.resolve(__dirname, "app/utils/quill-noop.js"),
    "react-quill-new": path.resolve(__dirname, "app/utils/react-quill-noop.jsx"),
    "quill-blot-formatter/dist/BlotFormatter": path.resolve(
      __dirname,
      "app/utils/blot-formatter-noop.js"
    ),
    "@vercel/blob/client": path.resolve(
      __dirname,
      "app/utils/vercel-blob-noop.js"
    ),
  };

  return {
    name: "ssr-noop-aliases",
    enforce: "pre",
    resolveId(source, _importer, options) {
      if (options?.ssr && aliases[source]) {
        return aliases[source];
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [ssrNoopPlugin(), reactRouter()],
  build: {
    // Vite 7 changed the default target from `modules` to
    // `baseline-widely-available`, which drops Safari 14/15, iOS < 16.4 and
    // Chrome < 111. Pin the previous default so the Vite 8 upgrade does not
    // narrow browser support. Remove this to opt into the newer baseline.
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
})