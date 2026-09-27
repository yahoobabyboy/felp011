---
# Design tokens. Every value here overrides the matching CSS custom property
# in src/styles/global.css, so the defaults in that file stay untouched and
# deleting this file reverts the design exactly.
#
# Colours are plain hex so the CMS can offer a colour picker. `light` is the
# default palette; `dark` is applied when the visitor's OS prefers dark mode.
# Edit both — a token changed in only one of them will drift.

light:
  bg: "#faf7f2"
  bgRaised: "#fffdfa"
  bgSunken: "#f2ede4"
  ink: "#211d18"
  inkSoft: "#4a4238"
  inkMuted: "#857b6d"
  inkFaint: "#b3a99a"
  line: "#e4dccd"
  lineStrong: "#d2c6b0"
  accent: "#b4603a"
  accentSoft: "#e8d2c4"
  accentInk: "#8f4a2c"

dark:
  bg: "#1a1714"
  bgRaised: "#221e1a"
  bgSunken: "#151210"
  ink: "#f2ebe0"
  inkSoft: "#cdc3b5"
  inkMuted: "#9c9082"
  inkFaint: "#6f6559"
  line: "#302a24"
  lineStrong: "#453d34"
  accent: "#d98a5f"
  accentSoft: "#3a2a20"
  accentInk: "#eaa87e"

# fontDisplay / fontBody are dropdowns in the CMS. The stored value IS the CSS
# font-family stack, so there is no name-to-stack lookup to drift out of sync.
# Only stacks that resolve on a real machine are offered — the previous
# `Fraunces` and `Söhne` entries never loaded, because no @font-face existed.
type:
  fontDisplay: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif'
  fontBody: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  fontMono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'

  # Fluid type scale. The clamp() expressions are deliberate: min, preferred
  # (viewport-relative), max.
  scale:
    stepMinus1: "clamp(0.8rem, 0.77rem + 0.15vw, 0.875rem)"
    step0: "clamp(0.95rem, 0.91rem + 0.2vw, 1.05rem)"
    step1: "clamp(1.15rem, 1.08rem + 0.35vw, 1.35rem)"
    step2: "clamp(1.45rem, 1.3rem + 0.75vw, 1.9rem)"
    step3: "clamp(1.9rem, 1.6rem + 1.5vw, 2.9rem)"
    step4: "clamp(2.5rem, 1.9rem + 3vw, 4.5rem)"

layout:
  page: 1240px
  measure: 62ch
  gutter: "clamp(1.25rem, 4vw, 4rem)"
  radius: 2px
---

<!-- Global design tokens only. Leave the body empty. -->
