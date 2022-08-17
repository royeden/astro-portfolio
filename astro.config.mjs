import { defineConfig } from "astro/config";
import prefetch from "@astrojs/prefetch";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import image from "@astrojs/image";
import vercel from "@astrojs/vercel/serverless";

import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://roy-eden.vercel.app",
  adapter: vercel(),
  output: "server",
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    prefetch(),
    compress(),
    svelte(),
    mdx(),
    image(),
  ],
});
