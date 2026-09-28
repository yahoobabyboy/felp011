---
# Design tokens. Every value here overrides the matching CSS custom property
# in src/styles/global.css, so the defaults in that file stay untouched and
# deleting this file reverts the design exactly.
#
# Colours are plain hex so the CMS can offer a colour picker. `light` is the
# default palette; `dark` is applied when the visitor's OS prefers dark mode.
# Edit both — a token changed in only one of them will drift.

light:
  bg: "#ffffff"
  bgRaised: "#fbfbfa"
  bgSunken: "#f4f4f2"
  ink: "#0a0a0a"
  inkSoft: "#3d3d3b"
  inkMuted: "#6e6e6b"
  inkFaint: "#a3a3a0"
  line: "#e6e6e3"
  lineStrong: "#d4d4d0"
  accent: "#111111"
  accentSoft: "#ededeb"
  accentInk: "#000000"

# The site is always white. `dark` mirrors `light` on purpose (artist's
# choice, 2026-09-28) so a visitor whose OS is in dark mode still sees the
# light palette. Keep the two blocks identical.
dark:
  bg: "#ffffff"
  bgRaised: "#fbfbfa"
  bgSunken: "#f4f4f2"
  ink: "#0a0a0a"
  inkSoft: "#3d3d3b"
  inkMuted: "#6e6e6b"
  inkFaint: "#a3a3a0"
  line: "#e6e6e3"
  lineStrong: "#d4d4d0"
  accent: "#111111"
  accentSoft: "#ededeb"
  accentInk: "#000000"

# fontDisplay / fontBody are dropdowns in the CMS. The stored value IS the CSS
# font-family stack, so there is no name-to-stack lookup to drift out of sync.
# Only stacks that resolve on a real machine are offered — the previous
# `Fraunces` and `Söhne` entries never loaded, because no @font-face existed.
type:
  fontDisplay: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
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
