import type { CollectionEntry } from "astro:content";
import booksData from "../data/books.json";
import { getCategoryName } from "./categories";
import { getPostActivityDate } from "./posts";

export type BookTone = "navy" | "charcoal" | "blue" | "burgundy" | "forest";

export type BookMetadata = {
  id: string;
  title: string;
  description: string;
  topics: string[];
  coverLabel: string;
  tone: BookTone;
  order: number;
};

export type BookSummary = BookMetadata & {
  count: number;
  latestDate: Date;
  categories: string[];
  posts: CollectionEntry<"blog">[];
};

const BOOKS = booksData as BookMetadata[];

function validateBookMetadata(books: BookMetadata[]) {
  const seenIds = new Set<string>();

  for (const book of books) {
    const id = book.id.trim();

    if (!id) {
      throw new Error("[books] src/data/books.json의 Book id는 비어 있을 수 없습니다.");
    }

    if (seenIds.has(id)) {
      throw new Error(`[books] src/data/books.json에 중복된 Book id가 있습니다: ${id}`);
    }

    seenIds.add(id);
  }
}

validateBookMetadata(BOOKS);

function compareBookPosts(a: CollectionEntry<"blog">, b: CollectionEntry<"blog">) {
  const chapterA = a.data.chapter ?? Number.MAX_SAFE_INTEGER;
  const chapterB = b.data.chapter ?? Number.MAX_SAFE_INTEGER;

  if (chapterA !== chapterB) return chapterA - chapterB;

  const dateDifference = getPostActivityDate(b).valueOf() - getPostActivityDate(a).valueOf();
  if (dateDifference !== 0) return dateDifference;

  return a.data.title.localeCompare(b.data.title, "ko");
}

export function buildBookSummaries(posts: CollectionEntry<"blog">[]): BookSummary[] {
  return BOOKS
    .map((book) => {
      const bookPosts = posts
        .filter((post) => post.data.book?.trim() === book.id)
        .sort(compareBookPosts);

      if (bookPosts.length === 0) return undefined;

      return {
        ...book,
        count: bookPosts.length,
        latestDate: new Date(Math.max(...bookPosts.map((post) => getPostActivityDate(post).valueOf()))),
        categories: Array.from(new Set(bookPosts.map(getCategoryName))).sort((a, b) => a.localeCompare(b, "ko")),
        posts: bookPosts
      };
    })
    .filter((book): book is BookSummary => Boolean(book))
    .sort((a, b) => a.order - b.order);
}
