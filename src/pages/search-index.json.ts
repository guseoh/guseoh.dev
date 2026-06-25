import { buildSearchIndex } from "../utils/search";
import { getPublishedPostsSorted } from "../utils/content/posts";

export async function GET() {
  const posts = await getPublishedPostsSorted();

  return new Response(JSON.stringify(buildSearchIndex(posts)), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
