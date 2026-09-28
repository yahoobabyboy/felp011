import { getCollection, getEntry } from "astro:content";
import { DEFAULT_LOCALE, type Locale } from "./i18n";

/**
 * Collection keys are built at runtime (`en-pieces`), which Astro's
 * static key types cannot follow. This module routes everything through two
 * narrow casts so the rest of the site still gets real types.
 */
interface RawEntry {
  id: string;
  collection: string;
  data: Record<string, unknown>;
}

const asKey = (base: string, locale: Locale) => `${locale}-${base}` as never;
const asEntries = (entries: unknown) => entries as RawEntry[];
const asEntry = (entry: unknown) => entry as RawEntry | undefined;

export interface Piece {
  slug: string;
  locale: Locale;
  title: string;
  summary?: string;
  cover?: string;
  gallery: string[];
  medium?: string;
  year?: number;
  dimensions?: string;
  series?: string;
  client?: string;
  role?: string;
  category: "artwork" | "commission";
  price?: string;
  available: boolean;
  featured: boolean;
  body: string;
  order: number;
}

export interface Story {
  slug: string;
  locale: Locale;
  title: string;
  excerpt?: string;
  date?: Date;
  cover?: string;
  tags: string[];
  body: string;
  order: number;
}

export interface Product {
  slug: string;
  locale: Locale;
  title: string;
  price?: string;
  cover?: string;
  gallery: string[];
  status: "draft" | "coming_soon" | "available";
  buyLink?: string;
  details: string;
  order: number;
}

export interface SiteSettings {
  brand: string;
  name: string;
  hero?: string;
  tagline: Record<Locale, string>;
  bio: Record<Locale, string>;
  email: string;
  locations: string[];
  socials: { label: string; url: string }[];
  pages: Record<"about" | "contact" | "shop", Record<Locale, string>>;
}

/** Group per-locale collections into a single map keyed by a shared id. */
function group(entries: RawEntry[]) {
  const map = new Map<string, RawEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.id) ?? [];
    list.push(entry);
    map.set(entry.id, list);
  }
  return map;
}

/** The locale leads the collection name (`pt-pieces`). */
const localeOf = (entry: RawEntry): Locale => entry.collection.split("-")[0] as Locale;

async function collect(locale: Locale) {
  const [pieces, stories, products] = await Promise.all([
    getCollection(asKey("pieces", locale)),
    getCollection(asKey("stories", locale)),
    getCollection(asKey("products", locale)),
  ]).then(([p, s, r]) => [asEntries(p), asEntries(s), asEntries(r)] as const);

  const pieceMap = group(pieces.filter((e) => !e.data.draft));
  const storyMap = group(stories.filter((e) => !e.data.draft));
  const productMap = group(products.filter((e) => !e.data.draft));

  const toPieces = (id: string): Piece[] => (pieceMap.get(id) ?? []).map((e) => ({ ...(e.data as Omit<Piece, "slug" | "locale">), slug: e.id, locale: localeOf(e) }));
  const toStories = (id: string): Story[] => (storyMap.get(id) ?? []).map((e) => ({ ...(e.data as Omit<Story, "slug" | "locale">), slug: e.id, locale: localeOf(e) }));
  const toProducts = (id: string): Product[] => (productMap.get(id) ?? []).map((e) => ({ ...(e.data as Omit<Product, "slug" | "locale">), slug: e.id, locale: localeOf(e) }));

  return { pieceMap, storyMap, productMap, toPieces, toStories, toProducts };
}

/** Pick the requested locale, falling back to English when untranslated. */
function pick<T extends { locale: Locale }>(entries: T[], locale: Locale): T | undefined {
  return entries.find((e) => e.locale === locale) ?? entries.find((e) => e.locale === DEFAULT_LOCALE);
}

export async function getPieces(locale: Locale) {
  const { pieceMap, toPieces } = await collect(locale);
  return [...pieceMap.values()]
    .map((entries) => pick(toPieces(entries[0]!.id), locale))
    .filter((p): p is Piece => Boolean(p))
    .sort((a, b) => a.order - b.order || (b.year ?? 0) - (a.year ?? 0));
}

export async function getPiece(slug: string, locale: Locale) {
  const { pieceMap, toPieces } = await collect(locale);
  const entries = pieceMap.get(slug);
  if (!entries) return undefined;
  return pick(toPieces(slug), locale);
}

/** Raw markdown entry, for pages that need `render()`. */
export async function getPieceEntry(slug: string, locale: Locale) {
  return asEntry(await getEntry(asKey("pieces", locale), slug));
}

export async function getStoryEntry(slug: string, locale: Locale) {
  return asEntry(await getEntry(asKey("stories", locale), slug));
}

export async function getPieceSlugs(locale: Locale) {
  const { pieceMap } = await collect(locale);
  return [...pieceMap.keys()];
}

export async function getStories(locale: Locale) {
  const { storyMap, toStories } = await collect(locale);
  return [...storyMap.values()]
    .map((entries) => pick(toStories(entries[0]!.id), locale))
    .filter((s): s is Story => Boolean(s))
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) || a.order - b.order);
}

export async function getStory(slug: string, locale: Locale) {
  const { storyMap, toStories } = await collect(locale);
  const entries = storyMap.get(slug);
  if (!entries) return undefined;
  return pick(toStories(slug), locale);
}

export async function getStorySlugs(locale: Locale) {
  const { storyMap } = await collect(locale);
  return [...storyMap.keys()];
}

export async function getProducts(locale: Locale) {
  const { productMap, toProducts } = await collect(locale);
  return [...productMap.values()]
    .map((entries) => pick(toProducts(entries[0]!.id), locale))
    .filter((p): p is Product => Boolean(p))
    .sort((a, b) => a.order - b.order);
}

export async function getProduct(slug: string, locale: Locale) {
  const { productMap, toProducts } = await collect(locale);
  const entries = productMap.get(slug);
  if (!entries) return undefined;
  return pick(toProducts(slug), locale);
}

export async function getSite(): Promise<SiteSettings> {
  const entry = asEntry(await getEntry(asKey("site", DEFAULT_LOCALE), "site"));
  if (!entry) throw new Error("Missing src/content/site/site.md");
  return entry.data as unknown as SiteSettings;
}

export type Palette = Record<PaletteToken, string>;
export interface DesignTokens {
  light: Palette;
  dark: Palette;
  type: {
    fontDisplay: string;
    fontBody: string;
    fontMono: string;
    scale: Record<string, string>;
  };
  layout: Record<string, string>;
}

/**
 * The CSS custom property each design token feeds. Deliberately an explicit
 * list rather than a loop over the object: a typo in a token name must be a
 * type error, not a silently-dropped style. `bgRaised` -> `--bg-raised` and
 * `stepMinus1` -> `--step--1` cannot both be derived by one simple rule, which
 * is why this is hand-written.
 */
const PALETTE_VARS = {
  bg: "--bg",
  bgRaised: "--bg-raised",
  bgSunken: "--bg-sunken",
  ink: "--ink",
  inkSoft: "--ink-soft",
  inkMuted: "--ink-muted",
  inkFaint: "--ink-faint",
  line: "--line",
  lineStrong: "--line-strong",
  accent: "--accent",
  accentSoft: "--accent-soft",
  accentInk: "--accent-ink",
} as const satisfies Record<string, string>;

type PaletteToken = keyof typeof PALETTE_VARS;

const FONT_VARS = {
  fontDisplay: "--font-display",
  fontBody: "--font-body",
  fontMono: "--font-mono",
} as const satisfies Record<string, string>;

const STEP_VARS = {
  stepMinus1: "--step--1",
  step0: "--step-0",
  step1: "--step-1",
  step2: "--step-2",
  step3: "--step-3",
  step4: "--step-4",
} as const satisfies Record<string, string>;

const LAYOUT_VARS = {
  page: "--page",
  measure: "--measure",
  gutter: "--gutter",
  radius: "--radius",
} as const satisfies Record<string, string>;

/**
 * The design file is optional by design: deleting it must fall back to the
 * CSS defaults in global.css, not throw. Every token is skipped when absent so
 * a partially filled file degrades to the original palette rather than to
 * `undefined` in a stylesheet.
 */
export async function getDesign(): Promise<DesignTokens | undefined> {
  const entry = asEntry(await getEntry(asKey("design", DEFAULT_LOCALE), "design"));
  if (!entry) return undefined;
  return entry.data as unknown as DesignTokens;
}

const decl = (name: string, value: string | undefined) =>
  typeof value === "string" && value.trim() ? `  ${name}: ${value};` : undefined;

const block = (selector: string, lines: (string | undefined)[]) => {
  const kept = lines.filter((l): l is string => Boolean(l));
  return kept.length ? `${selector} {\n${kept.join("\n")}\n}` : undefined;
};

/**
 * Serialise tokens into a stylesheet that overrides global.css.
 *
 * Order is NOT usable here. Astro injects the bundled global.css as the last
 * element in <head>, so an inline <style> placed in <head> always lands before
 * it and would lose at equal specificity — verified, not assumed. Instead the
 * override selector is `:root:root`, which is two pseudo-classes (0,2,0)
 * against global.css's single `:root` (0,1,0). Specificity is compared before
 * source order, so this wins from any position. Returns undefined when there
 * is nothing to override, keeping the extra <style> out of the page entirely.
 */
export function designCss(design: DesignTokens | undefined): string | undefined {
  if (!design) return undefined;

  const root = block(":root:root", [
    ...Object.entries(PALETTE_VARS).map(([t, v]) => decl(v, design.light?.[t as PaletteToken])),
    ...Object.entries(FONT_VARS).map(([t, v]) => decl(v, design.type?.[t as keyof typeof FONT_VARS])),
    ...Object.entries(STEP_VARS).map(([t, v]) => decl(v, design.type?.scale?.[t])),
    ...Object.entries(LAYOUT_VARS).map(([t, v]) => decl(v, design.layout?.[t])),
  ]);

  const dark = block("@media (prefers-color-scheme: dark)", [
    block(":root:root", [
      ...Object.entries(PALETTE_VARS).map(([t, v]) => decl(v, design.dark?.[t as PaletteToken])),
    ]),
  ]);

  return [root, dark].filter(Boolean).join("\n\n") || undefined;
}

/** Locale-aware path. English lives at the root, others behind a prefix. */
export function href(path: string, locale: Locale) {
  const clean = path.replace(/^\/+/, "");
  if (locale === DEFAULT_LOCALE) return clean ? `/${clean}` : "/";
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}
