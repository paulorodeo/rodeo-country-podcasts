import { createFileRoute } from "@tanstack/react-router";
import { Programs } from "@/components/home/Sections";
import { media } from "@/lib/media";

export const Route = createFileRoute("/programas")({
  head: () => ({
    meta: [
      { title: "Programas — Rodeo Country Podcasts" },
      { name: "description", content: "As linhas editoriais em desenvolvimento da Rodeo Country Media." },
      { property: "og:title", content: "Programas — Rodeo Country Podcasts" },
      { property: "og:description", content: "Linhas editoriais conceituais da Rodeo Country Media." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://podcast.fazenda.rodeo/programas" },
      { property: "og:image", content: `https://podcast.fazenda.rodeo${media.cover.src}` },
      { property: "og:image:alt", content: "Programas e universos editoriais da Rodeo Country Media" },
      { name: "twitter:image", content: `https://podcast.fazenda.rodeo${media.cover.src}` },
    ],
    links: [{ rel: "canonical", href: "https://podcast.fazenda.rodeo/programas" }],
  }),
  component: () => (
    <>
      <Programs />
      <p className="mx-auto max-w-7xl px-4 pb-16 text-sm text-muted-foreground sm:px-6">
        Ainda não há episódios associados a estes programas. Cada página de programa será publicada junto com o catálogo oficial.
      </p>
    </>
  ),
});
