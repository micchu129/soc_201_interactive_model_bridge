# Chat Session Change Log

This document summarizes the changes attempted in this chat session. Some source edits were later reverted at the user's request, so this file records the full set of changes discussed and applied during the session, not only the final reverted state.

## Time and control UI

- Reworked the macro-view time/day block so it matched the stacked time-control layout used in micro and meso views.
- Restored the 12h / 24h clock toggle and made it persist across views through shared state and local storage.
- Centered the clock readout in its fixed slot so the label stays visually aligned in both 12h and 24h formats.
- Changed the day/time metadata text to pure white for stronger contrast.
- Added sliding indicator animations to the mode switcher and speed controls, including the macro panel.

## Tutorial flow

- Fixed the x128 tutorial step so the button is clickable during the tutorial prompt.
- Fixed the restore countdown so it no longer gets stuck at 3 when the x128 demo runs.
- Added a ref-backed watcher so the restore countdown waits for the target simulation time before starting.
- Documented the tutorial sequence changes in the workspace notes.

## Building and agent animation

- Adjusted building reveal timing so variation is spread more evenly across the generation sequence.
- Kept the building animation separate from zoning so the building height reveal does not start too early.
- Experimented with a perspective-aware agent billboard treatment in micro and meso.
- Reverted the agent billboard experiment after it introduced unwanted side effects.

## Session notes

- A separate markdown note was created at [docs/RECENT_UI_AND_ANIMATION_CHANGES.md](RECENT_UI_AND_ANIMATION_CHANGES.md).
- The workspace was rebuilt multiple times during the session to refresh the dev preview bundle.
- The current source tree may not contain every attempted change because some edits were intentionally reverted.
