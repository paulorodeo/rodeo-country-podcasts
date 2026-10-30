export function fmtTime(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return "--:--";
  const t = Math.max(0, Math.floor(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function fmtDuration(sec: number | null): string | null {
  if (!sec) return null;
  const m = Math.round(sec / 60);
  return m < 1 ? `${sec} s` : `${m} min`;
}

export function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" })
    .format(new Date(iso))
    .replace(/\./g, "")
    .toUpperCase();
}
