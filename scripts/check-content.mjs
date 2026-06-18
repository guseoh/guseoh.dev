import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(rootDir, "src", "content", "blog");
const markdownImagePattern = /!\[([^\]]*)\]\(([^)]*)\)/g;
const htmlImagePattern = /<img\b[^>]*>/gi;
const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const markerPattern = /\s*\{(?:no-dark-filter|theme-safe|data-theme-safe|no-lightbox|lightbox-false)\}\s*/gi;

const failures = [];
const warnings = [];
const files = await listMarkdownFiles(contentDir);

for (const file of files) {
  const relativePath = toRepoPath(file);
  const source = await readFile(file, "utf8");
  const lines = source.split(/\r?\n/);
  const frontmatter = readFrontmatter(lines);

  if (!frontmatter) {
    fail(relativePath, 1, "frontmatter가 없습니다.");
    continue;
  }

  checkFrontmatterIndentation(relativePath, lines);
  checkDates(relativePath, frontmatter);
  checkImages(relativePath, lines);
  checkHeadingHierarchy(relativePath, lines);
}

for (const warning of warnings) {
  console.warn(warning);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }

  console.error(`Content check failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(`Content check passed for ${files.length} post(s).`);
if (warnings.length > 0) {
  console.log(`Content check completed with ${warnings.length} warning(s).`);
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

function readFrontmatter(lines) {
  if (lines[0]?.trim() !== "---") return null;

  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex === -1) return null;

  const values = new Map();
  for (let index = 1; index < endIndex; index += 1) {
    const match = lines[index].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!match) continue;

    values.set(match[1], {
      line: index + 1,
      value: cleanScalar(match[2])
    });
  }

  return values;
}

function cleanScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function checkFrontmatterIndentation(relativePath, lines) {
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex === -1) return;

  for (let index = 1; index < endIndex; index += 1) {
    const line = lines[index];

    if (/^\s+[A-Za-z][\w-]*:\s*/.test(line)) {
      fail(relativePath, index + 1, "frontmatter의 top-level key가 들여쓰기되어 있습니다.");
    }
  }
}

function checkDates(relativePath, frontmatter) {
  const date = requireDate(relativePath, frontmatter, "date");
  const updated = optionalDate(relativePath, frontmatter, "updated");
  const lastVerified = optionalDate(relativePath, frontmatter, "lastVerified");

  if (!date) return;

  if (updated && updated.value < date.value) {
    fail(relativePath, updated.line, "`updated`는 `date`보다 빠를 수 없습니다.");
  }

  if (lastVerified && lastVerified.value < date.value) {
    fail(relativePath, lastVerified.line, "`lastVerified`는 `date`보다 빠를 수 없습니다.");
  }
}

function requireDate(relativePath, frontmatter, key) {
  const entry = frontmatter.get(key);
  if (!entry?.value) {
    fail(relativePath, 1, `frontmatter에 \`${key}\`가 없습니다.`);
    return null;
  }

  return parseDate(relativePath, key, entry);
}

function optionalDate(relativePath, frontmatter, key) {
  const entry = frontmatter.get(key);
  if (!entry?.value) return null;
  return parseDate(relativePath, key, entry);
}

function parseDate(relativePath, key, entry) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.value)) {
    fail(relativePath, entry.line, `\`${key}\`는 YYYY-MM-DD 형식이어야 합니다.`);
    return null;
  }

  const date = new Date(`${entry.value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== entry.value) {
    fail(relativePath, entry.line, `\`${key}\` 날짜가 유효하지 않습니다.`);
    return null;
  }

  return entry;
}

function checkImages(relativePath, lines) {
  forEachContentLine(lines, (line, lineNumber) => {
    markdownImagePattern.lastIndex = 0;
    for (const match of line.matchAll(markdownImagePattern)) {
      const alt = cleanAlt(match[1]);
      if (alt.length === 0) {
        fail(relativePath, lineNumber, `Markdown 이미지 alt가 비어 있습니다: ${match[2]}`);
      }
    }

    htmlImagePattern.lastIndex = 0;
    for (const match of line.matchAll(htmlImagePattern)) {
      const tag = match[0];
      const altMatch = tag.match(/\balt=(["'])(.*?)\1/i);
      if (!altMatch || cleanAlt(altMatch[2]).length === 0) {
        fail(relativePath, lineNumber, "HTML 이미지에는 비어 있지 않은 alt가 필요합니다.");
      }
    }
  });
}

function cleanAlt(value) {
  return value.replace(markerPattern, " ").replace(/\s{2,}/g, " ").trim();
}

function checkHeadingHierarchy(relativePath, lines) {
  let previousDepth = null;
  const seen = new Map();

  forEachContentLine(lines, (line, lineNumber) => {
    const match = line.match(headingPattern);
    if (!match) return;

    const depth = match[1].length;
    const label = normalizeHeading(match[2]);

    if (depth === 1) {
      fail(relativePath, lineNumber, "본문에서는 `#` heading을 사용하지 않습니다. 글 제목이 h1입니다.");
    }

    if (previousDepth === null && depth > 2) {
      fail(relativePath, lineNumber, "본문 첫 heading은 `##`부터 시작해야 합니다.");
    } else if (previousDepth !== null && depth > previousDepth + 1) {
      fail(relativePath, lineNumber, `heading 단계가 \`h${previousDepth}\`에서 \`h${depth}\`로 건너뜁니다.`);
    }

    if (label) {
      const firstSeenLine = seen.get(label);
      if (firstSeenLine) {
        warn(relativePath, lineNumber, `같은 글 안에 중복 heading이 있습니다: "${match[2].trim()}" (처음: ${firstSeenLine}행)`);
      } else {
        seen.set(label, lineNumber);
      }
    }

    previousDepth = depth;
  });
}

function normalizeHeading(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/^\d+(?:\.\d+)*[.)]?\s+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function forEachContentLine(lines, callback) {
  let fence = null;

  lines.forEach((line, index) => {
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      fence = fence ? null : fenceMatch[1].slice(0, 3);
      return;
    }

    if (!fence) {
      callback(line, index + 1);
    }
  });
}

function fail(relativePath, line, message) {
  failures.push(`[content:check] ${relativePath}:${line} ${message}`);
}

function warn(relativePath, line, message) {
  warnings.push(`[content:warn] ${relativePath}:${line} ${message}`);
}

function toRepoPath(file) {
  return path.relative(rootDir, file).split(path.sep).join("/");
}
