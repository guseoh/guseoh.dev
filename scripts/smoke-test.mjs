import { lookup } from "node:dns/promises";

const DEFAULT_PATHS = [
  "/",
  "/blog/",
  "/books/",
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
const requestTimeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 10000);
const allowDnsFailure = process.env.SMOKE_ALLOW_DNS_FAILURE === "true";
const paths = (process.env.SMOKE_PATHS ?? DEFAULT_PATHS.join(","))
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const failures = [];

if (allowDnsFailure && (await isHostPendingDns(baseUrl.hostname, requestTimeoutMs))) {
  console.warn(`Smoke test skipped because ${baseUrl.hostname} is not resolvable yet.`);
  process.exit(0);
}

for (const path of paths) {
  const url = new URL(path, baseUrl).toString();
  const result = await checkUrlWithRetry(url, retries, retryDelayMs, requestTimeoutMs);

  if (result.ok) {
    console.log(`OK ${result.status} ${url}`);
    continue;
  }

  failures.push(result);
  console.error(`FAIL ${result.status ?? "ERR"} ${url} ${result.error ?? ""}`.trim());

  if (allowDnsFailure && isDnsFailure(result)) {
    console.warn(`Smoke test skipped because ${baseUrl.hostname} is not resolvable yet.`);
    process.exit(0);
  }
}

if (failures.length > 0) {
  if (allowDnsFailure && failures.every(isDnsFailure)) {
    console.warn(`Smoke test skipped because ${baseUrl.hostname} is not resolvable yet.`);
    process.exit(0);
  }

  console.error(`Smoke test failed for ${failures.length} URL(s).`);
  process.exit(1);
}

console.log(`Smoke test passed for ${paths.length} URL(s).`);

async function checkUrlWithRetry(url, retryCount, delayMs, timeoutMs) {
  let lastResult = { ok: false, url, error: "not attempted" };

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    lastResult = await checkUrl(url, timeoutMs);

    if (lastResult.ok) return lastResult;
    if (attempt < retryCount) await delay(delayMs);
  }

  return lastResult;
}

async function checkUrl(url, timeoutMs) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "guseoh-blog-smoke-test"
      },
      signal: AbortSignal.timeout(timeoutMs)
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
    const cause = error instanceof Error ? error.cause : undefined;
    const errorCode = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : undefined;

    return {
      ok: false,
      url,
      error: error instanceof Error ? error.message : String(error),
      errorCode
    };
  }
}

function isDnsFailure(result) {
  return result.errorCode === "ENOTFOUND" || result.errorCode === "EAI_AGAIN";
}

async function isHostPendingDns(hostname, timeoutMs) {
  try {
    await withTimeout(lookup(hostname), Math.min(timeoutMs, 5000));
    return false;
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : undefined;
    return code === "ENOTFOUND" || code === "EAI_AGAIN";
  }
}

function withTimeout(promise, timeoutMs) {
  let timer;

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        const error = new Error("DNS lookup timed out");
        error.code = "EAI_AGAIN";
        reject(error);
      }, timeoutMs);
    })
  ]);
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
