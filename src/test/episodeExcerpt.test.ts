import { describe, expect, it } from "vitest";
import { episodeExcerpt } from "@/lib/episodeExcerpt";

describe("Homepage featured episode excerpt", () => {
  it("keeps short descriptions unchanged", () => {
    expect(episodeExcerpt("Uma história do country.")).toBe("Uma história do country.");
  });
  it("normalizes whitespace and limits a very long RSS description", () => {
    const long = "A música Memo foi lançada. ".repeat(40);
    const excerpt = episodeExcerpt(long, 220);
    expect(excerpt.length).toBeLessThanOrEqual(221);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerpt).not.toContain("\n");
  });
  it("preserves Unicode and does not split a word midstream", () => {
    const excerpt = episodeExcerpt("História 🎙️ da música country no Brasil, ".repeat(20), 90);
    expect(excerpt).toMatch(/…$/u);
    expect(excerpt).not.toContain("�");
  });
  it("does not modify the full source description", () => {
    const original = "Raízes e música. ".repeat(35);
    const short = episodeExcerpt(original);
    expect(original.length).toBeGreaterThan(short.length);
    expect(original).toContain("Raízes e música.");
  });
  it("returns empty output for blank descriptions", () => {
    expect(episodeExcerpt("  \n  ")).toBe("");
  });
});
