# Recent UI and Animation Changes

This note records the changes made during the recent pass through the interface. The source has since been reverted, but the list below documents the intended behavior changes for reference.

## Time and mode controls

- Reworked the macro view time/day strip to match the stacked control layout used in micro and meso views.
- Restored the 12h / 24h time toggle so the clock format persists across mode changes through shared state and local storage.
- Centered the clock label within its fixed slot so the time readout does not drift when the format changes.
- Set the day/time metadata text to pure white for stronger contrast.
- Added sliding indicator animations to the model mode buttons and the speed control buttons, including the macro panel.

## Building and agent animation

- Spread the building reveal timing more evenly across the generation sequence, but only after each building's zoning animation has completed.
- Kept the agent sprites billboarded in micro and meso while making them more perspective-aware, so they show less torso as the camera tilts toward a bird's-eye view.
- Left macro agent presentation distinct from the micro/meso sprite behavior.

## Notes

- The current workspace state has the source edits reverted.
- The latest dev preview build was regenerated from the reverted state and is available under `preview/dev/`.