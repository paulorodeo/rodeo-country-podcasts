import { describe, expect, it } from "vitest";
import { getEpisodeArtwork } from "@/components/episodes/EpisodeCoverImage";

const episodes = [
  { title: "Live Lonely - Mason Ramsey & Harper Grace", episode: 1, season: 1, file: "live-lonely" },
  { title: "Autopilot - Chase Matthew", episode: 2, season: 1, file: "autopilot" },
  { title: "Memo - Dasha", episode: 3, season: 1, file: "memo" },
  { title: "Imagine That - Riley Green", episode: 4, season: 1, file: "imagine-that" },
];

describe("SPOTISAVER podcast episode artwork", () => {
  it.each(episodes)("maps official AzuraCast episode $episode to its cover", ({ title, episode, season, file }) => {
    const result = getEpisodeArtwork({ title, episode, season, image: "https://live.fazenda.rodeo/original.jpg" });
    expect(result).toEqual({
      avif: `/media/episodes/${file}-662.avif`,
      webp: `/media/episodes/${file}-662.webp`,
    });
  });
  it("does not mistake a different show or a later season for SPOTISAVER", () => {
    expect(getEpisodeArtwork({ title: "Memo - Dasha", episode: 8, season: 1, image: null })).toBeNull();
    expect(getEpisodeArtwork({ title: "Memo - Dasha", episode: 3, season: 2, image: null })).toBeNull();
    expect(getEpisodeArtwork({ title: "Resumo da cultura country", episode: 4, season: 1, image: null })).toBeNull();
  });
});
