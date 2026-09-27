import rss from "@astrojs/rss";
import { getStories } from "../lib/content";

export async function GET(context: { site?: URL }) {
  const stories = await getStories("en");

  return rss({
    title: "FELP011 — Stories",
    description: "Stories and writing by Felipe Augusto Mendes Ramos.",
    site: context.site!,
    trailingSlash: false,
    items: stories.map((story) => ({
      title: story.title,
      description: story.excerpt,
      pubDate: story.date,
      link: `/stories/${story.slug}`,
    })),
    customData: "<language>en</language>",
  });
}
