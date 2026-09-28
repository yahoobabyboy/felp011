import { tool } from "@opencode-ai/plugin"

/**
 * Ask the artist for a photograph, and block until they have picked one.
 *
 * Why a tool and not a question: the picker used to depend on the model
 * writing "[upload] ..." as the question header. It did that exactly once, in
 * a session where it instead asked a plain multiple-choice question, so the
 * artist got three text buttons and no file dialog — and the upload code was
 * never reached at all. A convention in a prompt is not a contract. This tool
 * IS the picker: if the model calls it, the artist gets a file dialog, and if
 * the model does not call it, no image is ever going to arrive.
 *
 * The call blocks until the artist picks a file or skips, then returns the
 * saved paths so the turn carries on and the file gets referenced in content.
 */
export default tool({
  description: [
    "Ask the artist to add a photograph to the project.",
    "",
    "Use this the moment a task needs a real image and none exists yet: the",
    "artist's photographs are on their disk, not in the repo, and public/media",
    "is usually empty. Do NOT invent a path, do NOT write a placeholder image,",
    "and do NOT say an image is already there.",
    "",
    "This call BLOCKS until the artist picks a file or skips. While it waits,",
    "write nothing else and make no other tool calls.",
    "",
    "Pass slot so the picker shows the artist which entry the photo is for.",
    "Call ask_for_image again for a second, different image.",
  ].join("\n"),
  args: {
    purpose: tool.schema
      .string()
      .describe(
        "What the image is for, in a few words the artist will recognise. " +
          "Shown as the card heading. e.g. 'hero image for the home page'.",
      ),
    slot: tool.schema
      .string()
      .optional()
      .describe(
        "Which entry or slot the image belongs to, e.g. 'piece: example-study-in-light', " +
          "'story: nota-sobre-comecar-de-novo', or 'site: home page hero'. " +
          "Use the id from ask_image_slots when unsure. The artist can change it.",
      ),
    destination: tool.schema
      .string()
      .optional()
      .describe(
        "Folder to save into, e.g. '/public/media/'. Defaults to /public/media/.",
      ),
    overwrite: tool.schema
      .boolean()
      .optional()
      .describe(
        "Replace the file if one already exists at that name. Off by default: " +
          "a same-name upload is saved as name-2.jpg so nothing is destroyed.",
      ),
  },
  async execute(args, context) {
    const base = process.env.ASSISTANT_URL ?? "http://localhost:4321"
    const payload = {
      purpose: String(args.purpose ?? "").trim() || "an image",
      slot: args.slot ? String(args.slot).trim() : null,
      destination: args.destination ? String(args.destination).trim() : null,
      overwrite: Boolean(args.overwrite),
      sessionID: context.sessionID ?? null,
      messageID: context.messageID ?? null,
    }

    let created: any
    try {
      const res = await fetch(base + "/_assistant/image-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      created = await res.json().catch(() => ({}))
      if (!res.ok) {
        return (
          "Could not open the image picker: " +
          (created?.error ?? "the assistant panel did not answer") +
          ". The artist needs `npm run dev` running to receive images. " +
          "Tell them, and do not invent a file path."
        )
      }
    } catch (err: any) {
      return (
        "Could not reach the assistant panel at " + base + " (" + (err?.message ?? err) + "). " +
        "The artist needs `npm run dev` running to receive images. Tell them, " +
        "and do not invent a file path."
      )
    }

    const id = created.id
    /* Poll until the artist answers. Long enough for someone to open a file
       picker and choose a photograph, short enough that a forgotten picker
       does not hang the turn forever. */
    const deadline = Date.now() + 30 * 60 * 1000
    let missing = 0
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 700))
      let state: any
      try {
        const res = await fetch(base + "/_assistant/image-request/" + encodeURIComponent(id))
        state = await res.json().catch(() => ({}))
        /* 404 means the panel restarted: the request lived in memory and is
           gone, and the artist is looking at a picker for a request that no
           longer exists. Polling for 30 more minutes would be worse than
           useless — it would hang the turn and give the artist no way out.
           Give up promptly and let the model tell them what happened. */
        if (res.status === 404) {
          if (++missing < 3) continue
          return (
            "The image picker went away before the artist answered: the assistant " +
            "panel restarted and lost the request. No file was added. Ask the " +
            "artist to send the request again once the panel is back."
          )
        }
      } catch {
        /* The panel being briefly unreachable is not a lost request; the
           artist may still have the picker open. Keep waiting. */
        continue
      }
      if (state.status === "skipped") {
        return "The artist skipped this image. Do not reference any file for it."
      }
      if (state.status === "done") {
        const bits = [
          "Saved " + state.path,
          state.publicPath ? "served at " + state.publicPath : "not in public/, so it is not on the site",
        ]
        if (state.renamedBecauseTaken) {
          bits.push("the original was kept and this was saved alongside it as " + state.storedAs)
        }
        if (state.slot) {
          /* Wording matters here. The artist can re-aim the file, and the
             returned slot is the one they chose, not the one proposed. */
          bits.push("the artist filed it under " + state.slot)
        }
        return bits.join(". ") + "."
      }
      if (state.status === "failed") {
        return "The upload failed: " + (state.error ?? "unknown error") + "."
      }
    }
    return (
      "Nobody answered the image picker within 30 minutes. Treat it as declined " +
      "and say so rather than assuming a file exists."
    )
  },
})
