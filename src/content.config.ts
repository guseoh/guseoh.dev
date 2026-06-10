import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    pattern: "**/[!_]*.md",
    base: "./src/content/blog"
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    updated: z.date().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    book: z.string().optional(),
    series: z.string().optional(),
    chapter: z.number().int().positive().optional(),
    seriesOrder: z.number().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().optional()
  }),
});

export const collections = { blog };
