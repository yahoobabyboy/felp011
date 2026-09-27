import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import type { z as zod } from "astro/zod";

const LOCALES = ["en", "pt", "fr"] as const;

/**
 * The warm-minimal palette, mirrored from src/styles/global.css. These are the
 * *fallbacks*: if design.md is deleted, or a token is missing from it, the CSS
 * defaults still apply. Keeping the hexes here as well means a partially filled
 * design.md degrades to the original look instead of to `undefined`.
 */
const PALETTE = {
  light: {
    bg: "#faf7f2",
    bgRaised: "#fffdfa",
    bgSunken: "#f2ede4",
    ink: "#211d18",
    inkSoft: "#4a4238",
    inkMuted: "#857b6d",
    inkFaint: "#b3a99a",
    line: "#e4dccd",
    lineStrong: "#d2c6b0",
    accent: "#b4603a",
    accentSoft: "#e8d2c4",
    accentInk: "#8f4a2c",
  },
  dark: {
    bg: "#1a1714",
    bgRaised: "#221e1a",
    bgSunken: "#151210",
    ink: "#f2ebe0",
    inkSoft: "#cdc3b5",
    inkMuted: "#9c9082",
    inkFaint: "#6f6559",
    line: "#302a24",
    lineStrong: "#453d34",
    accent: "#d98a5f",
    accentSoft: "#3a2a20",
    accentInk: "#eaa87e",
  },
} as const;

/**
 * Font stacks that actually resolve on a real machine. `Fraunces` and
 * `Söhne` were previously named in global.css with no @font-face anywhere in
 * the project, so the browser silently fell through to the rest of the stack —
 * the site has never rendered in either. Every entry here is a system font, so
 * nothing is downloaded and nothing blocks first paint.
 */
const FONT_STACKS = {
  serifOldstyle: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
  serifTransitional: 'Georgia, "Times New Roman", Times, serif',
  serifDidone: '"Didot", "Bodoni MT", "Playfair Display", Garamond, Georgia, serif',
  sansSystem:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  sansGrotesk: '"Helvetica Neue", Helvetica, Arial, "Segoe UI", sans-serif',
  sansHumanist: '"Optima", "Gill Sans", "Gill Sans MT", "Trebuchet MS", sans-serif',
  mono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
} as const;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const hexTokens = (defaults: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(defaults).map(([name, value]) => [
      name,
      z
        .string()
        .regex(HEX, "Must be a hex colour, e.g. #faf7f2")
        .default(value),
    ]),
  ) as Record<string, ReturnType<typeof z.string>>;


const shared = {
  title: z.string(),
  draft: z.boolean().default(false),
  order: z.number().default(0),
};

/** Per-artwork gallery. Images live in /media and are referenced by path. */
const piece = {
  ...shared,
  summary: z.string().optional(),
  cover: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  medium: z.string().optional(),
  year: z.number().optional(),
  dimensions: z.string().optional(),
  series: z.string().optional(),
  client: z.string().optional(),
  role: z.string().optional(),
  category: z.enum(["artwork", "commission"]).default("artwork"),
  price: z.string().optional(),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  body: z.string().default(""),
};

const story = {
  ...shared,
  excerpt: z.string().optional(),
  date: z.coerce.date().optional(),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  body: z.string().default(""),
};

const product = {
  ...shared,
  price: z.string().optional(),
  cover: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  status: z.enum(["draft", "coming_soon", "available"]).default("coming_soon"),
  buyLink: z.string().optional(),
  details: z.string().default(""),
};

const site = {
  brand: z.string().default("FELP011"),
  name: z.string().default("Felipe Augusto Mendes Ramos"),
  tagline: z
    .object({
      en: z.string().default("Photographer"),
      pt: z.string().default("Fotógrafo"),
      fr: z.string().default("Photographe"),
    })
    .default({ en: "Photographer", pt: "Fotógrafo", fr: "Photographe" }),
  bio: z.object({
    en: z.string().default(""),
    pt: z.string().default(""),
    fr: z.string().default(""),
  }),
  email: z.string().default("contatofelp011@gmail.com"),
  locations: z.array(z.string()).default(["Paris, France", "São Paulo, Brasil"]),
  socials: z
    .array(z.object({ label: z.string(), url: z.string() }))
    .default([]),
  pages: z
    .object({
      about: z.object({ en: z.string().default(""), pt: z.string().default(""), fr: z.string().default("") }),
      contact: z.object({ en: z.string().default(""), pt: z.string().default(""), fr: z.string().default("") }),
      shop: z.object({ en: z.string().default(""), pt: z.string().default(""), fr: z.string().default("") }),
    })
    .default({
      about: { en: "", pt: "", fr: "" },
      contact: { en: "", pt: "", fr: "" },
      shop: { en: "", pt: "", fr: "" },
    }),
};

/**
 * Design tokens. Not per-locale: the palette is global, and only the CMS
 * writes it. Colours are constrained to hex so the CMS colour picker and the
 * Zod schema agree; everything else is a free CSS string, because a token like
 * `--step-1` is a clamp() expression and cannot be validated as a colour or a
 * number without rejecting valid input.
 */
const design = {
  light: z.object(hexTokens(PALETTE.light)),
  dark: z.object(hexTokens(PALETTE.dark)),
  type: z.object({
    fontDisplay: z.string().default(FONT_STACKS.serifOldstyle),
    fontBody: z.string().default(FONT_STACKS.sansSystem),
    fontMono: z.string().default(FONT_STACKS.mono),
    // Nested so the CMS can group it under a collapsible "Type scale" heading.
    // The nesting must mirror public/admin/config.yml exactly — a field path
    // that disagrees with this schema fails silently, the token just never
    // reaches the stylesheet.
    scale: z.object({
      stepMinus1: z.string().default("clamp(0.8rem, 0.77rem + 0.15vw, 0.875rem)"),
      step0: z.string().default("clamp(0.95rem, 0.91rem + 0.2vw, 1.05rem)"),
      step1: z.string().default("clamp(1.15rem, 1.08rem + 0.35vw, 1.35rem)"),
      step2: z.string().default("clamp(1.45rem, 1.3rem + 0.75vw, 1.9rem)"),
      step3: z.string().default("clamp(1.9rem, 1.6rem + 1.5vw, 2.9rem)"),
      step4: z.string().default("clamp(2.5rem, 1.9rem + 3vw, 4.5rem)"),
    }),
  }),
  layout: z.object({
    page: z.string().default("1240px"),
    measure: z.string().default("62ch"),
    gutter: z.string().default("clamp(1.25rem, 4vw, 4rem)"),
    radius: z.string().default("2px"),
  }),
};

const mk = (base: string, schema: zod.ZodType) =>
  Object.fromEntries(
    LOCALES.map((locale) => [
      `${locale}-${base}`,
      defineCollection({
        loader: glob({ base: `./src/content/${base}/${locale}`, pattern: "**/*.md" }),
        schema,
      }),
    ]),
  );

export const collections = {
  ...mk("pieces", z.object(piece)),
  ...mk("stories", z.object(story)),
  ...mk("products", z.object(product)),
  "en-site": defineCollection({
    loader: glob({ base: "./src/content/site", pattern: "site.md" }),
    schema: z.object(site),
  }),
  "en-design": defineCollection({
    loader: glob({ base: "./src/content/design", pattern: "design.md" }),
    schema: z.object(design),
  }),
};
