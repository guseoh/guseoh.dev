import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  addDateKeyDays,
  getKoreaDateKey,
  getKoreaDayUtcRange
} from "./korea-date.mjs";

const USERNAME = process.env.GITHUB_CONTRIBUTIONS_USERNAME ?? "guseoh";
const TOKEN = process.env.GH_CONTRIBUTIONS_TOKEN;
const OUTPUT_PATH =
  process.env.GITHUB_CONTRIBUTIONS_OUTPUT ??
  path.join(process.cwd(), "public", "data", "github-contributions.json");

const toDateKey = getKoreaDateKey(new Date());
const fromDateKey = addDateKeyDays(toDateKey, -364);

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

const refreshResult = await refreshContributionData();
await writeActionOutputs(refreshResult);

if (refreshResult.changed) {
  console.log(`Wrote GitHub contributions from ${refreshResult.source} to ${OUTPUT_PATH}`);
} else {
  console.log(`GitHub contribution data is unchanged at ${OUTPUT_PATH}`);
}

if (refreshResult.detail) {
  console.warn(refreshResult.detail);
}

async function refreshContributionData() {
  try {
    const fetched = TOKEN
      ? await fetchFromGraphQLWithFallback()
      : {
          data: await fetchFromPublicHtml(),
          status: "success",
          detail: "GH_CONTRIBUTIONS_TOKEN is not configured; public HTML data was used."
        };
    const changed = await writeContributionDataIfChanged(fetched.data);

    return {
      source: fetched.data.source,
      status: fetched.status,
      changed,
      detail: fetched.detail ?? ""
    };
  } catch (error) {
    const detail = `GitHub contribution refresh failed: ${error.message}`;
    const existingData = await readExistingContributionData();

    if (existingData) {
      return {
        source: "existing",
        status: "degraded",
        changed: false,
        detail: `${detail} Existing JSON was preserved.`
      };
    }

    const fallback = buildEmptyData();
    const changed = await writeContributionDataIfChanged(fallback);

    return {
      source: "empty",
      status: "degraded",
      changed,
      detail: `${detail} Empty contribution data was written.`
    };
  }
}

async function fetchFromGraphQLWithFallback() {
  try {
    return {
      data: await fetchFromGraphQL(),
      status: "success",
      detail: ""
    };
  } catch (graphqlError) {
    try {
      return {
        data: await fetchFromPublicHtml(),
        status: "fallback",
        detail: `GitHub GraphQL failed; public HTML fallback was used: ${graphqlError.message}`
      };
    } catch (htmlError) {
      throw new Error(
        `GraphQL failed (${graphqlError.message}); public HTML failed (${htmlError.message})`
      );
    }
  }
}

async function fetchFromGraphQL() {
  const fromRange = getKoreaDayUtcRange(fromDateKey);
  const toRange = getKoreaDayUtcRange(toDateKey);
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
        from: fromRange.start.toISOString(),
        to: toRange.end.toISOString()
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

  const days = fillDateRange(sortDays(filterDays(calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: mapContributionLevel(day.contributionLevel),
      color: day.color
    }))
  ))));

  return {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    source: "graphql",
    from: fromDateKey,
    to: toDateKey,
    totalContributions: sumContributions(days),
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
  const parsedDays = sortDays(parseContributionHtml(html));

  if (parsedDays.length === 0) {
    throw new Error(`No public contribution days found for ${USERNAME}`);
  }

  const days = fillDateRange(parsedDays);

  return {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    source: "public-html",
    from: fromDateKey,
    to: toDateKey,
    totalContributions: sumContributions(days),
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
  const days = fillDateRange([]);

  return {
    username: USERNAME,
    generatedAt: new Date().toISOString(),
    source: "empty",
    from: fromDateKey,
    to: toDateKey,
    totalContributions: 0,
    days
  };
}

function sortDays(days) {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}

function fillDateRange(days) {
  const dayMap = new Map(days.map((day) => [day.date, day]));
  const normalizedDays = [];

  for (
    let dateKey = fromDateKey;
    dateKey <= toDateKey;
    dateKey = addDateKeyDays(dateKey, 1)
  ) {
    normalizedDays.push(dayMap.get(dateKey) ?? {
      date: dateKey,
      count: 0,
      level: 0
    });
  }

  return normalizedDays;
}

function sumContributions(days) {
  return days.reduce((total, day) => total + day.count, 0);
}

function filterDays(days) {
  return days.filter((day) => day.date >= fromDateKey && day.date <= toDateKey);
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

async function writeActionOutputs(result) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  const detail = result.detail.replace(/[\r\n]+/g, " ").trim();
  const outputs = [
    `source=${result.source}`,
    `status=${result.status}`,
    `changed=${result.changed}`,
    `detail=${detail}`
  ];

  await appendFile(process.env.GITHUB_OUTPUT, `${outputs.join("\n")}\n`, "utf8");
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
