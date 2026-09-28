import { tool } from "@opencode-ai/plugin"

/**
 * List the real image slots this project has.
 *
 * The artist does not name files by convention, they name them by meaning:
 * "the photo for the piece about the window", "the home page hero". A tool
 * that answers from the actual content entries is the only way the model can
 * offer that list without inventing entry names that do not exist.
 *
 * Read-only. Costs one request; the result is cached in the transcript.
 */
export default tool({
  description: [
    "List the image slots that exist in the project, from the real content entries.",
    "",
    "Call this before ask_for_image when you are not sure which entry an image",
    "is for, so you can pass a slot the artist will recognise. Site-wide slots",
    "always exist; entry slots come from the collections that are actually",
    "populated right now.",
    "",
    "Read-only: it changes nothing and asks the artist nothing.",
  ].join("\n"),
  args: {
    collection: tool.schema
      .string()
      .optional()
      .describe("Limit to one collection: 'site', 'pieces' or 'stories'."),
  },
  async execute(args) {
    const base = process.env.ASSISTANT_URL ?? "http://localhost:4321"
    const wanted = args.collection ? String(args.collection).trim() : ""
    try {
      const res = await fetch(
        base + "/_assistant/slots" + (wanted ? "?collection=" + encodeURIComponent(wanted) : ""),
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return "Could not read the slot list: " + (data?.error ?? "the panel did not answer") +
          ". Ask the artist which entry the image is for instead of guessing."
      }
      const slots: string[] = Array.isArray(data.slots) ? data.slots : []
      if (!slots.length) {
        return "No image slots are defined yet. Ask the artist in plain words " +
          "where the photo belongs, then pass that as the slot."
      }
      return (
        "Image slots:\n" +
        slots
          .map((s: any) => "- " + s.id + (s.title ? "  (" + s.title + ")" : "") +
            (s.current ? "  [has an image: " + s.current + "]" : ""))
          .join("\n") +
        "\n\nPass one of these ids to ask_for_image."
      )
    } catch (err: any) {
      return "Could not reach the assistant panel at " + base +
        " (" + (err?.message ?? err) + "). Ask the artist in plain words instead of guessing."
    }
  },
})
