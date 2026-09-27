import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = "/Users/FELP011/Website/src/pages";

/** [component, route path relative to src/pages, needs slug param, locale] */
const ROUTES = [
  ["HomePage", "", false, "en"],
  ["PortfolioPage", "portfolio", false, "en"],
  ["PiecePage", "portfolio/[slug]", true, "en"],
  ["StoriesPage", "stories", false, "en"],
  ["StoryPage", "stories/[slug]", true, "en"],
  ["AboutPage", "about", false, "en"],
  ["ContactPage", "contact", false, "en"],
  ["ShopPage", "shop", false, "en"],
  ["HomePage", "pt/index", false, "pt"],
  ["PortfolioPage", "pt/portfolio", false, "pt"],
  ["PiecePage", "pt/portfolio/[slug]", true, "pt"],
  ["StoriesPage", "pt/stories", false, "pt"],
  ["StoryPage", "pt/stories/[slug]", true, "pt"],
  ["AboutPage", "pt/about", false, "pt"],
  ["ContactPage", "pt/contact", false, "pt"],
  ["ShopPage", "pt/shop", false, "pt"],
  ["HomePage", "fr/index", false, "fr"],
  ["PortfolioPage", "fr/portfolio", false, "fr"],
  ["PiecePage", "fr/portfolio/[slug]", true, "fr"],
  ["StoriesPage", "fr/stories", false, "fr"],
  ["StoryPage", "fr/stories/[slug]", true, "fr"],
  ["AboutPage", "fr/about", false, "fr"],
  ["ContactPage", "fr/contact", false, "fr"],
  ["ShopPage", "fr/shop", false, "fr"],
];

for (const [component, routePath, needsSlug, locale] of ROUTES) {
  const base = needsSlug ? component.replace("Page", "").toLowerCase() : null;
  const filePath = join(ROOT, `${routePath}.astro`);
  mkdirSync(dirname(filePath), { recursive: true });

  const depth = routePath.split("/").length - 1;
  const up = "../".repeat(depth + 1);
  const props = needsSlug ? ` locale="${locale}" slug={Astro.params.slug!}` : ` locale="${locale}"`;

  // Dynamic routes need getStaticPaths; `locale` also shadows the imported
  // `getPieceSlugs` helper, so the import is aliased.
  const frontmatter = needsSlug
    ? `---\nimport ${component} from "${up}components/${component}.astro";\nimport { get${base === "piece" ? "Piece" : "Story"}Slugs } from "${up}lib/content";\n\nexport async function getStaticPaths() {\n  const slugs = await get${base === "piece" ? "Piece" : "Story"}Slugs("${locale}");\n  return slugs.map((slug) => ({ params: { slug } }));\n}\n---\n\n<${component} ${props} />\n`
    : `---\nimport ${component} from "${up}components/${component}.astro";\n---\n\n<${component} ${props} />\n`;

  writeFileSync(filePath, frontmatter);
}

console.log(`generated ${ROUTES.length} route files`);
