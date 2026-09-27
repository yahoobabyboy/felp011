# ~/Website

Artist portfolio for FELP011. Astro 6 static site, 3 locales (en at root, pt, fr),
Sveltia CMS at `/admin`, built for Cloudflare Pages.

## Environment

- `export PATH="$HOME/.local/bin:$PATH"` FIRST in every shell. node v22.16.0 and
  npm live there and are NOT on the default PATH — every bare `node`/`npm` fails.
- Never use Homebrew; it is not installed.
- Build: `npm run build` (runs `astro check` then `astro build`).
- Regenerate the 24 trilingual route files: `npm run routes`.
- Content collections are keyed `<locale>-<base>`: `en-pieces`, `pt-stories`,
  `en-site`, etc. All access goes through the `asKey` helper in `src/lib/content.ts`.

## Session discipline

- Auto-compaction is DISABLED on purpose. The free tier returns `FreeTierError`
  on compaction, which silently kills the turn with no output. Never re-enable it
  and never suggest `/compact`.
- If a context overflows, that is a loud, expected error. Do the handoff instead.
- Do exactly ONE part per session, then update HANDOFF.md and stop.
- If asked to continue, re-read HANDOFF.md first — it is the source of truth,
  not the conversation history.
