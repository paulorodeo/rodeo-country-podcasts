import { Link } from "@tanstack/react-router";
import { CREDIT_LOGO_URL, PROGRAMS, PUBLIC_RSS_URL, RADIO_URL, SOCIAL } from "@/lib/media";
import { FazendaLogo, LonghornMark } from "./Brand";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="surface-wood relative overflow-hidden">
      <div className="hairline-gold" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1fr]">
        <div>
          <FazendaLogo className="w-[160px]" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Música. Rodeio. Cultura. Pessoas reais. Rodeo Country Media é a casa de mídia e entretenimento da Fazenda Rodeo.
          </p>
          {SOCIAL.length > 0 && (
            <ul className="mt-5 flex gap-4">
              {SOCIAL.map((s) => (
                <li key={s.name}><a href={s.href} target="_blank" rel="noopener noreferrer" className="text-sm text-champagne hover:text-bright-gold">{s.name}</a></li>
              ))}
            </ul>
          )}
        </div>
        <FooterCol title="Navegação">
          <FLink to="/">Início</FLink>
          <FLink to="/episodios">Episódios</FLink>
          <FLink to="/programas">Programas</FLink>
          <FLink to="/sobre">Sobre</FLink>
          <li><a href={RADIO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-bright-gold">Ouça a Rádio</a></li>
        </FooterCol>
        <FooterCol title="Programas (conceito)">
          {PROGRAMS.map((p) => <FLink key={p.name} to="/programas">{p.name}</FLink>)}
        </FooterCol>
        <FooterCol title="Assine">
          <li><a href={PUBLIC_RSS_URL} className="hover:text-bright-gold">Feed RSS</a></li>
          <li className="pt-4" aria-hidden>
            <LonghornMark className="h-auto w-40 opacity-25" sizes="160px" />
          </li>
        </FooterCol>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:px-6 md:flex-row">
          <p>© {year} Fazenda Rodeo / Rodeo Country Media.</p>
          <p className="font-display text-sm text-ivory">podcast.<span className="text-gold">fazenda</span>.rodeo</p>
          <p className="flex items-center gap-2">
            Tecnologia e experiência digital por <span className="font-semibold text-champagne">TopLeo Workers</span>
            {CREDIT_LOGO_URL && <img src={CREDIT_LOGO_URL} alt="" className="h-4 w-auto" />}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-gold">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm text-body">{children}</ul>
    </div>
  );
}
function FLink({ to, children }: { to: "/" | "/episodios" | "/programas" | "/sobre"; children: React.ReactNode }) {
  return <li><Link to={to} className="hover:text-bright-gold">{children}</Link></li>;
}
