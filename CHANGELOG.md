# Changelog

This file records tagged SimARC Model Bridge releases. It focuses on shipped behavior rather than every development commit or reverted experiment.

The project follows semantic-version-style prerelease numbering. For example, `v0.3.0-beta.4` is the fourth beta milestone toward the eventual `v0.3.0` exploratory-model release.

## Unreleased

### Added

- Added Agent Directory sorting, stage filtering, visible-result counts, and an empty-results state.

### Changed

- Redesigned Agent Directory rows around readable agent cards, selectable names, primary Details actions, and larger controls.
- Replaced separate Find and Highlight actions with Locate, which selects, highlights, and moves the camera while keeping the directory open.
- Updated the tutorial to open agent details from the directory and then close the visible detail panel.

## v0.3.0-beta.7 - 2026-06-12

### Added

- Expanded the guided tutorial to 32 progressive Micro, Meso, and Macro steps.
- Added verified camera practice, separate Agent Directory steps, completion feedback, Previous/Next navigation, and persistent Auto-advance.
- Added guided two-day demonstration progress and snapshot-restoration messaging.
- Added explicit review completion for Macro explanations and four focused Settings explanation steps.

### Changed

- Rewrote tutorial copy around exact Beta.6 interface labels and stronger model-validity framing.
- Made Settings toggle reliably and kept Help open for the final tutorial-complete step.
- Made Play completion respond promptly after the simulation loop starts and slowed restoration messages for readability.

## v0.3.0-beta.6 - 2026-06-12

### Added

- Added Compact, Default, and Large interface-size preferences with independent local and `/dev/` preview storage.
- Added shared responsive typography, control, spacing, padding, and panel-radius tokens.
- Added bounded compact-laptop, standard-desktop, and large-desktop layout foundations.

### Changed

- Replaced global percentage-based UI scaling with a stable 16px root font size and component-level responsive sizing.
- Refined the stacked time controls, camera presets, mode navigation, detail/tutorial/settings/help panels, initialization controls, Agent Directory, and Macro console to preserve usable canvas space.
- Migrated saved `ui-scale-v5` preferences to Compact, Default, or Large.
- Removed Zoom and follow from individual detail panels and allowed building inspection throughout the tutorial.

## v0.3.0-beta.5 - 2026-06-11

### Changed

- Made billboarded walking-agent torsos smoothly compress with camera elevation, from full-person street views to head-only Top view, while leaving heads, occupancy towers, Macro dots, and selection highlights unchanged.

## v0.3.0-beta.4 - 2026-06-11

### Added

- Live remaining-time status for the tutorial's two-day 128x demonstration.
- Complete Beta.4 tutorial implementation reference.
- Project-specific repository README and updated Beta.4 wireframes.

### Fixed

- Fixed the tutorial restoration trigger so reaching the two-day target reliably starts restoration.
- Fixed the restoration countdown being cancelled and stuck at `3`.
- Reset simulation boundary tracking after snapshot restoration and simulation restart so Policy Lab history continues sampling.
- Restricted building selection to the tutorial steps that explicitly request it.
- Removed the hidden UI-scale multiplier so displayed scale values match their applied size.
- Migrated existing Beta.3 scale preferences while restoring the previous default value to a true 100%.

### Documentation

- Removed superseded session notes that described attempted or reverted work.
- Promoted Beta.4 to the production GitHub Pages site.

## v0.3.0-beta.3 - 2026-06-11

### Added

- Expanded the guided tutorial to 24 action-driven steps across Micro, Meso, Macro, Settings, and Help.
- Persisted tutorial progress, actions, selections, demonstration snapshot, and target across refreshes.
- Added a user-started two-day 128x demonstration and restoration countdown.
- Added draggable tutorial/detail panels and three-height mobile bottom sheets.
- Added confirmation before skipping the tutorial.
- Added sliding indicators for mode and playback controls.
- Added stacked date and playback controls with persistent 12-hour/24-hour clock preference.
- Added labeled Meso Network, Social, Locations, and building Users hubs.
- Added Agent Directory tutorial coverage.
- Added 24-hour, 7-day, and 30-day Policy Lab history timescales.

### Changed

- Restored billboard-circle occupancy towers in Micro and Meso.
- Added compact rooftop occupancy dots in Macro.
- Improved generation reveal timing and separated zoning from building-height animation.
- Updated desktop/mobile structural wireframes.

### Known Issues At Release

- The two-day restoration sequence could fail to start or become stuck at `3`.
- Restoring the tutorial snapshot could stop later Policy Lab history samples.
- Building selection could remain available outside its intended tutorial steps.
- UI scale displayed a value that did not match the hidden applied baseline.

## v0.3.0-beta.2 - 2026-06-11

### Added

- Expanded guided tutorial with action requirements covering camera controls, selection, playback, Meso, Macro, Settings, and Help.
- Added Micro/Meso occupancy indicators and richer network presentation.
- Added Policy Lab history tabs and seven-stage history chart.
- Added explicit documentation of the Bridge's creative alterations from the source model.

### Changed

- Refined building and agent detail panels.
- Improved simulation clock, history sampling, and policy presentation.
- Updated model-status and wireframe documentation.

## v0.3.0-beta.1 - 2026-06-09

### Added

- Introduced the guided tutorial development preview.
- Added dedicated `/dev/` GitHub Pages deployment workflow.
- Expanded Meso network presentation and relationship visibility.

### Changed

- Increased network-edge visibility.
- Refined agent motion, detail panels, tutorial presentation, and model history behavior.

## v0.2.0-beta.3 - 2026-06-09

### Fixed

- Restored responsive UI scaling after the initial production-beta deployment.

### Deployment

- Stabilized the production GitHub Pages workflow and Node 24 build environment.

## v0.2.0-beta.2 - 2026-06-09

### Added

- First production-ready persistent 3D simulation milestone.
- Expanded continuous agent movement, camera views, tutorial behavior, and Policy Lab presentation.

### Changed

- Refined simulation rules, time handling, outcomes, and city interaction.

## v0.2.0-beta.1 - 2026-06-08

### Added

- Rebuilt the project as the persistent SimARC 3D Model Bridge.
- Added generated Three.js city, simulation engine, agents, venues, policies, and validation rules.
- Added Micro, Meso, and Macro interface foundations.
- Added selectable agent/building details, advanced options, Settings, and Policy Lab.
- Added model implementation, parameter, and asset-customization documentation.

## v0.1.0-alpha.2 - 2026-06-08

### Added

- Expanded the original scroll-driven prototype with building sprites, progression arrows, scene navigation, and an early Policy Lab.

## v0.1.0-alpha.1 - 2026-06-08

### Added

- Initial scroll-driven SimARC interface prototype.
