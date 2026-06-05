export const KOREA_TIME_ZONE = "Asia/Seoul";

export function getKoreaDateKey(dateInput: Date | string | number = new Date()) {
  const date = normalizeDate(dateInput);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KOREA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeDate(dateInput: Date | string | number) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid date input: ${dateInput}`);
  }

  return date;
}
