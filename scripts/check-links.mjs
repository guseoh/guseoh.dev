import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ignoredLinkPatterns, linkCheckOptions } from "./link-check.config.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(rootDir, "src", "content", "blog");
const markdownLinkPattern = /!?\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
const htmlHrefPattern = /<a\b[^>]*\bhref=(["'])(.*?)\1/gi;
const bareUrlPattern = /(^|[\s(])((?:https?:\/\/)[^\s<>()"]+)/g;
const frontmatterUrlPattern = /^([A-Za-z][\w-]*):\s*(["']?)(https?:\/\/[^"']+)\2\s*$/;

const files = await listMarkdownFiles(contentDir);
const locationsByUrl = new Map();

for (const file of files) {
  const source = await readFile(file, "utf8");
  const lines = source.split(/\r?\n/);
  const relativePath = toRepoPath(file);
  collectLinks(relativePath, lines);
}

const urls = [...locationsByUrl.keys()].sort();
const results = await mapLimit(urls, linkCheckOptions.concurrency, checkUrl);
const grouped = {
  ok: [],
  broken: [],
  restricted: [],
  rateLimited: [],
  server: [],
  network: [],
  ignored: []
};

for (const result of results) {
  grouped[result.category].push(result);
}

for (const category of ["broken", "restricted", "rateLimited", "server", "network", "ignored", "ok"]) {
  for (const result of grouped[category]) {
    const label = category === "ok" ? "OK" : category === "ignored" ? "SKIP" : category === "broken" ? "FAIL" : "WARN";
    const status = result.status ? ` ${result.status}` : "";
    const location = result.locations[0];
    const extraCount = result.locations.length > 1 ? ` (+${result.locations.length - 1} more)` : "";
    console.log(`${label}${status} ${result.url} ${location.file}:${location.line}${extraCount} ${result.detail ?? ""}`.trim());
  }
}

console.log(
  `Link check: ${grouped.ok.length} ok, ${grouped.broken.length} broken, ` +
  `${grouped.restricted.length} restricted, ${grouped.rateLimited.length} rate limited, ` +
  `${grouped.server.length} server warnings, ${grouped.network.length} network warnings, ${grouped.ignored.length} ignored.`
);

if (grouped.broken.length > 0) {
  process.exit(1);
}

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...await listMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("_")) {
      results.push(fullPath);
    }
  }

  return results.sort((a, b) => a.localeCompare(b));
}

function collectLinks(file, lines) {
  let inFence = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (/^\s*(```+|~~~+)/.test(line)) {
      inFence = !inFence;
      return;
    }

    const frontmatterMatch = line.match(frontmatterUrlPattern);
    if (frontmatterMatch) {
      addUrl(frontmatterMatch[3], file, lineNumber);
    }

    if (inFence) return;

    markdownLinkPattern.lastIndex = 0;
    for (const match of line.matchAll(markdownLinkPattern)) {
      addUrl(match[1], file, lineNumber);
    }

    htmlHrefPattern.lastIndex = 0;
    for (const match of line.matchAll(htmlHrefPattern)) {
      addUrl(match[2], file, lineNumber);
    }

    bareUrlPattern.lastIndex = 0;
    for (const match of line.matchAll(bareUrlPattern)) {
      addUrl(match[2], file, lineNumber);
    }
  });
}

function addUrl(rawUrl, file, line) {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized || !shouldCheckUrl(normalized)) return;

  const locations = locationsByUrl.get(normalized) ?? [];
  locations.push({ file, line });
  locationsByUrl.set(normalized, locations);
}

function normalizeUrl(value) {
  const trimmed = value.trim().replace(/[),.;]+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) return "";

  try {
    const url = new URL(trimmed);
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function shouldCheckUrl(url) {
  if (ignoredLinkPatterns.some((pattern) => pattern.test(url))) return false;

  const parsed = new URL(url);
  if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return false;

  return true;
}

async function checkUrl(url) {
  const locations = locationsByUrl.get(url) ?? [];
  if (ignoredLinkPatterns.some((pattern) => pattern.test(url))) {
    return { url, locations, category: "ignored", detail: "ignored by pattern" };
  }

  const head = await requestUrl(url, "HEAD");
  if (head.ok || !shouldRetryWithGet(head)) {
    return classifyResult(url, locations, head);
  }

  const get = await requestUrl(url, "GET");
  return classifyResult(url, locations, get);
}

function shouldRetryWithGet(result) {
  return result.status === 405 || result.status === 403 || result.status === 404 || result.error;
}

async function requestUrl(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), linkCheckOptions.timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": linkCheckOptions.userAgent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        ...(method === "GET" ? { "Range": "bytes=0-0" } : {})
      }
    });

    return {
      ok: response.status >= 200 && response.status <= 399,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.name === "AbortError" ? "timeout" : error.message : String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function classifyResult(url, locations, result) {
  if (result.ok) {
    return { url, locations, category: "ok", status: result.status };
  }

  if (result.status === 404 || result.status === 410) {
    return { url, locations, category: "broken", status: result.status, detail: result.statusText };
  }

  if (result.status === 401 || result.status === 403) {
    return { url, locations, category: "restricted", status: result.status, detail: result.statusText };
  }

  if (result.status === 429) {
    return { url, locations, category: "rateLimited", status: result.status, detail: result.statusText };
  }

  if (result.status && result.status >= 500) {
    return { url, locations, category: "server", status: result.status, detail: result.statusText };
  }

  return { url, locations, category: "network", detail: result.error ?? result.statusText ?? "network error" };
}

async function mapLimit(items, limit, mapper) {
  const results = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function toRepoPath(file) {
  return path.relative(rootDir, file).split(path.sep).join("/");
}
