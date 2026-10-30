import { afterEach, describe, expect, it, vi } from "vitest";
import { parseFeed, repackageXml } from "@/lib/feed.server";

const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Rodeo Country Podcasts</title>
    <language>pt-BR</language>
    <item>
      <title>Performance Probe Fixture</title>
      <guid>perf-fixture-2026-10-30</guid>
      <description>Programa de música country</description>
      <itunes:duration>03:20</itunes:duration>
      <enclosure url="https://live.fazenda.rodeo/tests/perf-fixture-2026-10-30.mp3" length="200.10" type="audio/mpeg"/>
    </item>
  </channel>
</rss>`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RSS rendering dependency chain", () => {
  it("parses the homepage feed without fetching MP3 metadata", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await parseFeed(xml);
    expect(result.episodes).toHaveLength(1);
    expect(result.episodes[0]?.durationSec).toBe(200);
    expect(result.episodes[0]?.bytes).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still reads the audio length when building the canonical RSS", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(new Uint8Array([0, 0, 0, 0]), {
        status: 206,
        headers: { "content-range": "bytes 0-3/8119947", "content-type": "audio/mpeg" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const result = await parseFeed(xml, { probeMedia: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.episodes[0]?.bytes).toBe(8119947);
    const fixed = repackageXml(xml, result);
    expect(fixed).toContain('length="8119947"');
    expect(fixed).toContain("perf-fixture-2026-10-30");
  });
});
