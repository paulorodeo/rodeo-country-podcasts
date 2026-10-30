import studio480 from "@/assets/studio-480.webp.asset.json";
import studio780 from "@/assets/studio-780.webp.asset.json";
import sunset800 from "@/assets/sunset-800.webp.asset.json";
import sunset1400 from "@/assets/sunset-1400.webp.asset.json";
import cover300 from "@/assets/cover-300.webp.asset.json";
import cover600 from "@/assets/cover-600.webp.asset.json";
import longhorn480 from "@/assets/longhorn-480.avif.asset.json";
import longhorn1600 from "@/assets/longhorn-1600.avif.asset.json";
import longhorn960 from "@/assets/longhorn-960.webp.asset.json";
import logo from "@/assets/logo-fazenda-rodeo.png.asset.json";
import ep1 from "@/assets/ep-07_9c556b.webp.asset.json";
import ep1s from "@/assets/ep-07_9c556b-300.webp.asset.json";
import ep2 from "@/assets/ep-11_9d38a5.webp.asset.json";
import ep2s from "@/assets/ep-11_9d38a5-300.webp.asset.json";
import ep3 from "@/assets/ep-12_db1ec3.webp.asset.json";
import ep3s from "@/assets/ep-12_db1ec3-300.webp.asset.json";
import ep4 from "@/assets/ep-13_ee35cd.webp.asset.json";
import ep4s from "@/assets/ep-13_ee35cd-300.webp.asset.json";
import p1 from "@/assets/prog-14_71b1a7.webp.asset.json";
import p2 from "@/assets/prog-15_e82c28.webp.asset.json";
import p3 from "@/assets/prog-16_380e17.webp.asset.json";
import p4 from "@/assets/prog-17_68d0a7.webp.asset.json";

const set = (pairs: [{ url: string }, number][]) => pairs.map(([a, w]) => `${a.url} ${w}w`).join(", ");

export const media = {
  studio: { src: studio780.url, srcSet: set([[studio480, 480], [studio780, 780]]) },
  sunset: { src: sunset1400.url, srcSet: set([[sunset800, 800], [sunset1400, 1400]]) },
  cover: { src: cover600.url, srcSet: set([[cover300, 300], [cover600, 600]]) },
  longhorn: { avif: set([[longhorn480, 480], [longhorn1600, 1600]]), webp: longhorn960.url, small: longhorn480.url },
  logo: logo.url,
};

export const RADIO_URL = "https://country.fazenda.rodeo";
export const PUBLIC_RSS_URL = "https://podcast.fazenda.rodeo/rss.xml";
/** Only services with real, confirmed URLs are rendered. Fill when available. */
export const DISTRIBUTION: { name: string; href: string }[] = [];
export const SOCIAL: { name: string; href: string }[] = [];
/** Official TopLeo Workers logo, once provided. */
export const CREDIT_LOGO_URL: string | null = null;

/** Conceptual demo pieces — never presented as published episodes. */
export const DEMO_EPISODES = [
  { id: "demo-1", program: "Rodeo Talks", title: "Raízes do Brasil: a força da cultura sertaneja", summary: "Uma conversa sobre identidade, família e o futuro da nossa música.", img: ep1.url, srcSet: set([[ep1s, 300], [ep1, 460]]), theme: "Música Country" },
  { id: "demo-2", program: "Arena Cast", title: "Vida no Rodeio: desafios e superações", summary: "Histórias reais de quem vive a adrenalina dentro e fora da arena.", img: ep2.url, srcSet: set([[ep2s, 300], [ep2, 460]]), theme: "Rodeio" },
  { id: "demo-3", program: "Vozes da Terra", title: "Mulheres do Country: talento sem fronteiras", summary: "Elas fazem história e mostram a força feminina na música country.", img: ep3.url, srcSet: set([[ep3s, 300], [ep3, 460]]), theme: "Entrevistas" },
  { id: "demo-4", program: "Caminhos do Campo", title: "Tradição em Movimento: o campo que inspira", summary: "Como o estilo de vida no campo continua moldando gerações.", img: ep4.url, srcSet: set([[ep4s, 300], [ep4, 460]]), theme: "Vida no Campo" },
];

export const PROGRAMS = [
  { n: "01", name: "Rodeo Talks", tagline: "Conversas que inspiram", img: p1.url },
  { n: "02", name: "Arena Cast", tagline: "O universo do rodeio", img: p2.url },
  { n: "03", name: "Vozes da Terra", tagline: "Música, cultura e pessoas reais", img: p3.url },
  { n: "04", name: "Caminhos do Campo", tagline: "Tradição, vida e liberdade", img: p4.url },
];

export const CATEGORY_LABELS: Record<string, string> = {
  "Music Commentary": "Comentário Musical",
  "Music History": "História da Música",
  "Music Interviews": "Entrevistas",
  "Entertainment News": "Notícias",
};
