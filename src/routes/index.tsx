import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { feedQuery } from "@/lib/feed.functions";
import { Hero } from "@/components/home/Hero";
import { media } from "@/lib/media";
import heroFontUrl from "@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2?url";

// SSR keeps the complete page HTML. In the browser, the non-hero chunk is fetched
// when its SSR-rendered region approaches the viewport, rather than during startup.
const HomeSections = lazy(() => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return import("@/components/home/Sections");
  }

  return new Promise<typeof import("@/components/home/Sections")>((resolve, reject) => {
    const sentinel = document.getElementById("home-sections-sentinel");
    if (!sentinel) {
      import("@/components/home/Sections").then(resolve, reject);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          import("@/components/home/Sections").then(resolve, reject);
        }
      },
      { rootMargin: "0px" },
    );
    observer.observe(sentinel);
  });
});

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
      { property: "og:image", content: `https://podcast.fazenda.rodeo${media.studio.src}` },
      { property: "og:image:alt", content: "Estúdio da Rodeo Country Media" },
      { name: "twitter:image", content: `https://podcast.fazenda.rodeo${media.studio.src}` },
      { name: "twitter:image:alt", content: "Estúdio da Rodeo Country Media" },
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
      <div id="home-sections-sentinel">
        <Suspense fallback={null}>
          <HomeSections feed={feed} />
        </Suspense>
      </div>
    </>
  );
}
