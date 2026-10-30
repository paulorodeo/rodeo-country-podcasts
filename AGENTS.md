# Rodeo Country Podcasts — technical rules

- Infrastructure: TanStack Start, Vite, Cloudflare Workers, Cloudflare KV and AzuraCast.
- Podcast episodes are sourced only from the AzuraCast RSS in `src/lib/feed.server.ts`. Never fabricate published episodes; demo material must be identified as demonstration.
- Public RSS: `/rss.xml` and the redirect alias `/rss`. Preserve GUID, enclosure and duration semantics; retain the KV binding.
- There is only one audio element in `PlayerProvider`, preserving playback across client navigation. Do not introduce autoplay.
- Local image URLs are stored in `src/assets/*.json` and the binaries are served under `/media/`.
- Preserve Golden Premium visual identity, accessible contrast and responsive LCP image preload.
- Build and deploy only through standard Vite/TanStack Start/Cloudflare tooling.
- Verify routes, the live audio player, the RSS XML and the image MIME types before promoting a production release.
