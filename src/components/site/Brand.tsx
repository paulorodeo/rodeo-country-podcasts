import { media } from "@/lib/media";

export function LonghornMark({ className, sizes = "96px", eager = false }: { className?: string; sizes?: string; eager?: boolean }) {
  return (
    <picture>
      <source type="image/avif" srcSet={media.longhorn.avif} sizes={sizes} />
      <img src={media.longhorn.webp} width={1600} height={800} alt="" sizes={sizes} className={className} loading={eager ? "eager" : "lazy"} decoding="async" />
    </picture>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-condensed text-gold-metal text-[1.35rem] font-bold uppercase tracking-[0.095em]">Rodeo Country</span>
      <span className="mt-1 text-[0.56rem] font-extrabold uppercase tracking-[0.27em] text-champagne/80">
        Media <span className="text-gold">·</span> Podcasts
      </span>
    </span>
  );
}

export function FazendaLogo({ className = "" }: { className?: string }) {
  return <img src={media.logo} width={180} height={56} alt="Fazenda Rodeo" className={`h-auto ${className}`} />;
}
