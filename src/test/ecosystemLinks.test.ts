import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { CHANNELS_URL, PORTAL_URL, PUBLIC_RSS_URL, RADIO_URL, TOPLEO_URL, TV_URL } from "@/lib/media";

const footerSource = readFileSync("src/components/site/SiteFooter.tsx", "utf8");
const headerSource = readFileSync("src/components/site/SiteHeader.tsx", "utf8");

describe("Rodeo Country ecosystem links", () => {
  it("points radio at the canonical radio Worker and keeps stations separate", () => {
    expect(RADIO_URL).toBe("https://radio.fazenda.rodeo");
    expect(CHANNELS_URL).toBe("https://country.fazenda.rodeo/station/");
  });

  it("uses the supplied ecosystem domains and RSS", () => {
    expect(PORTAL_URL).toBe("https://portal.fazenda.rodeo/");
    expect(TV_URL).toBe("https://tv.fazenda.rodeo/");
    expect(TOPLEO_URL).toBe("https://www.topleo.workers.dev/");
    expect(PUBLIC_RSS_URL).toBe("https://podcast.fazenda.rodeo/rss.xml");
  });

  it("renders ecosystem links and linked TopLeo attribution in the footer", () => {
    for (const name of ["PORTAL_URL", "RADIO_URL", "TV_URL", "CHANNELS_URL", "TOPLEO_URL"]) {
      expect(footerSource).toContain("href={" + name + "}");
    }
  });

  it("marks feed subscriptions with the RSS icon", () => {
    expect(footerSource).toContain('<Rss className=');
    expect(footerSource).toContain('type="application/rss+xml"');
  });

  it("keeps one compact radio action instead of duplicate navigation CTAs", () => {
    expect(headerSource).not.toContain('className="btn-gold');
    expect(headerSource).not.toContain("Ouça a Rádio <span");
    expect(headerSource.match(/href=\{RADIO_URL\}/g)).toHaveLength(1);
  });
});
