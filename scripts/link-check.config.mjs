export const ignoredLinkPatterns = [
  /^https?:\/\/(?:www\.)?example\.(?:com|org|net)(?:\/|$)/i,
  /^https?:\/\/localhost(?::\d+)?(?:\/|$)/i,
  /^https?:\/\/127\.0\.0\.1(?::\d+)?(?:\/|$)/i,
  /^https?:\/\/0\.0\.0\.0(?::\d+)?(?:\/|$)/i,
  /^https?:\/\/github\.com\/guseoh\/guseoh\.github\.io\/actions(?:\/|$)/i
];

export const linkCheckOptions = {
  concurrency: 4,
  timeoutMs: 9000,
  userAgent: "guseoh-blog-link-check/1.0"
};
