const DEFAULT_PATHS = [
  "/",
  "/blog/",
  "/categories/",
  "/tags/",
  "/series/",
  "/search/",
  "/rss.xml",
  "/sitemap.xml"
];

const baseUrl = normalizeBaseUrl(process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:4322");
const retries = Number(process.env.SMOKE_RETRIES ?? 3);
const retryDelayMs = Number(process.env.SMOKE_RETRY_DELAY_MS ?? 1500);
const paths = (process.env.SMOKE_PATHS ?? DEFAULT_PATHS.join(","))
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const failures = [];

for (const path of paths) {
  const url = new URL(path, baseUrl).toString();
  const result = await checkUrlWithRetry(url, retries, retryDelayMs);

  if (result.ok) {
    console.log(`OK ${result.status} ${url}`);
    continue;
  }

  failures.push(result);
  console.error(`FAIL ${result.status ?? "ERR"} ${url} ${result.error ?? ""}`.trim());
}

if (failures.length > 0) {
  console.error(`Smoke test failed for ${failures.length} URL(s).`);
  process.exit(1);
}

console.log(`Smoke test passed for ${paths.length} URL(s).`);

async function checkUrlWithRetry(url, retryCount, delayMs) {
  let lastResult = { ok: false, url, error: "not attempted" };

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    lastResult = await checkUrl(url);

    if (lastResult.ok) return lastResult;
    if (attempt < retryCount) await delay(delayMs);
  }

  return lastResult;
}

async function checkUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "guseoh-blog-smoke-test"
      }
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      return { ok: false, url, status: response.status, error: response.statusText };
    }

    if (url.endsWith(".xml") && !contentType.includes("xml")) {
      return { ok: false, url, status: response.status, error: `unexpected content-type ${contentType}` };
    }

    if (!url.endsWith(".xml") && !contentType.includes("text/html")) {
      return { ok: false, url, status: response.status, error: `unexpected content-type ${contentType}` };
    }

    return { ok: true, url, status: response.status };
  } catch (error) {
    return {
      ok: false,
      url,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
