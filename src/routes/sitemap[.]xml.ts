import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://podcast.fazenda.rodeo";
const STATIC = ["/", "/episodios", "/programas", "/sobre"];

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let dynamic: Array<{ path: string; lastmod: string | null }> = [];
        try {
          const { loadFeed } = await import("@/lib/feed.server");
          const { feed } = await loadFeed();
          dynamic = feed.episodes.slice(0, 2000).map((ep) => ({
            path: "/episodios/" + encodeURIComponent(ep.slug),
            lastmod: ep.pubDate
          }));
        } catch (error) {
          console.error("Podcast sitemap: feed unavailable; serving static routes", error);
        }
        const entries = [
          ...STATIC.map(path => ({ path, lastmod: null as string | null })),
          ...dynamic
        ];
        const urls = entries.map(({ path, lastmod }) => {
          const absolute = escapeXml(BASE + path);
          const date = lastmod && !Number.isNaN(Date.parse(lastmod))
            ? "<lastmod>" + new Date(lastmod).toISOString().slice(0, 10) + "</lastmod>"
            : "";
          return "<url><loc>" + absolute + "</loc>" + date + "</url>";
        }).join("");
        return new Response('<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + "</urlset>", {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=300"
          }
        });
      }
    }
  }
});
