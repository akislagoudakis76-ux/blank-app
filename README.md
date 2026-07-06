# ◈ AZURA — Luxury Yacht Charters

A 3D, single-page website for a luxury yacht company, designed with a
professional graphic + UX language: a **shiny animated ocean** rendered in
Three.js, restrained gold-on-navy luxury styling, glassmorphism, and
vibrant full-bleed yacht photography.

## Design language

- **Palette** — deep ocean navy (`#05141f`) + champagne gold (`#d8b26a`),
  with a cyan sea-glow accent for the 3D highlights.
- **Type** — *Cormorant Garamond* (display serif) paired with *Manrope*
  (interface sans).
- **Minimal shine** — a single sweeping gloss on primary buttons and fleet
  cards, a gold→cyan scroll-progress bar, a cursor-follow light, and
  specular reflections on the 3D water. Restraint over sparkle.
- **Motion** — reveal-on-scroll, 3D pointer-tilt on the fleet cards, and
  parallax on the hero camera. All motion respects
  `prefers-reduced-motion`.

## The 3D hero

`assets/js/scene.js` builds an animated, glossy ocean:

- a displaced plane driven by layered sine waves (live vertex normals),
- a metallic `MeshStandardMaterial` lit by a **champagne** key light and a
  wandering **sea-cyan** point light for living reflections,
- drifting golden light motes and pointer-based camera parallax.

It degrades gracefully to a painterly gradient if WebGL/Three.js is
unavailable or the visitor prefers reduced motion.

## Sections

Hero · The AZURA standard · Signature fleet (3D tilt cards) ·
On-board experience gallery · Bespoke charter services · Enquiry form.

## Run it

No build step — it's a static site. Serve the folder and open it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

> Fonts, Three.js, and photography load from public CDNs / Unsplash, so an
> internet connection is needed to see the full experience.

## Structure

```
index.html              markup + section content
assets/css/styles.css   design system, layout, responsive, motion
assets/js/scene.js      Three.js animated ocean (with fallback)
assets/js/main.js       nav, reveals, tilt, cursor, form
```
