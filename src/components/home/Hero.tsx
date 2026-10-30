import { Link } from "@tanstack/react-router";
import { BarChart3, Calendar, Clock, Volume2 } from "lucide-react";
import type { Episode, PodcastFeed } from "@/lib/feed.types";
import { fmtDate, fmtDuration, fmtTime } from "@/lib/format";
import { media } from "@/lib/media";
import { usePlayer } from "@/lib/player";
import { PlayButton } from "@/components/player/PlayButton";

export function Hero({ feed }: { feed: PodcastFeed }) {
  const ep = feed.episodes[0];
  return (
    <section aria-labelledby="hero-title" className="relative isolate -mt-[72px] overflow-hidden pt-[72px] lg:-mt-[84px] lg:pt-[84px]">
      {/* Studio photograph — right side */}
      <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[58%]">
        <img src={media.studio.src} srcSet={media.studio.srcSet} sizes="(min-width:1024px) 58vw, 100vw" width={780} height={880}
          alt="" fetchPriority="high" decoding="async" className="h-full w-full object-cover object-[70%_center] opacity-45 lg:opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>
      <div aria-hidden className="absolute -left-40 top-20 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgb(232_188_101/0.12),transparent_65%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:min-h-[600px] lg:grid-cols-[1.05fr_0.75fr_0.4fr] lg:pb-24 lg:pt-16">
        {ep ? <EpisodeIntro ep={ep} /> : <FallbackIntro />}
        <div className="order-2 mx-auto w-full max-w-[340px] lg:order-none lg:max-w-none">
          <CoverObject ep={ep} />
        </div>
      </div>
    </section>
  );
}

function EpisodeIntro({ ep }: { ep: Episode }) {
  const date = fmtDate(ep.pubDate);
  const dur = fmtDuration(ep.durationSec);
  return (
    <div className="contents lg:block">
      <div className="order-1 lg:order-none">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-gold">Último episódio</p>
        <h1 id="hero-title" className="mt-4 font-display text-4xl font-bold leading-[1.05] text-ivory sm:text-5xl lg:text-[3.6rem]">
          {ep.title}
        </h1>
      </div>
      <div className="order-3 lg:order-none">
        {ep.description && <p className="mt-5 max-w-xl text-base leading-relaxed text-body sm:text-lg">{ep.description}</p>}
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-champagne">
          {date && <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold" aria-hidden /><time dateTime={ep.pubDate!}>{date}</time></li>}
          {dur && <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gold" aria-hidden />{dur}</li>}
          <li className="flex items-center gap-2 text-gold"><BarChart3 className="h-4 w-4" aria-hidden />Rodeo Country Media{ep.episode ? ` · T${ep.season ?? 1}E${ep.episode}` : ""}</li>
        </ul>
        <HeroPlayer ep={ep} />
        <Link to="/episodios/$slug" params={{ slug: ep.slug }} className="mt-5 inline-block text-xs font-bold uppercase tracking-[0.18em] text-gold underline-offset-4 hover:underline">
          Página do episódio →
        </Link>
      </div>
    </div>
  );
}

function HeroPlayer({ ep }: { ep: Episode }) {
  const p = usePlayer();
  const mine = p.isCurrent(ep);
  const time = mine ? p.time : 0;
  const total = mine && p.duration ? p.duration : ep.durationSec ?? 0;
  const pct = total ? (time / total) * 100 : 0;
  return (
    <div className="mt-8 flex max-w-xl items-center gap-5 rounded-2xl border border-border bg-background/50 p-4 backdrop-blur-md">
      <PlayButton ep={ep} />
      <div className="min-w-0 flex-1">
        <div className="relative h-8" aria-hidden>
          <div className="absolute inset-0 flex items-center gap-[3px]">
            {Array.from({ length: 48 }, (_, i) => (
              <span key={i} className={`flex-1 rounded-full ${i / 48 * 100 < pct ? "bg-bright-gold" : "bg-muted-foreground/30"}`}
                style={{ height: `${Math.round(25 + Math.abs(Math.sin(i * 1.7) * 60 + Math.cos(i * 0.6) * 15))}%` }} />
            ))}
          </div>
        </div>
        <input type="range" min={0} max={total || 0} step={1} value={time} disabled={!mine}
          onChange={(e) => p.seek(Number(e.target.value))} aria-label="Posição do episódio" className="mt-1 h-1 w-full disabled:opacity-40" />
        <div className="mt-1 flex justify-between text-[0.7rem] tabular-nums text-muted-foreground">
          <span>{fmtTime(time)}</span>
          <span aria-live="polite" className="text-destructive">{mine && p.status === "error" ? p.error : mine && p.status === "loading" ? <span className="text-gold">Carregando…</span> : ""}</span>
          <span>{fmtTime(total)}</span>
        </div>
      </div>
      <label className="hidden items-center gap-2 sm:flex">
        <Volume2 className="h-5 w-5 text-champagne" aria-hidden />
        <span className="sr-only">Volume</span>
        <input type="range" min={0} max={1} step={0.05} value={p.volume} onChange={(e) => p.setVolume(Number(e.target.value))} className="w-20" />
      </label>
    </div>
  );
}

function FallbackIntro() {
  return (
    <div className="order-1">
      <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-gold">Rodeo Country Podcasts</p>
      <h1 id="hero-title" className="mt-4 font-display text-4xl font-bold leading-[1.05] text-ivory sm:text-5xl lg:text-[3.6rem]">
        Histórias que mantêm o campo vivo
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
        Nosso catálogo de episódios está sendo preparado ou o feed está temporariamente indisponível. Enquanto isso, a Rádio Rodeo Country segue ao vivo.
      </p>
      <p role="status" className="mt-6 inline-block rounded border border-border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-champagne">Feed indisponível no momento</p>
    </div>
  );
}

function CoverObject({ ep }: { ep: Episode | undefined }) {
  return (
    <figure className="relative">
      <div aria-hidden className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgb(232_188_101/0.25),transparent_70%)] blur-2xl" />
      <div className="relative rounded-md p-[3px] shadow-[var(--shadow-deep)]" style={{ background: "var(--gold-edge)" }}>
        <div className="relative overflow-hidden rounded-[5px] bg-charcoal">
          {ep?.image ? (
            <img src={ep.image} width={600} height={600} alt={`Capa do episódio ${ep.title}`} fetchPriority="high" className="aspect-square w-full object-cover" />
          ) : (
            <img src={media.cover.src} srcSet={media.cover.srcSet} sizes="(min-width:1024px) 340px, 80vw" width={600} height={600} alt="Capa oficial Rodeo Country Podcasts" className="aspect-square w-full object-cover" />
          )}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgb(255_240_210/0.18),transparent_35%,transparent_70%,rgb(255_220_160/0.08))]" />
        </div>
      </div>
      <div aria-hidden className="mx-auto mt-3 h-6 w-4/5 rounded-[50%] bg-black/60 blur-xl" />
    </figure>
  );
}
