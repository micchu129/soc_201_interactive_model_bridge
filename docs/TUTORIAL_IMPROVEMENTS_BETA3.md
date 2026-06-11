# Beta.3 Tutorial Improvements

## Beta.2 Status

Beta.2 introduced an action-driven tutorial, but camera practice was compressed, refresh lost progress, skip was immediate, and the accelerated demonstration began automatically at 64x.

## Beta.3 Sequence

- Persist step, completed actions, selection, unlocks, and the demonstration snapshot.
- Practice orbit, pan, zoom, WASD, and camera presets.
- Explain and require closing both building and agent panels.
- Introduce the Agent Directory.
- Introduce the Meso Network, Social, Locations, and building Users nodes.
- Explain Macro controls, outcomes, graphs, timescales, Settings, and Help.
- Require the user to start the two-day 128x demonstration.
- Show a countdown/crossfade before restoring the exact snapshot.
- Confirm before skipping.

## Known Issues And Acceptance Criteria

- Tutorial actions must remain recoverable after refresh.
- Selection stays locked until introduced; skipping unlocks all interactions.
- Automatic transitions wait approximately 850ms.
- The 128x demonstration must restore the exact saved state.
- Desktop tutorial panels drag by the full header; mobile uses three sheet positions.

## Separate-LLM Polishing Prompt

Review the SimARC Bridge tutorial copy for concise, non-technical language. Preserve every action requirement and model-validity disclaimer. Identify unclear transitions, repeated explanations, and steps that ask the user to perform an action before the relevant control is visible. Return revised copy only; do not propose model-behavior changes.
