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

Updated for `v0.3.0-beta.4`: bottom mode navigation, billboard-circle towers in Micro/Meso, circular Macro corner indicators, stacked date/playback controls, Agent Directory access, labeled Meso Network/Social/Locations/Users hubs, draggable panels/mobile sheets, the 24-step tutorial, the two-day demonstration status, the restoration countdown, Macro history graphs/timescales, and accurate 100% UI scale in Settings.

True-scale reference canvases:

- `SIMARC_DESKTOP_1440x900.svg`: two stacked 1440x900 canvases showing the current desktop Micro tutorial and Macro/Settings layouts.
- `SIMARC_MOBILE_390x844.svg`: two side-by-side 390x844 canvases showing the current tutorial bottom sheet and restoration overlay.

Tutorial-specific interaction rules are documented in `../TUTORIAL_IMPLEMENTATION_BETA4.md`. In particular, buildings are selectable only during tutorial steps 5 and 18, speed controls are restricted to the requested tutorial action, and restoration resets the simulation and graph-history boundary trackers to the saved snapshot.

## Beta.4 Wireframe Inventory

- Desktop Micro: brand/settings header, stacked date and playback controls, Agent Directory, billboard-circle occupancy towers, camera presets, tutorial step 12 status, mode navigation, and Help.
- Desktop Macro: stacked time controls, four policy levers, Apply Policy, outcome cards, 24-hour/7-day/30-day tabs, history graph, compact rooftop indicators, and Settings with true 100% UI scale.
- Mobile: three-height tutorial bottom sheet and the full-screen restoration countdown.
- Main stages: Hero, generation, population, Micro, Meso, Macro, tutorial demonstration, restoration, and Settings.
