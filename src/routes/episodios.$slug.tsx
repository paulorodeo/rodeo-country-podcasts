import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { feedQuery } from "@/lib/feed.functions";
import { fmtDate, fmtDuration } from "@/lib/format";
import { media } from "@/lib/media";
import { PlayButton } from "@/components/player/PlayButton";

/** SEO summaries are short plain text; keep the complete RSS description in the episode body. */
function seoDescription(value: string | undefined): string {
  const text = (value || "Episódio da Rodeo Country Media.")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ").trim();
  return text.length > 155 ? text.slice(0, 152).trimEnd() + "…" : text;
}

export const Route = createFileRoute("/episodios/$slug")({
  loader: async ({ context, params }) => {
    const feed = await context.queryClient.ensureQueryData(feedQuery);
    const ep = feed.episodes.find((e) => e.slug === params.slug);
    if (!ep) throw notFound();
    return { title: ep.title, description: ep.description, image: ep.image };
  },
  head: ({ params, loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — Rodeo Country Podcasts` : "Episódio — Rodeo Country Podcasts" },
      { name: "description", content: seoDescription(loaderData?.description) },
      { property: "og:title", content: loaderData?.title ?? "Episódio — Rodeo Country Podcasts" },
      { property: "og:description", content: seoDescription(loaderData?.description) },
      { name: "twitter:description", content: seoDescription(loaderData?.description) },
      { property: "og:type", content: "article" },
      { property: "og:image:alt", content: `Capa do episódio ${loaderData?.title ?? "Rodeo Country Podcasts"}` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `https://podcast.fazenda.rodeo/episodios/${encodeURIComponent(params.slug)}` },
      ...(loaderData?.image?.startsWith("https://") ? [{ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image }] : [{ property: "og:image", content: `https://podcast.fazenda.rodeo${media.cover.src}` }, { name: "twitter:image", content: `https://podcast.fazenda.rodeo${media.cover.src}` }]),
    ],
    links: [{ rel: "canonical", href: `https://podcast.fazenda.rodeo/episodios/${encodeURIComponent(params.slug)}` }],
  }),
  component: EpisodePage,
});

function EpisodePage() {
  const { slug } = Route.useParams();
  const { data: feed } = useSuspenseQuery(feedQuery);
  const ep = feed.episodes.find((e) => e.slug === slug);
  if (!ep) return null;
  return (
    <article className="surface-wood py-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[360px_1fr]">
        <div className="rounded-md p-[3px] shadow-[var(--shadow-deep)]" style={{ background: "var(--gold-edge)" }}>
          <img src={ep.image ?? media.cover.src} width={600} height={600} alt={`Capa do episódio ${ep.title}`} loading="eager" fetchPriority="high" decoding="async" className="aspect-square w-full rounded-[5px] object-cover" />
        </div>
        <div>
          <Link to="/episodios" className="text-xs font-bold uppercase tracking-[0.18em] text-gold hover:underline">← Episódios</Link>
          <p className="mt-6 text-[0.7rem] font-extrabold uppercase tracking-[0.24em] text-gold">Rodeo Country Media{ep.episode ? ` · T${ep.season ?? 1}E${ep.episode}` : ""}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ivory sm:text-5xl">{ep.title}</h1>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-champagne">
            {[fmtDate(ep.pubDate), fmtDuration(ep.durationSec)].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <PlayButton ep={ep} />
            <span className="text-sm text-body">Ouvir episódio</span>
          </div>
          {ep.description && <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-body">{ep.description}</p>}
        </div>
      </div>
    </article>
  );
}
