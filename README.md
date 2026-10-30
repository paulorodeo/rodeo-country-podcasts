# Rodeo Country Podcasts

Vamos construir a homepage do portal Rodeo Country Podcasts (Fazenda Rodeo / Rodeo Country Media) seguindo integralmente o briefing anexo "PROJETO FAZENDA RODEO — GOLDEN PREMIUM PODCAST (pasted).md" — sistema de design GOLDEN PREMIUM, hero cinematográfico, busca com chips, episódios recentes, programas, seção RSS, rodapé editorial, regras de integridade e performance. Aqui a interface é React + TypeScript + Tailwind, sem WordPress, Kentha, Sonaar, banco de dados, autenticação ou Supabase.

Identidade v0.3 (arquivos anexos "identidade-v0.3.md" e "README.md"): o símbolo oficial é a caveira bovina Longhorn dourada (longhorn-mark.avif anexo, 1600×800 com transparência), sem círculo, estrela ou coroa. O wordmark é construído em texto/CSS: "RODEO COUNTRY" em Barlow Condensed 700 caixa alta com ~0.095em de espaçamento, e "MEDIA · PODCASTS" em Manrope 800 caixa alta com ~0.27em. Títulos hero e editoriais em Playfair Display 600–700; interface e conteúdo em Manrope 400–800. Instale as fontes de verdade via Fontsource (@fontsource/playfair-display, @fontsource/manrope, @fontsource/barlow-condensed) — a v0.3 as declara mas nunca as carrega. A logo oficial da Fazenda Rodeo (New-Logo-Fazenda-Rodeo anexo) entra no header e rodapé sem redesenho.

Layout: a referência principal é a imagem anexa rodeo-country-podcast.png; a identidade de materiais e iluminação é cover.webp. Reaproveite as imagens embutidas em base64 no preview anexo rodeo-podcasts-preview-v0.3.html — cena do estúdio do hero, cowboy ao pôr do sol da seção RSS, capas de episódios, capas de programas e a capa oficial do podcast em 600×600 — extraia-as como assets otimizados com srcset. Inclua a nova seção "longhorn-stage" da v0.3: palco de marca com o emblema Longhorn central e a frase "O country não é apenas música. É um jeito de viver." O header tem menu mobile e o botão dourado "OUÇA A RÁDIO" aponta para https://country.fazenda.rodeo (abre em outra aba).

Feed real validado: https://live.fazenda.rodeo/public/1/podcast/1f1d3dcf-d633-6d18-bad2-c7446e873a40/feed responde HTTP 200 com application/rss+xml, XML válido e 1 episódio real ("Live Lonely - Mason Ramsey & Harper Grace", enclosure MP3 via op3.dev, itunes:image presente). O hero puxa dinamicamente o episódio mais recente desse feed com capa real; player HTML5 persistente durante a navegação interna (único elemento de áudio, SPA), play somente por ação do usuário, nunca dois áudios simultâneos, tratamento de erro de rede e estados claros de carregamento. Feed indisponível = fallback editorial honesto, jamais episódios fictícios publicados como reais — conteúdo de demonstração só aparece explicitamente identificado como prévia, como no protocolo da v0.3. Os quatro programas seguem como categorias conceituais claramente identificadas até existir catálogo real.

Camada de feed: preservar GUIDs, datas e links de áudio; computar itunes:duration e os bytes reais do enclosure (a origem envia length "199.84" inválido) e aplicar language pt-BR caso a origem não mude. Corrigir também no empacotamento caso o dono não consiga ajustar no AzuraCast.

Escopo desta entrega: homepage completa em alta fidelidade, desktop e mobile responsivos, para avaliação — header, hero cinematográfico, estilo Golden Premium, efeitos metálicos, longhorn-stage, player, cards, seção de programas, assinatura RSS e rodapé. Não faça deploy em produção nem altere DNS. Meta de LCP <= 2,5s, sem autoplay, HTML semântico, contraste acessível, prefers-reduced-motion respeitado.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a14659df-327f-4f47-8c7f-250c7fb5a52f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
