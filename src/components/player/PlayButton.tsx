import { Loader2, Pause, Play } from "lucide-react";
import type { Episode } from "@/lib/feed.types";
import { usePlayer } from "@/lib/player";

export function PlayButton({ ep, size = "lg" }: { ep: Episode; size?: "lg" | "md" | "sm" }) {
  const p = usePlayer();
  const mine = p.isCurrent(ep);
  const playing = mine && p.status === "playing";
  const loading = mine && p.status === "loading";
  const dim = size === "lg" ? "h-16 w-16" : size === "md" ? "h-12 w-12" : "h-10 w-10";
  const icon = size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const disabled = !ep.audioUrl;
  return (
    <button type="button" disabled={disabled} onClick={() => p.toggle(ep)}
      aria-label={disabled ? "Áudio indisponível" : playing ? `Pausar ${ep.title}` : `Ouvir ${ep.title}`}
      aria-pressed={playing}
      className={`${dim} grid shrink-0 place-items-center rounded-full text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50`}
      style={{ background: "var(--gold-metal)", boxShadow: "inset 0 1px 0 rgb(255 245 215 / .65), 0 0 0 1px #6f451f, 0 0 0 4px rgb(220 178 117 / .12), var(--shadow-amber)" }}>
      {loading ? <Loader2 className={`${icon} motion-safe:animate-spin`} /> : playing ? <Pause className={icon} fill="currentColor" /> : <Play className={`${icon} translate-x-[1px]`} fill="currentColor" />}
    </button>
  );
}
