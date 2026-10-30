import { Link } from "@tanstack/react-router";
import { Calendar, Clock } from "lucide-react";
import type { Episode } from "@/lib/feed.types";
import { fmtDate, fmtDuration } from "@/lib/format";
import { media, type DEMO_EPISODES } from "@/lib/media";
import { usePlayer } from "@/lib/player";
import { PlayButton } from "@/components/player/PlayButton";

const card = "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-deep)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-gold/70";

export function EpisodeCard({ ep }: { ep: Episode }) {
  const p = usePlayer();
  const active = p.isCurrent(ep) && p.status === "playing";
  return (
    <article className={card}>
      <div className="relative aspect-[460/395] overflow-hidden">
        <img src={ep.image ?? media.cover.src} alt="" width={460} height={395} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        <div className="absolute bottom-3 left-3"><PlayButton ep={ep} size="md" /></div>
        {active && <span className="absolute right-3 top-3 rounded bg-background/80 px-2 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-bright-gold">▶ Tocando</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.18em] text-gold">
          Rodeo Country Media{ep.episode ? <span className="ml-3 text-muted-foreground">T{ep.season ?? 1}E{ep.episode}</span> : null}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-ivory">
          <Link to="/episodios/$slug" params={{ slug: ep.slug }} className="hover:text-champagne">{ep.title}</Link>
        </h3>
        {ep.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ep.description}</p>}
        <div className="mt-auto flex gap-5 pt-5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-champagne/80">
          {ep.pubDate && <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gold" aria-hidden /><time dateTime={ep.pubDate}>{fmtDate(ep.pubDate)}</time></span>}
          {ep.durationSec && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gold" aria-hidden />{fmtDuration(ep.durationSec)}</span>}
        </div>
      </div>
    </article>
  );
}

export function DemoCard({ d }: { d: (typeof DEMO_EPISODES)[number] }) {
  return (
    <article className={`${card} opacity-90`} aria-label={`Prévia de demonstração: ${d.title}`}>
      <div className="relative aspect-[460/395] overflow-hidden">
        <img src={d.img} srcSet={d.srcSet} sizes="(min-width:1024px) 300px, (min-width:640px) 45vw, 90vw" alt="" width={460} height={395} loading="lazy" decoding="async" className="h-full w-full object-cover grayscale-[25%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded border border-gold/60 bg-background/85 px-2 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-champagne">Prévia · Demonstração</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.18em] text-gold">{d.program} <span className="text-muted-foreground">· conceito</span></p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-ivory">{d.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.summary}</p>
        <p className="mt-auto pt-5 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">Não publicado · sem áudio</p>
      </div>
    </article>
  );
}
