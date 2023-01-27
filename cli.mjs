#!/usr/bin/env node
"use strict";

import fs from "fs";
import ora from "ora";
import { black, bold, dim, green, yellow, bgGreen } from "kleur/colors";
import path from "path";
import prompts from "prompts";
import url from "url";
import slugify from "slugify";

// TODO move to JSON so this can be consumed everywhere
const TAG_SUGGESTIONS = {
  languages: [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Markdown",
    "MDX",
    "PHP",
    "Python",
    "SQL",
    "C",
    "C++",
  ],
  frontend: ["React", "React Native", "VueJS", "Svelte", "SolidJS"],
  backend: ["NodeJS", "ExpressJS", "Flask", "SQLite", "GraphQL", "SQL"],
  fullstack: ["Astro", "NextJS", "Gatsby", "Laravel"],
  libraries: [
    "Framer-Motion",
    "Radix UI",
    "Redux",
    "Styled Components",
    "TensorflowJS",
    "Three JS",
    "P5JS",
    "image-q",
  ],
  preprocessors: ["TailwindCSS", "SASS"],
  software: ["AudioStellar", "GIMP", "Orca", "Processing", "Pure Data", "uxn"],
  protocols: ["WebSockets", "OSC"],
  adjectives: [
    "Accessibility",
    "Agile methodology",
    "Animation",
    "Art",
    "Artificial Intelligence",
    "Design",
    "Contributions",
    "Open Source",
    "SSR",
  ],
};

function isEmptyDir(dirPath = "") {
  return !fs.existsSync(dirPath) || fs.readdirSync(dirPath).length === 0;
}

function onCancel() {
  ora().info(dim("Cancelled post template, see you later!"));
  process.exit(1);
}

const POST_TEMPLATES = [
  {
    layout: "~layouts/BlogPostLayout.astro",
    label: "Blog Post",
    type: "blog",
  },
  {
    layout: "~layouts/ProjectsLayout.astro",
    label: "Project",
    type: "projects",
  },
];

async function main() {
  console.log(bold("Welcome to the helper cli for posts!"));
  const options = await prompts(
    [
      {
        type: "select",
        name: "post",
        message: "What would you like to create?",
        choices: POST_TEMPLATES.map(({ type }) => type),
      },
    ],
    {
      onCancel,
    }
  );

  if (options.post === undefined) {
    process.exit(1);
  }

  const { label, type } = POST_TEMPLATES[options.post];

  console.log(bold(`\nCreating ${label}:\n`));

  // TODO Add github URL for posts, add language badges for posts
  const post = await prompts(
    [
      {
        type: "date",
        name: "date",
        message: "Select a date for your post",
        mask: "YYYY-MM-DD",
        initial: new Date(),
      },
      {
        type: "text",
        name: "title",
        message: `What should you name your ${label}?`,
        initial: `My ${label} Title`,
        validate(value) {
          return !!value;
        },
      },
      {
        type: "text",
        name: "description",
        message: (prev) => `What would describe "${prev}"?`,
        initial: `My ${label}'s description`,
      },
      type === "project" && {
        type: "text",
        name: "url",
        message: "The URL for the project",
        initial: "https://",
        validate(value) {
          return value.startsWith("https://")
        }
      },
      type === "project" && {
        type: "text",
        name: "repo",
        message: "The URL for the repo",
        initial: "https://github.com/",
        validate(value) {
          return value.startsWith("https://")
        }
      },
      {
        type: "confirm",
        name: "assets",
        message: `Does this ${label} include any images?`,
      },
      {
        type: "autocompleteMultiselect",
        name: "tags",
        message: `Please select your tags for this ${label}`,
        choices: Object.values(TAG_SUGGESTIONS)
          .flat()
          .map((title) => ({
            title,
            value: title,
          })),
      },
      {
        type: "confirm",
        name: "draft",
        initial: true,
        message: `Is this ${label} a draft?`,
      },
    ].filter(option => !!option),
    {
      onCancel,
    }
  );

  const date = post.date;
  const dateSlug = `${date.getFullYear()}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
  const postDir = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    `/src/pages/${type}/${dateSlug}`
  );

  if (!fs.existsSync(postDir)) {
    console.log(bold(green(`\nCreating path for ${label} at ${postDir}`)));
    fs.mkdirSync(postDir, { recursive: true });
  } else {
    console.log(bold(green(`\nAdding ${label} to ${postDir}`)));
  }
  const postFilename = slugify(post.title).toLocaleLowerCase();

  const assetsBaseURL = `/assets/posts/${type}/${dateSlug}/${postFilename}`;

  const assetsDir = path.join(
    path.dirname(import.meta.url),
    `/public${assetsBaseURL}`
  );

  const postPath = path.join(postDir, postFilename);

  if (!isEmptyDir(postPath)) {
    console.log(bold(yellow("\nPost already exists!\n")));
    const action = await prompts(
      [
        {
          type: "confirm",
          name: "replace",
          message: "Replace folder?",
        },
      ],
      { onCancel }
    );
    if (action.replace) fs.unlinkSync(postPath);
  }

  fs.mkdirSync(postDir, { recursive: true });
  if (post.assets) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const postImageSrc = post.assets && `${assetsDir}/${postFilename}.jpeg`;

  fs.writeFileSync(
    path.join(postDir, `${postFilename}.mdx`),
    `---
layout: "${POST_TEMPLATES[options.post].layout}"
draft: ${post.draft}

date: "${date.toDateString()}"
description: "${post.description ?? ""}"
${postImageSrc ? "" : "# "}image: "${postImageSrc || ""}"
${postImageSrc ? "" : "# "}alt: "A screenshot showcasing the website"
${type === projects ? 'website: ""' : ""}
tags: [${post.tags.map((tag) => `"${tag}"`).join(", ")}]
title: "${post.title}"
---
import OptimizedImage from "~components/Base/OptimizedImage.astro"
import SmartLink from "~components/Base/SmartLink.astro"

export const components = { a: SmartLink, img: OptimizedImage };

<div id="content">
### About
</div>`
  );

  console.log(
    bold(bgGreen(black(`\n"${post.title}" ${label} was created!\n`)))
  );
}

main();
