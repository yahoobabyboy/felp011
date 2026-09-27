---
description: Do the next actionable part from HANDOFF.md, then update it
agent: build
---

Read @HANDOFF.md and work through its "Remaining work" list from the top. Do
exactly ONE item, nothing else.

- `export PATH="$HOME/.local/bin:$PATH"` before any node/npm call.
- **An item is only actionable if you can finish it from the terminal alone.**
  Anything needing the Cloudflare dashboard, the GitHub OAuth app page, a
  secret pasted by the user, or a domain registrar is the user's to do — stop
  and hand it over with exact steps instead of half-attempting it.
- Never ask for, print or commit a secret. Secrets go in via
  `wrangler secret put` or the dashboard, entered by the user.
- Do not start a second item even if the first one was easy.
- Verify the item actually works before reporting it done — `npm run build`
  must stay green.
- Then update @HANDOFF.md: mark the item complete, remove it from the list, and
  note anything surprising you found.
- If every remaining item needs the user, say so plainly and stop. Do not
  manufacture work to look productive.
- If nothing remains at all, make the first line of @HANDOFF.md exactly `DONE`.
- Final summary: 10 lines maximum.
