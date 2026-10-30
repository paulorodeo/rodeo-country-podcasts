export interface PodcastRssKV {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

const key = "rodeo-podcasts/rss-backup-v1";

export async function serveRss(
  loader: () => Promise<{ xml: string | null }>,
  kv?: PodcastRssKV,
): Promise<Response> {
  let xml: string | null = null;
  try {
    xml = (await loader()).xml;
  } catch (error) {
    console.error("RSS origin failed", error);
  }

  if (xml && xml.includes("<rss") && xml.includes("</rss>")) {
    if (kv) {
      try { await kv.put(key, xml); } catch (error) { console.error("RSS cache failed", error); }
    }
    return new Response(xml, {
      status: 200,
      headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" },
    });
  }

  if (kv) {
    try { xml = await kv.get(key); } catch (error) { console.error("RSS backup unavailable", error); }
  }
  if (xml && xml.includes("<rss") && xml.includes("</rss>")) {
    return new Response(xml, {
      status: 200,
      headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=60", "x-rodeo-rss": "cached-backup" },
    });
  }

  return new Response("Feed indisponível", { status: 503, headers: { "retry-after": "300", "cache-control": "no-store" } });
}
