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

/** Locale-aware path. English lives at the root, others behind a prefix. */
export function href(path: string, locale: Locale) {
  const clean = path.replace(/^\/+/, "");
  if (locale === DEFAULT_LOCALE) return clean ? `/${clean}` : "/";
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}
