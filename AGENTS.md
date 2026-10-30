<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Podcast data comes only from the AzuraCast RSS via `src/lib/feed.server.ts` (server-side, cached); never fabricate episodes — demo content must be visibly labelled as preview.
- `/rss.xml` re-packages the origin feed (real enclosure bytes, itunes:duration, pt-BR) because the origin emits invalid values.
- The app's single `<audio>` lives in `PlayerProvider` in `__root.tsx` so playback survives SPA navigation; never add another audio element.
- Images are CDN assets (`src/assets/*.asset.json`) referenced through `src/lib/media.ts` with srcset.
- Reference-specific typography and section effects use named global CSS classes and semantic tokens; use fixed breakpoint font sizes rather than viewport-based scaling to keep mobile text stable.
