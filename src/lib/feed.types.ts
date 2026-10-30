export type Episode = {
  guid: string;
  slug: string;
  title: string;
  description: string;
  link: string | null;
  pubDate: string | null;
  audioUrl: string | null;
  audioType: string;
  bytes: number | null;
  durationSec: number | null;
  image: string | null;
  season: number | null;
  episode: number | null;
};

export type PodcastFeed = {
  status: "ok" | "unavailable";
  title: string;
  description: string;
  image: string | null;
  author: string | null;
  language: "pt-BR";
  categories: string[];
  episodes: Episode[];
  fetchedAt: string;
};
