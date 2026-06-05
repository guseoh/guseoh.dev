import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const USERNAME = process.env.GITHUB_CONTRIBUTIONS_USERNAME ?? "guseoh";
const TOKEN = process.env.GH_CONTRIBUTIONS_TOKEN;
const OUTPUT_PATH =
  process.env.GITHUB_CONTRIBUTIONS_OUTPUT ??
  path.join(process.cwd(), "public", "data", "github-contributions.json");

const today = startOfUtcDay(new Date());
const from = addUtcDays(today, -364);
const to = today;

const GRAPHQL_QUERY = `
  query($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
              contributionLevel
              weekday
            }
          }
        }
      }
    }
  }
`;

try {
  const data = TOKEN ? await fetchFromGraphQLWithFallback() : await fetchFromPublicHtml();
  const changed = await writeContributionDataIfChanged(data);

  if (changed) {
    console.log(`Wrote GitHub contributions from ${data.source} to ${OUTPUT_PATH}`);
  } else {
    console.log(`GitHub contribution data is already up to date at ${OUTPUT_PATH}`);
  }
} catch (error) {
  console.warn(`Could not fetch GitHub contributions: ${error.message}`);

  const existingData = await readExistingContributionData();
  if (existingData) {
    console.warn(`Keeping existing GitHub contribution data at ${OUTPUT_PATH}`);
  } else {
    const fallback = buildEmptyData();
    await writeContributionData(fallback);
    console.warn(`Wrote empty GitHub contribution data to ${OUTPUT_PATH}`);
  }
}

async function fetchFromGraphQLWithFallback() {
  try {
    return await fetchFromGraphQL();
  } catch (error) {
    console.warn(`GitHub GraphQL fetch failed: ${error.message}`);

    return fetchFromPublicHtml();
  }
}

async function fetchFromGraphQL() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "guseoh-github-pages-blog"
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: {
        userName: USERNAME,
        from: `${toDateKey(from)}T00:00:00Z`,
        to: `${toDateKey(to)}T23:59:59Z`
      }
    })
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with ${response.status}`);
  }

  const body = await response.json();

  if (body.errors?.length) {
    throw new Error(body.errors.map((item) => item.message).join("; "));
  }

  const calendar = body.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) {
    throw new Error(`No contribution calendar returned for ${USERNAME}`);
  }

  const days = sortDays(filterDays(calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: mapContributionLevel(day.contributionLevel),
      color: day.color
    }))
  )));

  return {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    source: "graphql",
    from: toDateKey(from),
    to: toDateKey(to),
    totalContributions: calendar.totalContributions,
    days
  };
}

async function fetchFromPublicHtml() {
  const url = `https://github.com/users/${encodeURIComponent(USERNAME)}/contributions`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "guseoh-github-pages-blog"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub public contributions request failed with ${response.status}`);
  }

  const html = await response.text();
  const days = sortDays(parseContributionHtml(html));

  if (days.length === 0) {
    throw new Error(`No public contribution days found for ${USERNAME}`);
  }

  return {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    source: "public-html",
    from: toDateKey(from),
    to: toDateKey(to),
    totalContributions: days.reduce((total, day) => total + day.count, 0),
    days
  };
}

function parseContributionHtml(html) {
  const days = [];
  const cellPattern = /<td\b(?=[^>]*ContributionCalendar-day)[^>]*>/g;
  let match;

  while ((match = cellPattern.exec(html)) !== null) {
    const cell = match[0];
    const date = getAttributeValue(cell, "data-date");
    const rawLevel = Number(getAttributeValue(cell, "data-level") ?? 0);
    const tooltipMatch = html.slice(match.index + cell.length).match(/<tool-tip\b[^>]*>([\s\S]*?)<\/tool-tip>/);
    const tooltipText = decodeHtml(stripTags(tooltipMatch?.[1] ?? ""));
    const countMatch = tooltipText.match(/(\d[\d,]*)\s+contribution/);

    if (!date) {
      continue;
    }

    days.push({
      date,
      count: countMatch ? Number(countMatch[1].replaceAll(",", "")) : 0,
      level: clampLevel(rawLevel)
    });
  }

  return filterDays(days);
}

function buildEmptyData() {
  const days = [];

  for (let date = from; date <= to; date = addUtcDays(date, 1)) {
    days.push({
      date: toDateKey(date),
      count: 0,
      level: 0
    });
  }

  return {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    source: "empty",
    from: toDateKey(from),
    to: toDateKey(to),
    totalContributions: 0,
    days
  };
}

function sortDays(days) {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}

function filterDays(days) {
  return days.filter((day) => day.date >= toDateKey(from) && day.date <= toDateKey(to));
}

async function writeContributionData(data) {
  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(`${OUTPUT_PATH}`, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeContributionDataIfChanged(data) {
  const existingData = await readExistingContributionData();

  if (existingData && isSameContributionData(existingData, data)) {
    return false;
  }

  await writeContributionData(data);

  return true;
}

async function readExistingContributionData() {
  try {
    const existing = JSON.parse(await readFile(OUTPUT_PATH, "utf8"));

    return existing?.days?.length ? existing : undefined;
  } catch {
    return undefined;
  }
}

function isSameContributionData(existingData, nextData) {
  const { generatedAt: existingGeneratedAt, ...existingComparable } = existingData;
  const { generatedAt: nextGeneratedAt, ...nextComparable } = nextData;

  return JSON.stringify(existingComparable) === JSON.stringify(nextComparable);
}

function mapContributionLevel(level) {
  const levels = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4
  };

  return levels[level] ?? 0;
}

function getAttributeValue(source, name) {
  const match = source.match(new RegExp(`${name}="([^"]*)"`));

  return match?.[1];
}

function clampLevel(level) {
  if (level <= 0) return 0;
  if (level >= 4) return 4;

  return level;
}

function stripTags(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date, days) {
  return new Date(date.valueOf() + days * DAY_IN_MS);
}

function toDateKey(date) {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}
