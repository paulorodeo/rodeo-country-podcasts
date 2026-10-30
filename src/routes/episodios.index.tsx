import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { feedQuery } from "@/lib/feed.functions";
import { EpisodeCard } from "@/components/episodes/EpisodeCard";
import { SectionHead } from "@/components/home/Sections";

export const Route = createFileRoute("/episodios/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(feedQuery),
  head: () => ({
    meta: [
      { title: "Episódios — Rodeo Country Podcasts" },
      { name: "description", content: "Catálogo completo de episódios publicados da Rodeo Country Media." },
      { property: "og:title", content: "Episódios — Rodeo Country Podcasts" },
      { property: "og:description", content: "Todos os episódios publicados da Rodeo Country Media." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://podcast.fazenda.rodeo/episodios" },
    ],
    links: [{ rel: "canonical", href: "https://podcast.fazenda.rodeo/episodios" }],
  }),
  component: Episodes,
});

function Episodes() {
  const { data: feed } = useSuspenseQuery(feedQuery);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return feed.episodes.filter((e) => !n || `${e.title} ${e.description}`.toLowerCase().includes(n));
  }, [feed, q]);
  return (
    <div className="surface-wood min-h-[60vh] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead kicker="Catálogo" title="Todos os episódios" desc="Episódios publicados no feed oficial, do mais recente ao mais antigo." />
        <label className="relative mt-8 block max-w-md">
          <span className="sr-only">Buscar episódios</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" aria-hidden />
          <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busque episódios…" className="h-12 w-full rounded-full border border-input bg-background/60 pl-11 pr-5 text-sm text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
        </label>
        {feed.status === "unavailable" ? (
          <p role="status" className="mt-10 rounded-lg border border-border p-8 text-body">O feed de episódios está temporariamente indisponível. Tente novamente em alguns minutos.</p>
        ) : list.length === 0 ? (
          <p className="mt-10 text-body">Nenhum episódio encontrado.</p>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map((e) => <EpisodeCard key={e.guid} ep={e} />)}</div>
        )}
      </div>
    </div>
  );
}
