import { BLOG_GRASS_WEEKDAY_LABELS } from "./blogStats";
import { getKoreaDateKey } from "./koreaDate";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface GitHubContributionDayData {
  date: string;
  count: number;
  level?: number;
  color?: string;
}

export interface GitHubContributionData {
  username: string;
  generatedAt: string;
  source: "graphql" | "public-html" | "empty";
  from: string;
  to: string;
  totalContributions: number;
  days: GitHubContributionDayData[];
}

export interface GitHubGrassDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  isToday: boolean;
  isOutsideRange: boolean;
}

export interface GitHubGrassWeek {
  days: GitHubGrassDay[];
  monthLabel: string;
}

export interface GitHubActivityStats {
  totalContributions: number;
  yearContributions: number;
  monthContributions: number;
  currentStreak: number;
  longestStreak: number;
  weeks: GitHubGrassWeek[];
  rangeStart: string;
  rangeEnd: string;
  generatedAt: string;
  source: GitHubContributionData["source"];
}

export function buildGitHubActivityStats(data: GitHubContributionData, today = new Date()) {
  const todayUtc = parseDateKey(getKoreaDateKey(today));
  const currentYear = todayUtc.getUTCFullYear();
  const rangeStart = parseDateKey(`${currentYear}-01-01`);
  const rangeEnd = todayUtc;
  const graphStart = getMondayStart(rangeStart);
  const graphEnd = addUtcDays(getMondayStart(rangeEnd), 6);
  const contributionMap = buildContributionMap(data.days);
  const currentMonth = todayUtc.getUTCMonth();
  const weeks: GitHubGrassWeek[] = [];

  for (let weekStart = graphStart; weekStart <= graphEnd; weekStart = addUtcDays(weekStart, 7)) {
    const days = BLOG_GRASS_WEEKDAY_LABELS.map((_, dayIndex) => {
      const date = addUtcDays(weekStart, dayIndex);
      const dateKey = toDateKey(date);
      const contribution = contributionMap[dateKey];
      const count = contribution?.count ?? 0;
      const isOutsideRange = date < rangeStart || date > rangeEnd;

      return {
        date: dateKey,
        count,
        level: isOutsideRange ? 0 : getActivityLevel(count, contribution?.level),
        label: formatContributionLabel(date, count, isOutsideRange),
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
    totalContributions: data.totalContributions,
    yearContributions: sumContributions(
      contributionMap,
      (date) => date >= rangeStart && date <= rangeEnd
    ),
    monthContributions: sumContributions(
      contributionMap,
      (date) =>
        date >= rangeStart &&
        date <= rangeEnd &&
        date.getUTCMonth() === currentMonth
    ),
    currentStreak: calculateCurrentStreak(contributionMap, todayUtc),
    longestStreak: calculateLongestStreak(contributionMap, rangeEnd),
    weeks,
    rangeStart: toDateKey(rangeStart),
    rangeEnd: toDateKey(rangeEnd),
    generatedAt: data.generatedAt,
    source: data.source
  } satisfies GitHubActivityStats;
}

function buildContributionMap(days: GitHubContributionDayData[]) {
  return days.reduce<Record<string, GitHubContributionDayData>>((map, day) => {
    map[day.date] = day;

    return map;
  }, {});
}

function sumContributions(
  contributionMap: Record<string, GitHubContributionDayData>,
  predicate: (date: Date) => boolean
) {
  return Object.entries(contributionMap).reduce((total, [dateKey, day]) => {
    const date = parseDateKey(dateKey);

    return predicate(date) ? total + day.count : total;
  }, 0);
}

function calculateCurrentStreak(contributionMap: Record<string, GitHubContributionDayData>, today: Date) {
  let streak = 0;

  for (let date = today; (contributionMap[toDateKey(date)]?.count ?? 0) > 0; date = addUtcDays(date, -1)) {
    streak += 1;
  }

  return streak;
}

function calculateLongestStreak(contributionMap: Record<string, GitHubContributionDayData>, rangeEnd: Date) {
  const activeDates = Object.keys(contributionMap)
    .filter((dateKey) => (contributionMap[dateKey]?.count ?? 0) > 0 && parseDateKey(dateKey) <= rangeEnd)
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

function getActivityLevel(count: number, rawLevel?: number): GitHubGrassDay["level"] {
  if (rawLevel === 0 || rawLevel === 1 || rawLevel === 2 || rawLevel === 3 || rawLevel === 4) {
    return rawLevel;
  }

  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 10) return 3;

  return 4;
}

function getMonthLabel(days: GitHubGrassDay[], isFirstWeek: boolean) {
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

function formatContributionLabel(date: Date, count: number, isOutsideRange: boolean) {
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

  return `${dateLabel}: GitHub contribution ${count}개`;
}

function getMondayStart(date: Date) {
  const day = date.getUTCDay();
  const mondayOffset = (day + 6) % 7;

  return addUtcDays(date, -mondayOffset);
}

function startOfUtcDay(dateInput: Date | string | number) {
  const date = normalizeDate(dateInput);

  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number) {
  return new Date(date.valueOf() + days * DAY_IN_MS);
}

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function toDateKey(date: Date | string | number) {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

function normalizeDate(dateInput: Date | string | number) {
  if (dateInput instanceof Date) {
    return dateInput;
  }

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnly) {
      const [, year, month, day] = dateOnly;

      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    }

    return new Date(trimmed);
  }

  return new Date(dateInput);
}
