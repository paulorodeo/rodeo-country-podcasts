import { Link } from "@tanstack/react-router";
import { RotateCcw, RotateCw, Volume2, X } from "lucide-react";
import { fmtTime } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { media } from "@/lib/media";
import { PlayButton } from "./PlayButton";

const RATES = [1, 1.25, 1.5, 2, 0.75];

export function MiniPlayer() {
  const p = usePlayer();
  if (!p.current) return null;
  const ep = p.current;
  return (
    <>
      <div aria-hidden className="h-28 sm:h-24" />
      <section aria-label="Player de áudio" className="fixed inset-x-0 bottom-0 z-40 surface-leather border-t border-border pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_40px_-12px_rgb(0_0_0/0.9)]">
        <div className="hairline-gold absolute inset-x-0 top-0" />
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:gap-5 sm:px-6">
          <img src={ep.image ?? media.cover.src} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded border border-border object-cover" />
          <div className="min-w-0 flex-1">
            <Link to="/episodios/$slug" params={{ slug: ep.slug }} className="block truncate text-sm font-bold text-ivory hover:text-bright-gold">{ep.title}</Link>
            <p className="truncate text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold" aria-live="polite">
              {p.status === "error" ? <span className="text-destructive normal-case tracking-normal">{p.error}</span> : p.status === "loading" ? "Carregando…" : "Rodeo Country Media"}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[0.68rem] tabular-nums text-muted-foreground">
              <span>{fmtTime(p.time)}</span>
              <input type="range" min={0} max={p.duration || 0} step={1} value={Math.min(p.time, p.duration || 0)} onChange={(e) => p.seek(Number(e.target.value))} aria-label="Posição do episódio" className="h-1 min-w-0 flex-1" />
              <span>{fmtTime(p.duration)}</span>
            </div>
          </div>
          <button type="button" onClick={() => p.skip(-15)} aria-label="Voltar 15 segundos" className="hidden h-9 w-9 place-items-center rounded-full text-champagne hover:bg-accent sm:grid"><RotateCcw className="h-4 w-4" /></button>
          <PlayButton ep={ep} size="md" />
          <button type="button" onClick={() => p.skip(30)} aria-label="Avançar 30 segundos" className="hidden h-9 w-9 place-items-center rounded-full text-champagne hover:bg-accent sm:grid"><RotateCw className="h-4 w-4" /></button>
          <button type="button" onClick={() => p.setRate(RATES[(RATES.indexOf(p.rate) + 1) % RATES.length])} aria-label={`Velocidade ${p.rate}x`} className="hidden w-12 rounded border border-border py-1 text-xs font-bold text-champagne hover:border-gold md:block">{p.rate}x</button>
          <label className="hidden items-center gap-2 lg:flex">
            <Volume2 className="h-4 w-4 text-champagne" aria-hidden />
            <span className="sr-only">Volume</span>
            <input type="range" min={0} max={1} step={0.05} value={p.volume} onChange={(e) => p.setVolume(Number(e.target.value))} className="w-24" />
          </label>
          <button type="button" onClick={p.close} aria-label="Fechar player" className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-ivory"><X className="h-4 w-4" /></button>
        </div>
      </section>
    </>
  );
}
