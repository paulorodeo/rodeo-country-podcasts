import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { feedQuery } from "@/lib/feed.functions";
import { Hero } from "@/components/home/Hero";
import { DiscoverAndRecent, LonghornStage, Programs, RssSection } from "@/components/home/Sections";
import { media } from "@/lib/media";
import heroFontUrl from "@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2?url";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(feedQuery),
  head: () => ({
    meta: [
      { title: "Rodeo Country Podcasts — Fazenda Rodeo" },
      { name: "description", content: "Podcasts da Rodeo Country Media: música country, rodeio, vida no campo e as pessoas que mantêm a cultura viva." },
      { property: "og:title", content: "Rodeo Country Podcasts — Fazenda Rodeo" },
      { property: "og:description", content: "Música country, rodeio e vida no campo em episódios da Rodeo Country Media." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: media.studio.src },
      { name: "twitter:image", content: media.studio.src },
      { property: "og:url", content: "https://podcast.fazenda.rodeo/" },
    ],
    links: [
      { rel: "canonical", href: "https://podcast.fazenda.rodeo/" },
      // Preload the exact responsive LCP image before the browser discovers the hero markup.
      { rel: "preload", as: "image", href: media.studio.src, imageSrcSet: media.studio.srcSet, imageSizes: "(min-width:1024px) 58vw, 100vw", fetchPriority: "high" },
      { rel: "preload", href: heroFontUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: feed } = useSuspenseQuery(feedQuery);
  return (
    <>
      <Hero feed={feed} />
      <DiscoverAndRecent feed={feed} />
      <Programs />
      <LonghornStage />
      <RssSection />
    </>
  );
}
