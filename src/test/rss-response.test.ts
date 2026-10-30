import { describe, expect, it } from "vitest";
import { serveRss, type PodcastRssKV } from "@/lib/rss-response.server";

const xml = '<?xml version="1.0"?><rss><channel><title>Rodeo Country</title></channel></rss>';
const memory = new Map<string, string>();
const kv: PodcastRssKV = {
  async get(key) { return memory.get(key) ?? null; },
  async put(key, val) { memory.set(key, val); },
};

describe("Cloudflare RSS entrypoint", () => {
  it("returns 200 RSS and retains a last known good copy", async () => {
    memory.clear();
    const res = await serveRss(async () => ({ xml }), kv);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/rss+xml");
    expect(memory.size).toBe(1);
  });

  it("serves cached RSS when origin is unavailable", async () => {
    memory.clear();
    await serveRss(async () => ({ xml }), kv);
    const res = await serveRss(async () => { throw new Error("origin down"); }, kv);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-rodeo-rss")).toBe("cached-backup");
    expect(await res.text()).toBe(xml);
  });

  it("does not replace the last good copy with invalid XML", async () => {
    memory.clear();
    await serveRss(async () => ({ xml }), kv);
    await serveRss(async () => ({ xml: "<html>not rss</html>" }), kv);
    expect(Array.from(memory.values())[0]).toBe(xml);
  });

  it("returns 503 without a valid origin or cached snapshot", async () => {
    const res = await serveRss(async () => ({ xml: null }));
    expect(res.status).toBe(503);
    expect(res.headers.get("retry-after")).toBe("300");
  });
});
