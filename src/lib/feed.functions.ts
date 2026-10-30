import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import type { PodcastFeed } from "./feed.types";

export const getPodcastFeed = createServerFn({ method: "GET" }).handler(async (): Promise<PodcastFeed> => {
  const { loadFeed } = await import("./feed.server");
  const { feed } = await loadFeed();
  return feed;
});

export const feedQuery = queryOptions({
  queryKey: ["podcast-feed"],
  queryFn: () => getPodcastFeed(),
  staleTime: 5 * 60 * 1000,
});
