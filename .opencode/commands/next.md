---
description: Do the single next part from HANDOFF.md, then update it
agent: build
---

Read @HANDOFF.md and do exactly the ONE part under "Next part". Nothing else.

- `export PATH="$HOME/.local/bin:$PATH"` before any node/npm call.
- Do not start a second part even if the first one was easy.
- Verify the part actually works before reporting it done.
- Then update @HANDOFF.md: mark the part complete, replace "Next part" with the
  following one, and note anything surprising you found.
- If nothing remains, make the first line of @HANDOFF.md exactly `DONE`.
- Final summary: 10 lines maximum.
