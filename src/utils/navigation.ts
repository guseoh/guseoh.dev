import type { CollectionEntry } from "astro:content";
import navigationData from "../data/navigation.json";
import type { CategoryTreeGroup } from "./categories";
import { getCategorySlug } from "./categories";
import { normalizeTag } from "./tags";

type NavigationItemType = "category" | "tag";

type NavigationItem = {
  title: string;
  slug: string;
  type: NavigationItemType;
};

type NavigationGroup = {
  title: string;
  slug: string;
  items: NavigationItem[];
};

export function buildSidebarNavigation(posts: CollectionEntry<"blog">[]): CategoryTreeGroup[] {
  return (navigationData as NavigationGroup[])
    .map((group) => {
      const children = group.items
        .map((item) => {
          const matchingPosts = filterPostsByNavigationItem(posts, item);

          return {
            name: item.title,
            slug: item.slug,
            href: getNavigationItemHref(item),
            count: matchingPosts.length
          };
        })
        .filter((item) => item.count > 0);

      const groupPostIds = new Set(
        group.items.flatMap((item) => filterPostsByNavigationItem(posts, item).map((post) => post.id))
      );

      return {
        name: group.title,
        slug: group.slug,
        href: `/search/?group=${group.slug}`,
        count: groupPostIds.size,
        children
      };
    })
    .filter((group) => group.count > 0);
}

function filterPostsByNavigationItem(posts: CollectionEntry<"blog">[], item: NavigationItem) {
  if (item.type === "category") {
    return posts.filter((post) => getCategorySlug(post) === item.slug);
  }

  return posts.filter((post) => post.data.tags.some((tag) => normalizeTag(tag) === item.slug));
}

function getNavigationItemHref(item: NavigationItem) {
  return item.type === "category" ? `/categories/${item.slug}/` : `/tags/${item.slug}/`;
}
