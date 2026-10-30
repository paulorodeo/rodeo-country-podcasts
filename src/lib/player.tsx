import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Episode } from "./feed.types";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

type PlayerCtx = {
  current: Episode | null;
  status: Status;
  error: string | null;
  time: number;
  duration: number;
  volume: number;
  rate: number;
  toggle: (ep: Episode) => void;
  seek: (t: number) => void;
  skip: (d: number) => void;
  setVolume: (v: number) => void;
  setRate: (r: number) => void;
  close: () => void;
  isCurrent: (ep: Episode) => boolean;
};

const Ctx = createContext<PlayerCtx | null>(null);

/** Owns the app's ONLY <audio> element; lives in the root so it survives SPA navigation. */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<Episode | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVol] = useState(0.9);
  const [rate, setRt] = useState(1);

  const toggle = useCallback(
    (ep: Episode) => {
      const a = audio.current;
      if (!a || !ep.audioUrl) return;
      if (current?.guid === ep.guid && a.src) {
        if (a.paused) {
          setStatus("loading");
          a.play().catch(() => {});
        } else a.pause();
        return;
      }
      a.pause();
      setCurrent(ep);
      setError(null);
      setTime(0);
      setDuration(ep.durationSec ?? 0);
      setStatus("loading");
      a.src = ep.audioUrl;
      a.playbackRate = rate;
      // Called synchronously inside the user's click handler — no autoplay.
      a.play().catch((e: unknown) => {
        if ((e as Error)?.name === "AbortError") return;
        setStatus("error");
        setError("Não foi possível iniciar o áudio. Verifique sua conexão e tente novamente.");
      });
    },
    [current, rate],
  );

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const on = (ev: string, fn: () => void) => (a.addEventListener(ev, fn), () => a.removeEventListener(ev, fn));
    const offs = [
      on("playing", () => setStatus("playing")),
      on("pause", () => setStatus((s) => (s === "error" ? s : "paused"))),
      on("waiting", () => setStatus("loading")),
      on("timeupdate", () => setTime(a.currentTime)),
      on("loadedmetadata", () => Number.isFinite(a.duration) && setDuration(a.duration)),
      on("ended", () => setStatus("paused")),
      on("error", () => {
        if (!a.src) return;
        setStatus("error");
        setError(a.error?.code === 4 ? "Mídia indisponível no servidor de áudio." : "Falha de rede ao carregar o áudio.");
      }),
    ];
    return () => offs.forEach((f) => f());
  }, []);

  const value = useMemo<PlayerCtx>(
    () => ({
      current, status, error, time, duration, volume, rate, toggle,
      seek: (t) => { if (audio.current) audio.current.currentTime = t; },
      skip: (d) => { const a = audio.current; if (a) a.currentTime = Math.max(0, Math.min((a.duration || duration), a.currentTime + d)); },
      setVolume: (v) => { setVol(v); if (audio.current) audio.current.volume = v; },
      setRate: (r) => { setRt(r); if (audio.current) audio.current.playbackRate = r; },
      close: () => { const a = audio.current; if (a) { a.pause(); a.removeAttribute("src"); a.load(); } setCurrent(null); setStatus("idle"); },
      isCurrent: (ep) => current?.guid === ep.guid,
    }),
    [current, status, error, time, duration, volume, rate, toggle],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <audio ref={audio} preload="none" className="hidden" />
    </Ctx.Provider>
  );
}

export function usePlayer() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayer outside PlayerProvider");
  return c;
}
