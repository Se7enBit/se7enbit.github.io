// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

// User site (<username>.github.io) served from the root, so no `base`.
export default defineConfig({
  site: "https://se7enbit.github.io",
  output: "static",
  integrations: [
    svelte(),
    // The 404 page is not a real page; keep it out of the sitemap.
    sitemap({ filter: (page) => !/\/404\/?$/.test(new URL(page).pathname) }),
  ],
});
