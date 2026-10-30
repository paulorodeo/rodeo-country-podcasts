// Server-only RSS layer for the AzuraCast origin.
// Preserves GUIDs, dates and audio URLs; computes real enclosure bytes and
// itunes:duration (the origin sends an invalid decimal `length`), and forces pt-BR.
import type { Episode, PodcastFeed } from "./feed.types";

export const ORIGIN_FEED_URL =
  "https://live.fazenda.rodeo/public/1/podcast/1f1d3dcf-d633-6d18-bad2-c7446e873a40/feed";
export const CANONICAL_FEED_URL = "https://podcast.fazenda.rodeo/rss.xml";
const TTL_MS = 5 * 60 * 1000;

type Cache = { at: number; feed: PodcastFeed; xml: string | null };
let cache: Cache | null = null;
const mediaCache = new Map<string, { bytes: number | null; duration: number | null }>();

export function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function tag(xml: string, name: string): string | null {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
  const m = xml.match(re);
  return m ? decodeEntities((m[1] ?? "").trim()) : null;
}
function attr(xml: string, name: string, a: string): string | null {
  const re = new RegExp(`<${name}\\s[^>]*?${a}="([^"]*)"`, "i");
  const m = xml.match(re);
  return m ? decodeEntities(m[1] ?? "") : null;
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatItunesDuration(sec: number): string {
  const t = Math.round(sec);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

const BR_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BR_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

/** Duration from MP3 headers: Xing/Info/VBRI frame count when present, else CBR estimate. */
export function mp3Duration(buf: Uint8Array, totalBytes: number): number | null {
  const at = (o: number) => buf[o] ?? 0;
  let off = 0;
  if (at(0) === 0x49 && at(1) === 0x44 && at(2) === 0x33) {
    const size = ((at(6) & 0x7f) << 21) | ((at(7) & 0x7f) << 14) | ((at(8) & 0x7f) << 7) | (at(9) & 0x7f);
    off = 10 + size + (at(5) & 0x10 ? 10 : 0);
  }
  for (let i = off; i < buf.length - 4; i++) {
    if (at(i) !== 0xff || (at(i + 1) & 0xe0) !== 0xe0) continue;
    const ver = (at(i + 1) >> 3) & 3; // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    const layer = (at(i + 1) >> 1) & 3; // 1 = Layer III
    const bri = (at(i + 2) >> 4) & 15;
    const sri = (at(i + 2) >> 2) & 3;
    if (ver === 1 || layer !== 1 || bri === 0 || bri === 15 || sri === 3) continue;
    const mpeg1 = ver === 3;
    const sr = ([44100, 48000, 32000][sri] ?? 44100) / (mpeg1 ? 1 : ver === 2 ? 2 : 4);
    const spf = mpeg1 ? 1152 : 576;
    const mono = ((at(i + 3) >> 6) & 3) === 3;
    const xo = i + (mpeg1 ? (mono ? 21 : 36) : mono ? 13 : 21);
    const str = (o: number) => String.fromCharCode(at(o), at(o + 1), at(o + 2), at(o + 3));
    const u32 = (o: number) => ((at(o) << 24) | (at(o + 1) << 16) | (at(o + 2) << 8) | at(o + 3)) >>> 0;
    if (xo + 12 < buf.length && (str(xo) === "Xing" || str(xo) === "Info") && u32(xo + 4) & 1) {
      return (u32(xo + 8) * spf) / sr;
    }
    const vo = i + 36;
    if (vo + 18 < buf.length && str(vo) === "VBRI") return (u32(vo + 14) * spf) / sr;
    const kbps = (mpeg1 ? BR_V1 : BR_V2)[bri] ?? 128;
    return ((totalBytes - i) * 8) / (kbps * 1000);
  }
  return null;
}

async function probeMedia(url: string) {
  const hit = mediaCache.get(url);
  if (hit) return hit;
  let bytes: number | null = null;
  let duration: number | null = null;
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-131071" }, redirect: "follow" });
    const cr = res.headers.get("content-range");
    if (cr && /\/(\d+)$/.test(cr)) bytes = Number(cr.match(/\/(\d+)$/)![1]);
    else if (res.status === 200) bytes = Number(res.headers.get("content-length")) || null;
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let got = 0;
    while (reader && got < 131072) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.length;
    }
    reader?.cancel().catch(() => {});
    const buf = new Uint8Array(Math.min(got, 131072));
    let p = 0;
    for (const c of chunks) {
      const take = Math.min(c.length, buf.length - p);
      buf.set(c.subarray(0, take), p);
      p += take;
      if (p >= buf.length) break;
    }
    if (bytes) duration = mp3Duration(buf, bytes);
  } catch (e) {
    console.error("probeMedia failed", e);
  }
  const out = { bytes, duration };
  if (bytes) mediaCache.set(url, out);
  return out;
}

function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function parseFeed(xml: string): Promise<PodcastFeed> {
  const channel = xml.split(/<item[\s>]/i)[0] ?? "";
  const categories = Array.from(new Set([...channel.matchAll(/<category>([\s\S]*?)<\/category>/gi)].map((m) => decodeEntities((m[1] ?? "").trim()))));
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((m) => m[1] ?? "");
  const usedSlugs = new Set<string>();
  const episodes: Episode[] = await Promise.all(
    items.map(async (it) => {
      const title = tag(it, "title") ?? "Episódio sem título";
      const guid = tag(it, "guid") ?? attr(it, "enclosure", "url") ?? title;
      const audioUrl = attr(it, "enclosure", "url");
      const itDur = tag(it, "itunes:duration");
      const probe = audioUrl ? await probeMedia(audioUrl) : { bytes: null, duration: null };
      let duration = probe.duration;
      if (!duration && itDur) {
        const parts = itDur.split(":").map(Number);
        duration = parts.reduce((a, n) => a * 60 + n, 0) || null;
      }
      return {
        guid,
        slug: "",
        title,
        description: tag(it, "description") ?? "",
        link: tag(it, "link"),
        pubDate: parseDate(tag(it, "pubDate")),
        audioUrl,
        audioType: attr(it, "enclosure", "type") ?? "audio/mpeg",
        bytes: probe.bytes,
        durationSec: duration ? Math.round(duration) : null,
        image: attr(it, "itunes:image", "href"),
        season: Number(tag(it, "itunes:season")) || null,
        episode: Number(tag(it, "itunes:episode")) || null,
      } satisfies Episode;
    }),
  );
  for (const ep of episodes) {
    let s = slugify(ep.title) || "episodio";
    if (usedSlugs.has(s)) s = `${s}-${slugify(ep.guid).slice(0, 8)}`;
    usedSlugs.add(s);
    ep.slug = s;
  }
  episodes.sort((a, b) => (b.pubDate ?? "").localeCompare(a.pubDate ?? ""));
  return {
    status: "ok",
    title: tag(channel, "title") ?? "Rodeo Country Podcasts",
    description: tag(channel, "description") ?? "",
    image: attr(channel, "itunes:image", "href"),
    author: tag(channel, "itunes:author"),
    language: "pt-BR",
    categories,
    episodes,
    fetchedAt: new Date().toISOString(),
  };
}

/** Re-packages the origin XML with corrections, keeping every other element intact. */
export function repackageXml(xml: string, feed: PodcastFeed): string {
  let out = xml.replace(/<language>[\s\S]*?<\/language>/i, "<language>pt-BR</language>");
  out = out.replace(/<atom:link[^>]*rel="self"[^>]*\/>/i, `<atom:link rel="self" type="application/rss+xml" href="${CANONICAL_FEED_URL}"/>`);
  const byGuid = new Map(feed.episodes.map((e) => [e.guid, e]));
  out = out.replace(/<item(\s[^>]*)?>([\s\S]*?)<\/item>/gi, (whole, a, body: string) => {
    const g = tag(body, "guid");
    const ep = g ? byGuid.get(g) : undefined;
    if (!ep) return whole;
    let b = body;
    if (ep.bytes) b = b.replace(/(<enclosure\s[^>]*?length=")[^"]*(")/i, `$1${ep.bytes}$2`);
    if (ep.durationSec && !/<itunes:duration>/i.test(b)) {
      b = b.replace(/(<\/pubDate>)/i, `$1\n            <itunes:duration>${formatItunesDuration(ep.durationSec)}</itunes:duration>`);
    }
    return `<item${a ?? ""}>${b}</item>`;
  });
  return out;
}

export async function loadFeed(): Promise<{ feed: PodcastFeed; xml: string | null }> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;
  try {
    const res = await fetch(ORIGIN_FEED_URL, { headers: { Accept: "application/rss+xml, application/xml" } });
    if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
    const xml = await res.text();
    if (!/<rss[\s>]/i.test(xml) || !/<channel[\s>]/i.test(xml)) throw new Error("Feed XML inválido");
    const feed = await parseFeed(xml);
    cache = { at: Date.now(), feed, xml: repackageXml(xml, feed) };
    return cache;
  } catch (e) {
    console.error("loadFeed failed", e);
    if (cache) return cache; // last good copy beats nothing
    return {
      feed: {
        status: "unavailable",
        title: "Rodeo Country Podcasts",
        description: "",
        image: null,
        author: null,
        language: "pt-BR",
        categories: [],
        episodes: [],
        fetchedAt: new Date().toISOString(),
      },
      xml: null,
    };
  }
}
