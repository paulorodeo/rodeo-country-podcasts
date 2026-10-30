import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, Rss, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PodcastFeed } from "@/lib/feed.types";
import { CATEGORY_LABELS, DEMO_EPISODES, DISTRIBUTION, PROGRAMS, PUBLIC_RSS_URL, media } from "@/lib/media";
import { DemoCard, EpisodeCard } from "@/components/episodes/EpisodeCard";
import { LonghornMark } from "@/components/site/Brand";
import { Button } from "@/components/ui/button";

/** Non-hero home content is isolated from the initial route entry chunk. */
export default function HomeSections({ feed }: { feed: PodcastFeed }) {
  return (
    <>
      <DiscoverAndRecent feed={feed} />
      <Programs />
      <LonghornStage />
      <RssSection />
    </>
  );
}

export function SectionHead({ kicker, title, desc, link, titleClassName }: { kicker: string; title: string; desc?: string; link?: React.ReactNode; titleClassName?: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-gold">{kicker}</p>
        <h2 className={titleClassName ?? "mt-3 font-display text-3xl font-bold text-ivory sm:text-[2.6rem] sm:leading-tight"}>{title}</h2>
        {desc && <p className="mt-2 max-w-2xl text-body">{desc}</p>}
      </div>
      {link}
    </div>
  );
}

const linkCls = "inline-flex shrink-0 items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-gold underline decoration-gold/40 underline-offset-[6px] hover:text-bright-gold";

/** Search band + recent episodes share filter state so search really filters. */
export function DiscoverAndRecent({ feed }: { feed: PodcastFeed }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const nq = norm(q.trim());

  const real = useMemo(
    () => feed.episodes.filter((e) => (!cat || feed.categories.includes(cat)) && (!nq || norm(`${e.title} ${e.description}`).includes(nq))),
    [feed, cat, nq],
  );
  // Demo previews fill the grid only while the real catalog is small, and never match real categories.
  const demos = useMemo(
    () => (cat ? [] : DEMO_EPISODES.filter((d) => !nq || norm(`${d.title} ${d.summary} ${d.program} ${d.theme}`).includes(nq))).slice(0, Math.max(0, 4 - real.length)),
    [cat, nq, real.length],
  );

  return (
    <>
      <section id="busca" aria-label="Buscar episódios" className="surface-leather border-y border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">Busque episódios, programas ou temas</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" aria-hidden />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busque episódios, programas ou temas…"
              className="h-12 w-full rounded-full border border-input bg-background/60 pl-11 pr-5 text-sm text-ivory placeholder:text-muted-foreground focus:border-gold focus:outline-none" />
          </label>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden shrink-0 text-[0.64rem] font-extrabold uppercase tracking-[0.2em] text-muted-foreground sm:block">Temas do feed:</span>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filtrar por tema">
              <Chip active={!cat} onClick={() => setCat(null)}>Todos</Chip>
              {feed.categories.map((c) => (
                <Chip key={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)}>{CATEGORY_LABELS[c] ?? c}</Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="recentes" className="surface-wood py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead kicker="Episódios recentes" title="Novos episódios, grandes histórias"
            desc="Conversas autênticas, grandes histórias e tudo que move o universo country."
            link={<Link to="/episodios" className={linkCls}>Ver todos os episódios <ArrowRight className="h-4 w-4" /></Link>} />
          <span id="recentes" className="sr-only">Episódios recentes</span>
          <p className="sr-only" aria-live="polite">{real.length} episódio(s) publicado(s) encontrados</p>
          {real.length + demos.length === 0 ? (
            <p className="mt-10 rounded-lg border border-border p-8 text-center text-body">Nenhum episódio encontrado para essa busca.</p>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {real.slice(0, 4).map((e) => <EpisodeCard key={e.guid} ep={e} />)}
              {demos.map((d) => <DemoCard key={d.id} d={d} />)}
            </div>
          )}
          {demos.length > 0 && (
            <p className="mt-6 text-xs text-muted-foreground">
              Cards marcados como <strong className="text-champagne">Prévia · Demonstração</strong> são peças conceituais de layout — não são episódios publicados.
            </p>
          )}
        </div>
      </section>
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${active ? "border-[#6f451f] text-primary-foreground" : "border-antique/60 bg-background/40 text-champagne hover:border-bright-gold"}`}
      style={active ? { background: "var(--gold-metal)" } : undefined}>
      {children}
    </button>
  );
}

export function Programs() {
  return (
    <section aria-labelledby="programas" className="below-fold-section bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead kicker="Universos editoriais" title="Histórias que merecem ser contadas" titleClassName="editorial-title mt-3"
          desc="Quatro linhas editoriais em desenvolvimento. São categorias conceituais até a publicação do catálogo oficial."
          link={<Link to="/programas" className={linkCls}>Conheça os programas <ArrowRight className="h-4 w-4" /></Link>} />
        <span id="programas" className="sr-only">Programas</span>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <li key={p.name}>
              <Link to="/programas" className="program-card group block">
                <img src={p.img} alt="" width={520} height={330} loading="lazy" decoding="async" className="program-image" />
                <span aria-hidden className="program-shade" />
                <span className="program-kicker absolute left-5 top-5">{p.n} / Conceito · em breve</span>
                <span className="absolute inset-x-5 bottom-5 block pr-4">
                  <span className="program-name block">{p.name}</span>
                  <span className="program-caption mt-3 block">{p.tagline}</span>
                </span>
                <ArrowRight aria-hidden className="absolute bottom-5 right-4 h-4 w-4 text-champagne" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LonghornStage() {
  return (
    <section aria-labelledby="spirit-title" className="below-fold-section longhorn-stage relative isolate flex items-center justify-center overflow-hidden py-16 sm:py-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center">
        <p className="stage-kicker mb-8">The Spirit of the West — O espírito do campo</p>
        <LonghornMark className="h-auto w-[min(78vw,560px)] drop-shadow-[0_20px_40px_rgb(0_0_0/0.8)]" sizes="(min-width:640px) 560px, 78vw" />
        <h2 id="spirit-title" className="stage-title mt-8 max-w-4xl">O country não é apenas música. É um jeito de viver.</h2>
      </div>
    </section>
  );
}

export function RssSection() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_RSS_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copie o endereço do feed:", PUBLIC_RSS_URL);
    }
  };
  return (
    <section aria-labelledby="rss-title" className="below-fold-section subscribe-section relative isolate overflow-hidden">
      <img src={media.sunset.src} srcSet={media.sunset.srcSet} sizes="100vw" width={1400} height={542} alt="Cowboy de costas observando o pôr do sol sobre a fazenda" loading="lazy" decoding="async"
        className="subscribe-image" />
      <div aria-hidden className="subscribe-shade absolute inset-0 -z-10" />
      <div className="mx-auto grid max-w-7xl px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <div className="md:col-start-2">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-gold">Não perca nenhum episódio</p>
           <h2 id="rss-title" className="editorial-title mt-3">O melhor do country. Direto no seu ouvido.</h2>
          <p className="mt-4 max-w-lg text-body">Receba nossos episódios no seu aplicativo de podcast favorito e leve a Rodeo Country com você.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
             <Button asChild className="btn-gold h-auto"><a href={PUBLIC_RSS_URL}><Rss className="h-4 w-4" aria-hidden /> Assine o RSS</a></Button>
             <Button variant="outline" type="button" onClick={copy} className="btn-leather h-auto">
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Endereço copiado" : "Copiar endereço"}
             </Button>
            <span className="sr-only" aria-live="polite">{copied ? "Endereço do feed copiado" : ""}</span>
          </div>
          <p className="mt-4 break-all font-mono text-xs text-muted-foreground">{PUBLIC_RSS_URL}</p>
          {DISTRIBUTION.length > 0 && (
            <ul className="mt-6 flex gap-4">
              {DISTRIBUTION.map((d) => <li key={d.name}><a href={d.href} target="_blank" rel="noopener noreferrer" className="text-sm text-champagne hover:text-bright-gold">{d.name}</a></li>)}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
