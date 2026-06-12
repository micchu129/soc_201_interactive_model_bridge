# Tutorial Implementation Reference: v0.3.0-beta.8

Beta.8 maintains the 32-step guided walkthrough across Micro, Meso, and Macro.
It frames SimARC Bridge as an exploratory policy-conversation interface, not a
prediction or forecasting tool.

## Global Behavior

- Steps use stable IDs. Older Beta.4, Beta.6, and earlier Beta.7 saved sessions
  migrate to the closest matching step.
- Completed actions show a checkmark and completed action styling.
- Auto-advance is enabled by default, stored separately for local and `/dev/`
  namespaces, and displays a three-second countdown.
- Previous is available through the final step and is review-only: it does not
  undo completed actions or model state.
- Next remains available after completion. Skip requires confirmation and is
  hidden on the final step.
- Macro review and Settings explanation steps require the user to select
  **Mark reviewed** before Next or Auto-advance can continue.

## Exact Sequence

| # | Stable ID | Title | Completion |
|---|---|---|---|
| 1 | `orbit` | Orbit the city | Meaningful accumulated orbit reaches the practice threshold |
| 2 | `pan-move` | Pan and move | Meaningful pan or WASD movement |
| 3 | `zoom` | Zoom the city view | Scroll, trackpad, or mobile pinch zoom |
| 4 | `camera-presets` | Use camera presets | Select Default, Street, or Top |
| 5 | `move-tutorial` | Move the tutorial panel | Move the desktop panel or mobile sheet |
| 6 | `select-building` | Select a building | Select a building |
| 7 | `building-details` | Read and close building details | Close the building panel |
| 8 | `select-agent` | Select an agent | Select an agent |
| 9 | `agent-details` | Read and close agent details | Close the agent panel |
| 10 | `directory-open` | Open the Agent Directory | Open Agent Directory |
| 11 | `directory-select` | Open an agent from the Agent Directory | Select an agent name or Details |
| 12 | `directory-details-close` | Close the agent details | Close the visible agent detail panel |
| 13 | `play` | Play the simulation | Simulation loop remains running for 300ms |
| 14 | `pause` | Pause the simulation | Pause verified playback |
| 15 | `speed-demo` | Run two simulated days at 128x | Complete exact snapshot restoration |
| 16-22 | Meso steps | Inspect relationship and building-user networks | Requested Meso actions |
| 23 | `macro-outcomes` | Review controls and outcomes | Mark reviewed |
| 24 | `macro-graphs` | Review graphs and timescales | Mark reviewed |
| 25 | `policy` | Apply a policy | Apply policy |
| 26 | `settings-open` | Open Settings | Open Settings |
| 27 | `settings-size` | Review Interface size | Mark reviewed |
| 28 | `settings-tutorial-restart` | Review tutorial and simulation restart | Mark reviewed |
| 29 | `settings-regenerate-reset` | Review regeneration and reset | Mark reviewed |
| 30 | `settings-about` | Review About this beta | Mark reviewed |
| 31 | `help` | Open Help | Open Camera controls |
| 32 | `complete` | Tutorial complete | Finish tutorial |

The complete narrative, instructions, disclaimers, and action wording are
defined in `src/config/tutorialSteps.js`.

## Playback And Restoration

- Pressing Play primes the first simulated minute so the clock and movement
  respond immediately. The tutorial confirms Play after the simulation loop
  remains running for 300 milliseconds.
- The 128x demonstration runs exactly 2,880 simulated minutes.
- The restoration overlay displays each phase for 2.2 seconds:
  `Restoring your saved snapshot…`, `Rewinding the temporary demonstration…`,
  then `Snapshot restored.`
- The simulation and relevant UI/camera snapshot are restored only after the
  readable restoration sequence completes.
- The simulation accumulator and decision-boundary tracker reset to the saved
  time so policy history continues sampling correctly.

## Exact Interface Labels

- Building Details: `Purpose`, `Capacity`, `Occupants`, `Status`, `Who lives
  here`, `Current occupants`, `Present`, and `Away`.
- Agent Details: `Activity`, `Stage`, `BAC`, `Health`, `Cash`, `Location`, and
  `Neurotransmitters`.
- Agent Directory: `Search agents…`, `Sort by`, `Stage`, `Details`, `Locate`,
  and `Follow`.
- Views: `Default`, `Street`, `Top`, and disabled `Custom`.
- Settings: `Interface size`, `Compact`, `Default`, `Large`, `Start guided
  tutorial`, `Restart simulation`, `Regenerate population`, `Reset everything`,
  and `About this beta`.
- Help opens `Camera controls` and includes `Restore mode tips`.

## Earlier-Beta Incoherences

- Earlier wording used `UI scale`; Beta.6 replaced it with `Interface size`.
- Earlier wording called the visible agent field `alcohol stage`; the panel
  label is `Stage`, representing a simplified alcohol stage.
- Earlier building copy implied a visible `Residents` field. Homes instead use
  `Who lives here`, while `Occupants` reports current occupancy.
- The Beta.4 sequence contained 24 steps. The first Beta.7 implementation used
  28; playtesting expanded it to 32 by separating Zoom and adding focused
  Settings explanations.
- Earlier review steps appeared completed without user input. Beta.7 now uses
  explicit **Mark reviewed** actions.
- Beta.4 used a fast numeric restoration countdown. Beta.7 uses three readable,
  explanatory restoration phases.
- Beta.7 attempted to keep the Agent Directory open after selecting Details,
  which prevented the detail panel from rendering. Beta.8 closes the directory
  when a name or Details is selected, then asks the user to close the visible
  detail panel.
