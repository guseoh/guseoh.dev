import type { CollectionEntry } from "astro:content";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ROLLING_DAY_COUNT = 365;

export const BLOG_GRASS_WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;

export interface BlogGrassDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  isToday: boolean;
  isOutsideRange: boolean;
}

export interface BlogGrassWeek {
  days: BlogGrassDay[];
  monthLabel: string;
}

export interface BlogActivityStats {
  totalPosts: number;
  yearPosts: number;
  monthPosts: number;
  currentStreak: number;
  longestStreak: number;
  dateCounts: Record<string, number>;
  weeks: BlogGrassWeek[];
  rangeStart: string;
  rangeEnd: string;
}

export function buildBlogActivityStats(
  posts: CollectionEntry<"blog">[],
  today = new Date()
): BlogActivityStats {
  const todayUtc = startOfUtcDay(today);
  const rangeStart = addUtcDays(todayUtc, -(ROLLING_DAY_COUNT - 1));
  const graphStart = getMondayStart(rangeStart);
  const graphEnd = addUtcDays(getMondayStart(todayUtc), 6);
  const dateCounts = buildDateCounts(posts);
  const currentYear = todayUtc.getUTCFullYear();
  const currentMonth = todayUtc.getUTCMonth();

  const weeks: BlogGrassWeek[] = [];

  for (let weekStart = graphStart; weekStart <= graphEnd; weekStart = addUtcDays(weekStart, 7)) {
    const days = BLOG_GRASS_WEEKDAY_LABELS.map((_, dayIndex) => {
      const date = addUtcDays(weekStart, dayIndex);
      const dateKey = toDateKey(date);
      const count = dateCounts[dateKey] ?? 0;
      const isOutsideRange = date < rangeStart || date > todayUtc;

      return {
        date: dateKey,
        count,
        level: isOutsideRange ? 0 : getActivityLevel(count),
        label: formatActivityLabel(date, count, isOutsideRange),
        isToday: dateKey === toDateKey(todayUtc),
        isOutsideRange
      };
    });

    weeks.push({
      days,
      monthLabel: getMonthLabel(days, weeks.length === 0)
    });
  }

  return {
    totalPosts: posts.filter((post) => !post.data.draft).length,
    yearPosts: sumCounts(dateCounts, (date) => date.getUTCFullYear() === currentYear),
    monthPosts: sumCounts(
      dateCounts,
      (date) => date.getUTCFullYear() === currentYear && date.getUTCMonth() === currentMonth
    ),
    currentStreak: calculateCurrentStreak(dateCounts, todayUtc),
    longestStreak: calculateLongestStreak(dateCounts, todayUtc),
    dateCounts,
    weeks,
    rangeStart: toDateKey(rangeStart),
    rangeEnd: toDateKey(todayUtc)
  };
}

function buildDateCounts(posts: CollectionEntry<"blog">[]) {
  return posts.reduce<Record<string, number>>((counts, post) => {
    if (post.data.draft) {
      return counts;
    }

    const dateKey = toDateKey(post.data.date);
    counts[dateKey] = (counts[dateKey] ?? 0) + 1;

    return counts;
  }, {});
}

function sumCounts(dateCounts: Record<string, number>, predicate: (date: Date) => boolean) {
  return Object.entries(dateCounts).reduce((total, [dateKey, count]) => {
    const date = parseDateKey(dateKey);

    return predicate(date) ? total + count : total;
  }, 0);
}

function calculateCurrentStreak(dateCounts: Record<string, number>, today: Date) {
  let streak = 0;

  for (let date = today; dateCounts[toDateKey(date)] > 0; date = addUtcDays(date, -1)) {
    streak += 1;
  }

  return streak;
}

function calculateLongestStreak(dateCounts: Record<string, number>, today: Date) {
  const activeDates = Object.keys(dateCounts)
    .filter((dateKey) => dateCounts[dateKey] > 0 && parseDateKey(dateKey) <= today)
    .sort();

  if (activeDates.length === 0) {
    return 0;
  }

  let longest = 0;
  let current = 0;
  let previous: Date | undefined;

  for (const dateKey of activeDates) {
    const date = parseDateKey(dateKey);
    current = previous && date.valueOf() - previous.valueOf() === DAY_IN_MS ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = date;
  }

  return longest;
}

function getActivityLevel(count: number): BlogGrassDay["level"] {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;

  return 4;
}

function getMonthLabel(days: BlogGrassDay[], isFirstWeek: boolean) {
  const firstVisibleDay = days.find((day) => !day.isOutsideRange);

  if (!firstVisibleDay) {
    return "";
  }

  const labelDay = isFirstWeek
    ? firstVisibleDay
    : days.find((day) => !day.isOutsideRange && parseDateKey(day.date).getUTCDate() === 1);

  if (!labelDay) {
    return "";
  }

  const date = parseDateKey(labelDay.date);

  return `${date.getUTCMonth() + 1}월`;
}

function formatActivityLabel(date: Date, count: number, isOutsideRange: boolean) {
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);

  if (isOutsideRange) {
    return `${dateLabel}: 표시 범위 밖`;
  }

  return `${dateLabel}: 글 ${count}개 작성`;
}

function getMondayStart(date: Date) {
  const day = date.getUTCDay();
  const mondayOffset = (day + 6) % 7;

  return addUtcDays(date, -mondayOffset);
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number) {
  return new Date(date.valueOf() + days * DAY_IN_MS);
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function toDateKey(date: Date) {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}
