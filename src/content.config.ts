import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import type { z as zod } from "astro/zod";

const LOCALES = ["en", "pt", "fr"] as const;

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
};
