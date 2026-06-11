import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import booksData from "./data/books.json";

const configuredBookIds = new Set(booksData.map((book) => book.id));

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
    book: z.string().trim().optional().refine(
      (bookId) => !bookId || configuredBookIds.has(bookId),
      {
        message: "등록되지 않은 Book id입니다. src/data/books.json에 Book을 추가하거나 올바른 id를 사용해 주세요."
      }
    ),
    series: z.string().optional(),
    chapter: z.number().int().positive().optional(),
    seriesOrder: z.number().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().optional()
  }),
});

export const collections = { blog };
