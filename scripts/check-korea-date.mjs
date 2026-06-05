import assert from "node:assert/strict";
import {
  addDateKeyDays,
  getKoreaDateKey,
  getKoreaDayUtcRange
} from "./korea-date.mjs";

const cases = [
  ["2026-06-05T14:59:59.999Z", "2026-06-05"],
  ["2026-06-05T15:00:00.000Z", "2026-06-06"],
  ["2026-06-05T21:00:00.000Z", "2026-06-06"],
  ["2026-06-06T14:59:59.999Z", "2026-06-06"],
  ["2026-06-06T15:00:00.000Z", "2026-06-07"]
];

for (const [instant, expectedDateKey] of cases) {
  assert.equal(getKoreaDateKey(instant), expectedDateKey, instant);
}

assert.equal(addDateKeyDays("2026-06-06", -364), "2025-06-07");
assert.equal(addDateKeyDays("2024-03-01", -1), "2024-02-29");

const range = getKoreaDayUtcRange("2026-06-06");
assert.equal(range.start.toISOString(), "2026-06-05T15:00:00.000Z");
assert.equal(range.end.toISOString(), "2026-06-06T14:59:59.999Z");

console.log(`Korea date boundary test passed for ${cases.length} instant(s).`);
