import { Link } from "@tanstack/react-router";
import { Menu, Radio, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { RADIO_URL } from "@/lib/media";
import { LonghornMark, Wordmark } from "./Brand";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/episodios", label: "Episódios" },
  { to: "/programas", label: "Programas" },
  { to: "/sobre", label: "Sobre" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const solid = scrolled || open;
  return (
    <header className={`sticky top-0 z-50 transition-colors duration-500 ${solid ? "surface-wood shadow-[0_10px_30px_-15px_rgb(0_0_0/0.9)]" : "bg-gradient-to-b from-background/90 to-background/0"}`}>
      <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:h-[84px] lg:grid-cols-[auto_1fr_auto]">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Rodeo Country Podcasts — página inicial">
          <LonghornMark className="h-auto w-14 shrink-0 sm:w-20" sizes="(min-width:640px) 80px, 56px" eager />
          <Wordmark className="shrink-0" />
        </Link>

        <nav aria-label="Navegação principal" className="hidden justify-center gap-8 lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="relative py-2 text-sm font-medium text-body transition-colors hover:text-champagne data-[status=active]:text-bright-gold data-[status=active]:after:absolute data-[status=active]:after:inset-x-0 data-[status=active]:after:-bottom-0.5 data-[status=active]:after:h-px data-[status=active]:after:bg-gold">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link to="/episodios" aria-label="Buscar episódios" className="grid h-10 w-10 place-items-center rounded-full text-champagne transition-colors hover:bg-accent">
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <a href={RADIO_URL} target="_blank" rel="noopener noreferrer" aria-label="Rádio ao vivo (abre em nova aba)" title="Ouvir Rádio Rodeo Country" className="relative grid h-10 w-10 place-items-center rounded-full border border-border text-champagne transition-colors hover:border-gold hover:text-bright-gold">
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive motion-safe:animate-pulse" aria-hidden />
            <Radio className="h-4 w-4" />
          </a>
          <Button variant="outline" size="icon" type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="h-10 w-10 text-champagne lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      <div className="hairline-gold opacity-70" />

      {open && (
        <nav id="mobile-menu" aria-label="Menu móvel" className="surface-wood border-b border-border px-4 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
                  className="block border-b border-border/50 py-4 font-display text-xl text-ivory data-[status=active]:text-bright-gold">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
