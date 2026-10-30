import type { Episode } from "@/lib/feed.types";

type ArtworkEpisode = Pick<Episode, "title" | "episode" | "season" | "image">;

const SPOTISAVER = [
  { number: 1, title: "live lonely", artist: "mason ramsey", file: "live-lonely" },
  { number: 2, title: "autopilot", artist: "chase matthew", file: "autopilot" },
  { number: 3, title: "memo", artist: "dasha", file: "memo" },
  { number: 4, title: "imagine that", artist: "riley green", file: "imagine-that" },
] as const;

function normalized(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/&amp;/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Editorial cover lookup for the four published SPOTISAVER Season 1 episodes.
 * Does not alter RSS GUIDs, enclosure audio, origin artwork, or feed re-packaging.
 * Other episodes retain their original AzuraCast artwork.
 */
export function getEpisodeArtwork(ep: ArtworkEpisode) {
  const text = normalized(ep.title);
  const matched = SPOTISAVER.find(({ number, title, artist }) =>
    text.includes(title) && text.includes(artist) &&
    (ep.episode == null || ep.episode === number) &&
    (ep.season == null || ep.season === 1));
  if (!matched) return null;
  return {
    avif: `/media/episodes/${matched.file}-662.avif`,
    webp: `/media/episodes/${matched.file}-662.webp`,
  };
}

type Props = {
  ep: ArtworkEpisode;
  className: string;
  width: number;
  height: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "auto" | "low";
  decoding?: "async" | "sync" | "auto";
  wrapperClassName?: string;
  sizes?: string;
};

export function EpisodeCoverImage({
  ep, className, width, height, loading = "lazy",
  fetchPriority, decoding = "async", wrapperClassName = "block h-full w-full", sizes,
}: Props) {
  const artwork = getEpisodeArtwork(ep);
  const alt = `Capa do episódio ${ep.title}`;
  if (!artwork) {
    return <img src={ep.image || "/media/cover-600.webp"} alt={alt} width={width} height={height}
      loading={loading} fetchPriority={fetchPriority} decoding={decoding}
      sizes={sizes} className={className} />;
  }
  return (
    <picture className={wrapperClassName}>
      <source type="image/avif" srcSet={artwork.avif} />
      <img src={artwork.webp} alt={alt} width={width} height={height}
        loading={loading} fetchPriority={fetchPriority} decoding={decoding}
        sizes={sizes} className={className} />
    </picture>
  );
}
