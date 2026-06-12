# SimARC UI Wireframes

Import `SIMARC_MAIN_STAGES.svg` directly into Figma using **File > Place image** or by dragging it onto the canvas.

The SVG contains eight labeled, editable vector groups:

- Hero
- World Generation
- Population
- Micro
- Meso
- Macro
- Tutorial Two-Day Demo
- Restore and Settings

These are structural wireframes rather than pixel-matched screenshots. They are intended for drawing UI revisions before those revisions are implemented.

Updated for `v0.3.0-beta.6`: responsive desktop/laptop foundations, Compact/Default/Large interface sizes, bounded overlays, and a stable 16px root font size.

True-scale reference canvases:

- `SIMARC_DESKTOP_1440x900.svg`: two stacked 1440x900 canvases showing the current desktop Micro tutorial and Macro/Settings layouts.
- `SIMARC_MOBILE_390x844.svg`: two side-by-side 390x844 canvases showing the current tutorial bottom sheet and restoration overlay.

Responsive sizing calibration:

- `SIMARC_RESPONSIVE_SIZING_CALIBRATION 1.svg`: implemented `v0.3.0-beta.6` desktop/laptop sizing foundations. It compares Micro/tutorial and Macro/Settings layouts at 1024x768, 1440x900, and 1920x1080, then shows Compact, Default, and Large component-density steps.

Tutorial-specific interaction rules are documented in `../TUTORIAL_IMPLEMENTATION_BETA7.md`. Buildings are selectable throughout the tutorial, speed controls are restricted to the requested tutorial action, and restoration resets the simulation and graph-history boundary trackers to the saved snapshot.

## Beta.7 Wireframe Inventory

- Desktop Micro: brand/settings header, stacked date and playback controls, Agent Directory, billboard-circle occupancy towers, camera presets, tutorial step 12 status, mode navigation, and Help.
- Desktop Macro: stacked time controls, four policy levers, Apply Policy, outcome cards, 24-hour/7-day/30-day tabs, history graph, compact rooftop indicators, and Settings with interface-size preferences.
- Mobile: three-height tutorial bottom sheet and the full-screen restoration countdown.
- Main stages: Hero, generation, population, Micro, Meso, Macro, tutorial demonstration, restoration, and Settings.
