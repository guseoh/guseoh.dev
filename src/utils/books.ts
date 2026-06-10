import type { CollectionEntry } from "astro:content";
import booksData from "../data/books.json";
import { getCategorySlug, normalizeCategory } from "./categories";

export type BookTone = "navy" | "charcoal" | "blue" | "burgundy" | "forest";

export type BookMetadata = {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  topics: string[];
  coverLabel: string;
  tone: BookTone;
  order: number;
};

export type BookSummary = BookMetadata & {
  count: number;
  latestDate: Date;
  posts: CollectionEntry<"blog">[];
};

const BOOKS = booksData as BookMetadata[];

function getPostActivityDate(post: CollectionEntry<"blog">) {
  return post.data.updated ?? post.data.date;
}

export function buildBookSummaries(posts: CollectionEntry<"blog">[]): BookSummary[] {
  return BOOKS
    .map((book) => {
      const categorySlugs = new Set(book.categories.map(normalizeCategory));
      const bookPosts = posts
        .filter((post) => categorySlugs.has(getCategorySlug(post)))
        .sort((a, b) => getPostActivityDate(b).valueOf() - getPostActivityDate(a).valueOf());

      if (bookPosts.length === 0) return undefined;

      return {
        ...book,
        count: bookPosts.length,
        latestDate: getPostActivityDate(bookPosts[0]),
        posts: bookPosts
      };
    })
    .filter((book): book is BookSummary => Boolean(book))
    .sort((a, b) => a.order - b.order);
}
