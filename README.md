# Rodeo Country Podcasts

Independent podcast portal for Fazenda Rodeo / Rodeo Country Media, available at https://podcast.fazenda.rodeo/.

## Architecture

- **Frontend and SSR:** React, TypeScript, TanStack Start, Tailwind CSS, Vite.
- **Hosting:** Cloudflare Workers (custom domain), with static artwork under `/media/`.
- **Distribution:** AzuraCast is the audio and episode source. The public canonical RSS remains `https://podcast.fazenda.rodeo/rss.xml` and `/rss` redirects there.
- **Persistence:** Cloudflare KV binding `PODCAST_RSS_KV` stores the normalized feed.
- **Audio:** One persistent HTML5 audio element, no autoplay.
- **Design:** Golden Premium country, dark background and metallic gold typography. Fonts are self-hosted with Fontsource.

## Development

Use Bun (with a reviewed lockfile).

```sh
bun install --frozen-lockfile
bun run test
bun run build
bun run dev
```

## Deploy

Cloudflare configuration is versioned in `wrangler.jsonc`. The build uses the official Cloudflare Vite plugin. Deploy with `bun run deploy` only after the build, endpoint and playback checks pass.

Production: `https://podcast.fazenda.rodeo/`  
RSS: `https://podcast.fazenda.rodeo/rss.xml`  
Worker: `paulorodeo-rodeo-country-podcasts`

The canonical feed and public episode URLs are designed to remain independent of the CMS and of the original audio host.
