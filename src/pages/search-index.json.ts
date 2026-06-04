import { getCollection } from "astro:content";
import { buildSearchIndex } from "../utils/search";
import { sortPostsByDate } from "../utils/posts";

export async function GET() {
  const posts = sortPostsByDate(await getCollection("blog", ({ data }) => !data.draft));

  return new Response(JSON.stringify(buildSearchIndex(posts)), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
