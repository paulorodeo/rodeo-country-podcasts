/**
 * Short, readable teaser for the homepage. The original RSS description stays
 * untouched and remains available on the individual episode page and in RSS.
 */
export function episodeExcerpt(description: string, limit = 240): string {
  const clean = description.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const chars = Array.from(clean);
  if (chars.length <= limit) return clean;

  const prefix = chars.slice(0, limit).join("");
  const punctuation = [...prefix.matchAll(/[.!?](?=\s|$)/g)].map((match) => match.index! + 1);
  const sentenceEnd = punctuation.filter((position) => position >= limit * 0.6).at(-1);
  const wordEnd = prefix.lastIndexOf(" ");
  const cut = sentenceEnd ?? (wordEnd >= limit * 0.65 ? wordEnd : prefix.length);
  return prefix.slice(0, cut).trimEnd() + "…";
}
