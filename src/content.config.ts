import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import booksData from "./data/books.json";

const configuredBookIds = new Set(
  (booksData as Array<{ id: string }>).map((book) => book.id)
);

const blogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  updated: z.date().optional(),
  lastVerified: z.date().optional(),
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
}).superRefine((data, context) => {
  if (data.updated && data.updated < data.date) {
    context.addIssue({
      code: "custom",
      path: ["updated"],
      message: "updated는 date보다 빠를 수 없습니다."
    });
  }

  if (data.lastVerified && data.lastVerified < data.date) {
    context.addIssue({
      code: "custom",
      path: ["lastVerified"],
      message: "lastVerified는 date보다 빠를 수 없습니다."
    });
  }
});

const blog = defineCollection({
  loader: glob({
    pattern: "**/[!_]*.md",
    base: "./src/content/blog"
  }),
  schema: blogSchema,
});

export const collections = { blog };
