import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { loadFeed } = await import("@/lib/feed.server");
        const { xml } = await loadFeed({ probeMedia: true });
        if (!xml) {
          return new Response("Feed temporariamente indisponível.", {
            status: 503,
            headers: { "content-type": "text/plain; charset=utf-8", "retry-after": "300" },
          });
        }
        return new Response(xml, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
