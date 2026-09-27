import rss from "@astrojs/rss";
import { getStories } from "../../lib/content";

export async function GET(context: { site?: URL }) {
  const stories = await getStories("pt");

  return rss({
    title: "FELP011 — Histórias",
    description: "Histórias e textos de Felipe Augusto Mendes Ramos.",
    site: context.site!,
    trailingSlash: false,
    items: stories.map((story) => ({
      title: story.title,
      description: story.excerpt,
      pubDate: story.date,
      link: `/pt/stories/${story.slug}`,
    })),
    customData: "<language>pt-br</language>",
  });
}
