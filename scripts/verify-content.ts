import { glob } from "astro/loaders";
import { getPieceSlugs, getStorySlugs, getProducts, getStories, getSite } from "../src/lib/content.ts";

const LOCALES = ["en", "pt", "fr"] as const;

void glob;
void getPieceSlugs;
void getStorySlugs;
void getProducts;
void getStories;
void getSite;

const out: Record<string, unknown> = {};
for (const locale of LOCALES) {
  out[locale] = {
    pieces: await getPieceSlugs(locale),
    stories: await getStorySlugs(locale),
    products: (await getProducts(locale)).map((p) => p.slug),
  };
}
console.log(JSON.stringify(out, null, 2));
