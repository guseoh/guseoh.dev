const SERIES_CONTINUATION_MESSAGES = new Map([
  ["board-프로젝트-성능-개선", "다음 성능 개선 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."],
  ["board-프로젝트-개선-기록", "다음 성능 개선 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."],
  ["data-structure", "다음 자료구조 학습 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."],
  ["아주-쉬운-세가지-이야기", "다음 운영체제 학습 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다."]
]);

function normalizeSeriesName(seriesName: string) {
  return seriesName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function getSeriesContinuationMessage(seriesName: string) {
  const normalizedName = normalizeSeriesName(seriesName);
  const metadataMessage = SERIES_CONTINUATION_MESSAGES.get(normalizedName);

  if (metadataMessage) return metadataMessage;

  return `다음 ${seriesName} 기록이 발행되면 이 시리즈 목록에 이어서 연결됩니다.`;
}
