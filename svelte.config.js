import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess({
    typescript: true
  }),

  kit: {
    adapter: adapter({
      fallback: "index.html"
    }),
    prerender: { entries: ["*"] },
    alias: {
      $components: "src/lib/components",
      $assets: "src/assets"
    }
  }
};

export default config;
