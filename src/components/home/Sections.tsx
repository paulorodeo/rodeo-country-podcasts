import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Copy, Rss, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { PodcastFeed } from "@/lib/feed.types";
import { CATEGORY_LABELS, DEMO_EPISODES, DISTRIBUTION, PROGRAMS, PUBLIC_RSS_URL, media } from "@/lib/media";
import { DemoCard, EpisodeCard } from "@/components/episodes/EpisodeCard";
import { LonghornMark } from "@/components/site/Brand";

export function SectionHead({ kicker, title, desc, link }: { kicker: string; title: string; desc?: string; link?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-gold">{kicker}</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ivory sm:text-[2.6rem] sm:leading-tight">{title}</h2>
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
    <section aria-labelledby="programas" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead kicker="Nossos programas" title="Programas que contam grandes histórias"
          desc="Quatro linhas editoriais em desenvolvimento. São categorias conceituais até a publicação do catálogo oficial."
          link={<Link to="/programas" className={linkCls}>Conheça os programas <ArrowRight className="h-4 w-4" /></Link>} />
        <span id="programas" className="sr-only">Programas</span>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <li key={p.name}>
              <Link to="/programas" className="group block overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-deep)] transition-colors hover:border-gold/70">
                <span className="block aspect-[520/330] overflow-hidden">
                  <img src={p.img} alt="" width={520} height={330} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </span>
                <span className="block border-t border-border p-5">
                  <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">{p.n} / Conceito · em breve</span>
                  <span className="font-condensed text-gold-metal mt-1 block text-2xl font-bold uppercase leading-none tracking-[0.05em]">{p.name}</span>
                  <span className="mt-2 block text-xs text-body">{p.tagline}</span>
                </span>
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
    <section aria-label="Rodeo Country Media" className="relative isolate overflow-hidden border-y border-border bg-[radial-gradient(70%_90%_at_50%_45%,#2a1a0f_0%,#0e0b09_70%)] py-20 sm:py-28">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[420px] w-[820px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(232_188_101/0.22),transparent_65%)] blur-2xl" />
      <div aria-hidden className="absolute inset-x-0 top-1/2 -z-10 hairline-gold opacity-25" />
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 text-center">
        <LonghornMark className="h-auto w-[min(78vw,560px)] drop-shadow-[0_20px_40px_rgb(0_0_0/0.8)]" sizes="(min-width:640px) 560px, 78vw" />
        <p className="mt-6 font-condensed text-gold-metal text-3xl font-bold uppercase tracking-[0.095em] sm:text-4xl">Rodeo Country</p>
        <p className="mt-1 text-[0.66rem] font-extrabold uppercase tracking-[0.27em] text-champagne/80">Media · Podcasts</p>
        <blockquote className="mt-10 max-w-2xl font-display text-2xl font-semibold leading-snug text-ivory sm:text-4xl">
          “O country não é apenas música. <span className="text-bright-gold">É um jeito de viver.</span>”
        </blockquote>
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
    <section aria-labelledby="rss-title" className="relative isolate overflow-hidden">
      <img src={media.sunset.src} srcSet={media.sunset.srcSet} sizes="100vw" width={1400} height={542} alt="Cowboy de costas observando o pôr do sol sobre a fazenda" loading="lazy" decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[30%_center]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/60 to-background md:bg-gradient-to-r md:from-transparent md:via-background/50 md:to-background" />
      <div className="mx-auto grid max-w-7xl px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <div className="md:col-start-2">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-gold">Não perca nenhum episódio</p>
          <h2 id="rss-title" className="mt-3 font-display text-3xl font-bold text-ivory sm:text-[2.6rem] sm:leading-tight">Assine o RSS do nosso podcast</h2>
          <p className="mt-4 max-w-lg text-body">Receba nossos episódios no seu aplicativo de podcast favorito e leve a Rodeo Country com você.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={PUBLIC_RSS_URL} className="btn-gold"><Rss className="h-4 w-4" aria-hidden /> Assine o RSS</a>
            <button type="button" onClick={copy} className="btn-leather">
              {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Endereço copiado" : "Copiar endereço"}
            </button>
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
