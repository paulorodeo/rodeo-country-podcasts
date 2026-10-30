import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { feedQuery } from "@/lib/feed.functions";
import { Hero } from "@/components/home/Hero";
import { DiscoverAndRecent, LonghornStage, Programs, RssSection } from "@/components/home/Sections";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(feedQuery),
  head: () => ({
    meta: [
      { title: "Rodeo Country Podcasts — Fazenda Rodeo" },
      { name: "description", content: "Podcasts da Rodeo Country Media: música country, rodeio, vida no campo e as pessoas que mantêm a cultura viva." },
      { property: "og:title", content: "Rodeo Country Podcasts — Fazenda Rodeo" },
      { property: "og:description", content: "Música country, rodeio e vida no campo em episódios da Rodeo Country Media." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
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
