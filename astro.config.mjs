import { defineConfig } from "astro/config";
import prefetch from "@astrojs/prefetch";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import image from "@astrojs/image";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";

const site = "https://roy-eden.vercel.app"

// https://astro.build/config
export default defineConfig({
  site,
  adapter: vercel(),
  output: "server",
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    prefetch(),
    svelte(),
    mdx(),
    image(),
    sitemap({
      customPages: [
        "index",
        "about",
        "blog",
        "projects",
        // TODO auto add all projects/blog posts
      ].map(page => `${site}/${page}`)
    }),
  ],
});
