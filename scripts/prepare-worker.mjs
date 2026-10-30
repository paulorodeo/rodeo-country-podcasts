/**
 * Nitro emits the Wrangler configuration during the build.
 * Attach the existing Rodeo Podcasts KV namespace without changing Lovable's Vite adapter.
 */
import { readFile, writeFile } from "node:fs/promises";

const file = ".output/server/wrangler.json";
const config = JSON.parse(await readFile(file, "utf8"));

if (config.name !== "paulorodeo-rodeo-country-podcasts") {
  throw new Error("Unexpected Worker name: " + String(config.name));
}

config.kv_namespaces = [
  ...(config.kv_namespaces || []).filter((x) => x.binding !== "PODCAST_RSS_KV"),
  { binding: "PODCAST_RSS_KV", id: "6294b2c18dce4a0ca3fb8cc4f8150ea9" },
];

await writeFile(file, JSON.stringify(config, null, 2) + "\n");
console.log("KV binding configured for " + config.name);
