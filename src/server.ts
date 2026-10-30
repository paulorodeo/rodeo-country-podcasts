import "./lib/error-capture";
import { serveRss, type PodcastRssKV } from "./lib/rss-response.server";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

/**
 * Nitro's Cloudflare adapter does not forward the binding as the second
 * argument of the TanStack server entry. Read the native Workers env instead.
 */
async function getPodcastKv(directEnv: unknown): Promise<PodcastRssKV | undefined> {
  const direct = (directEnv as { PODCAST_RSS_KV?: PodcastRssKV } | undefined)?.PODCAST_RSS_KV;
  if (direct) return direct;
  try {
    const runtime = await import("cloudflare:workers");
    return (runtime.env as unknown as { PODCAST_RSS_KV?: PodcastRssKV }).PODCAST_RSS_KV;
  } catch {
    return (process.env as unknown as { PODCAST_RSS_KV?: PodcastRssKV }).PODCAST_RSS_KV;
  }
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/healthz") {
      const bound = Boolean(await getPodcastKv(env));
      return Response.json({ status: "ok", service: "rodeo-country-podcasts", rssStoreBound: bound }, {
        headers: { "cache-control": "no-store" },
      });
    }
    if (request.method === "GET" && (url.pathname === "/rss" || url.pathname === "/rss/")) {
      return Response.redirect(new URL("/rss.xml", request.url), 301);
    }
    if (request.method === "GET" && url.pathname === "/rss.xml") {
      const { loadFeed } = await import("./lib/feed.server");
      const kv = await getPodcastKv(env);
      return serveRss(() => loadFeed({ probeMedia: true }), kv);
    }
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
