import { createFileRoute } from "@tanstack/react-router";
import { LonghornStage } from "@/components/home/Sections";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Rodeo Country Podcasts" },
      { name: "description", content: "Rodeo Country Media é a casa de mídia e entretenimento da Fazenda Rodeo." },
      { property: "og:title", content: "Sobre — Rodeo Country Podcasts" },
      { property: "og:description", content: "Conheça a Rodeo Country Media, da Fazenda Rodeo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://podcast.fazenda.rodeo/sobre" },
    ],
    links: [{ rel: "canonical", href: "https://podcast.fazenda.rodeo/sobre" }],
  }),
  component: () => (
    <>
      <section className="surface-wood py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.28em] text-gold">Sobre</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ivory sm:text-5xl">Rodeo Country Media</h1>
          <p className="mt-6 text-lg leading-relaxed text-body">
            A Rodeo Country Media é a identidade de mídia e entretenimento da Fazenda Rodeo: rádio, podcasts e histórias sobre música country, rodeio e a vida no campo.
          </p>
        </div>
      </section>
      <LonghornStage />
    </>
  ),
});
