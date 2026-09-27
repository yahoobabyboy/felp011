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

## Local preview loop (use this instead of deploying to look at changes)

    export PATH="$HOME/.local/bin:$PATH"
    npm run dev                      # Astro 6, http://localhost:4321/

Then in **Chrome** (Chromium only — Safari/Firefox lack the File System Access
API): open **`http://localhost:4321/admin/index.html`**, click *Work with Local
Repository*, and pick `~/Website`. The CMS now writes straight into the working
tree — no auth, no commit, no Cloudflare rebuild. View the site at
`http://localhost:4321/`. Review with `git diff`, commit when happy.

- The URL **must** end in `index.html`. `http://localhost:4321/admin/` is a 404
  on the dev server even though `/admin/` works in production.
- Never move `admin/index.html` into `src/pages/`. Astro would then hot-reload
  the admin page on every content save, wiping the CMS session.
- Local edits stay **uncommitted** until reviewed. The user may be mid-edit;
  check `git status` before committing anything.
- **Branch policy (user's choice, 2026-09-27: "go for the safest option").** Stay
  on `main` for content and CMS work — `git restore src/content` is a clean undo
  and there is nothing to isolate. Create a branch off `main` *before* touching
  structure (`Base.astro`, `src/components/`, `src/content.config.ts`,
  `src/pages/`) and tell the user the branch name. Reason: `main` is what
  Cloudflare Pages watches, so a push to it deploys the live site.
- **Never `git push` without the user asking.** A push is a deploy.
- The official `sveltia-cms` agent skill is installed at
  `~/.config/opencode/skills/sveltia-cms/`. Read it before changing
  `public/admin/config.yml` — a config error locks you out of `/admin` entirely.

## Session discipline

- Auto-compaction is DISABLED on purpose. The free tier returns `FreeTierError`
  on compaction, which silently kills the turn with no output. Never re-enable it
  and never suggest `/compact`.
- If a context overflows, that is a loud, expected error. Do the handoff instead.
- Do exactly ONE part per session, then update HANDOFF.md and stop.
- If asked to continue, re-read HANDOFF.md first — it is the source of truth,
  not the conversation history.
