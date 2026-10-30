import { describe, expect, it } from "vitest";
import { formatItunesDuration, repackageXml } from "@/lib/feed.server";
import type { PodcastFeed } from "@/lib/feed.types";

const xml = `<rss><channel><language>en</language><atom:link rel="self" type="application/rss+xml" href="https, x"/>
<item><title>A</title><enclosure url="https://x/a.mp3" length="199.84" type="audio/mpeg"/><guid isPermaLink="false">g1</guid><pubDate>Thu, 29 Oct 2026 21:11:37 +0000</pubDate></item></channel></rss>`;

const feed = { episodes: [{ guid: "g1", bytes: 8119947, durationSec: 200 }] } as unknown as PodcastFeed;

describe("feed repackaging", () => {
  const out = repackageXml(xml, feed);
  it("forces pt-BR language", () => expect(out).toContain("<language>pt-BR</language>"));
  it("replaces invalid enclosure length with real bytes", () => expect(out).toContain('length="8119947"'));
  it("adds itunes:duration", () => expect(out).toContain("<itunes:duration>03:20</itunes:duration>"));
  it("preserves guid and pubDate", () => {
    expect(out).toContain(">g1</guid>");
    expect(out).toContain("Thu, 29 Oct 2026 21:11:37 +0000");
  });
  it("formats hour-long durations", () => expect(formatItunesDuration(3725)).toBe("1:02:05"));
});
