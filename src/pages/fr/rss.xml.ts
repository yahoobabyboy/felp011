import rss from "@astrojs/rss";
import { getStories } from "../../lib/content";

export async function GET(context: { site?: URL }) {
  const stories = await getStories("fr");

  return rss({
    title: "FELP011 — Récits",
    description: "Récits et textes de Felipe Augusto Mendes Ramos.",
    site: context.site!,
    trailingSlash: false,
    items: stories.map((story) => ({
      title: story.title,
      description: story.excerpt,
      pubDate: story.date,
      link: `/fr/stories/${story.slug}`,
    })),
    customData: "<language>fr</language>",
  });
}
