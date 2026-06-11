# Tutorial Implementation Reference: v0.3.0-beta.4

This document records the tutorial behavior implemented in the source code. It describes the exact sequence, displayed copy, required user action, transition behavior, persistence, interaction locks, and the inferred purpose of each step.

## Entry And Global Behavior

- The tutorial starts automatically after population generation when **Tutorial after generation** is checked.
- Population generation ends in Micro mode at Day 1, 06:00, with playback paused.
- The tutorial can also be restarted from **Settings > Start guided tutorial**.
- The panel header displays `Model tutorial · [step] / 24 · [mode]`.
- Automatic steps advance about 850 milliseconds after their required action is recorded.
- Manual review steps display an enabled **Next** button immediately.
- **Skip tutorial** requires a second **Confirm skip** action.
- Skipping or completing the tutorial unlocks normal agent and building selection and resumes playback at 1x.
- Tutorial step, completed actions, selected agent/building, demonstration snapshot, and demonstration target persist in browser local storage.
- Local builds and `/dev/` previews deliberately use separate local-storage namespaces.
- The tutorial panel can be dragged by its header on desktop. On mobile, dragging moves it among three bottom-sheet heights.

## Exact Sequence

| # | Mode | Title | Body text | Action text | Waits for / transition | Purpose |
|---|---|---|---|---|---|---|
| 1 | Micro | Orbit the city | Left-drag to orbit around the model. | Orbit the camera to continue. | Any manual camera movement; auto-advances. | Introduces direct 3D camera control. |
| 2 | Micro | Pan and zoom | Right-drag to pan and use the wheel or trackpad to zoom. | Practice panning and zooming, then continue. | User presses **Next**. | Gives unverified practice time for the remaining manual camera controls. |
| 3 | Micro | Use movement and presets | WASD moves through the city. Default, Street, and Top provide repeatable views. | Choose a camera preset. | User chooses Default, Street, or Top; auto-advances. | Introduces repeatable camera positions and mentions keyboard movement. |
| 4 | Micro | Move this panel | Drag the full header on desktop. On mobile, pull the bottom sheet between its three positions. | Move this panel. | User drags the tutorial panel; auto-advances. | Prevents the tutorial panel from obscuring later targets. |
| 5 | Micro | Select a building | Buildings explain purpose, capacity, residents, and current occupancy. | Select a building. | User selects a building; auto-advances. | Introduces building inspection. |
| 6 | Micro | Read and close building details | Homes distinguish residents from people currently present. Other places list current users. | Close the building panel. | User closes the building details panel; auto-advances. | Explains building-panel semantics and clearing a selection. |
| 7 | Micro | Select an agent | Choose a person on the street or a colored billboard circle in an occupancy tower. | Select an agent. | User selects an agent; auto-advances. | Introduces individual inspection and occupancy-tower circles. |
| 8 | Micro | Read and close agent details | The panel explains activity, alcohol stage, health, cash, location, BAC, and simplified neurotransmitters. | Close the agent panel. | User closes the agent details panel; auto-advances. | Explains the individual-level information available. |
| 9 | Micro | Use the Agent Directory | The directory finds, highlights, follows, and opens details for any generated person. | Open the Agent Directory. | User opens Agent Directory; auto-advances. | Introduces lookup tools for agents that are difficult to select visually. |
| 10 | Micro | Play and pause | Playback advances continuously between two-hour decision boundaries. | Press Play. | User presses 1x Play; auto-advances. | Distinguishes continuous presentation from two-hour model decisions. |
| 11 | Micro | Pause playback | Pause whenever you want to inspect a stable moment. | Pause playback. | User presses Pause; auto-advances. | Establishes stable inspection workflow before the accelerated demo. |
| 12 | Micro | Two days at 128× | Press 128× to run two live days from the Default camera. The display will count back before restoring this exact snapshot. | Press 128× and watch the restoration. | User presses 128×; simulation runs exactly 2,880 simulated minutes; restoration completes; auto-advances. | Demonstrates visible day/night and agent activity without permanently changing the tutorial state. |
| 13 | Micro | Switch to Meso | Meso reveals social and location relationships. | Switch to Meso. | User selects Meso; auto-advances. | Introduces the network-level view. |
| 14 | Meso | Select an agent network | Select an agent or tower circle to create its labeled Network hub. | Select an agent. | User selects an agent in Meso; auto-advances. | Creates the agent-centered network visualization. |
| 15 | Meso | Split the network hub | Select Network to reveal Social and Locations categories. | Select the Network hub. | User selects the Network hub; auto-advances. | Introduces network category controls. |
| 16 | Meso | Inspect Social | Social highlights relationship edges and the matching detail-panel section. | Select Social. | User selects Social; auto-advances. | Connects social edges to their detail-panel explanation. |
| 17 | Meso | Inspect Locations | Locations highlights home, workplace, gathering, and current-place links. | Select Locations. | User selects Locations; auto-advances. | Explains the physical-location portion of an agent network. |
| 18 | Meso | Building users | Selecting a building creates one Users node. Building networks do not split. | Select a building. | User selects a building in Meso; auto-advances. | Contrasts building-user networks with split agent networks. |
| 19 | Meso | Switch to Macro | Macro shifts from individual relationships to aggregate outcomes and policy levers. | Switch to Macro. | User selects Macro; auto-advances. | Moves from individual/network inspection to aggregate policy exploration. |
| 20 | Macro | Review controls and outcomes | Macro combines policy controls with rolling outcomes and structured history. | Review the controls and outcomes, then continue. | User presses **Next**. | Gives time to orient to the policy lab. |
| 21 | Macro | Review graphs and timescales | Charts show two-hour samples across 24-hour, 7-day, and 30-day windows. | Review graph timescales, then continue. | User presses **Next**. | Explains chart sampling and available history windows. |
| 22 | Macro | Apply a policy | Applied policy changes enter the simulation at the next two-hour decision boundary. | Apply a policy. | User presses **Apply policy**; auto-advances. | Explains delayed policy application at a model decision boundary. |
| 23 | Macro | Open settings | Settings contains UI scale, restart controls, version information, and the model-interface disclaimer. | Open settings. | User opens Settings; Settings closes automatically after about 850 ms; auto-advances. | Introduces persistent display controls and reset/version information. |
| 24 | Macro | Finish with help | Help summarizes camera controls and the purpose of Micro, Meso, and Macro. | Open Help to finish. | User opens Help; tutorial finishes after about 850 ms. | Leaves the user with a permanent reference for navigation and model layers. |

## Two-Day Demonstration And Restoration

1. At step 12, only the 128× speed button is enabled.
2. Pressing 128× saves an exact paused snapshot, records a target exactly 2,880 simulated minutes later, resets the camera to Default, and starts playback.
3. The tutorial panel displays **Two-day demonstration running** and a rounded days/hours-remaining value.
4. On reaching the target, playback pauses and a full-screen **Restoring snapshot** overlay counts `3`, `2`, `1`, `0`.
5. The exact saved state is restored with playback paused.
6. The decision-boundary tracker and simulation accumulator are reset to the restored time. This is required so policy history and graphs continue sampling after the rewind.
7. The tutorial advances to step 13 after restoration completes.

## Interaction Locks

- During the tutorial, speed buttons are disabled except for the specifically requested Play, Pause, or 128× action.
- Buildings can only be selected during step 5 (**Select a building**) and step 18 (**Building users**).
- Agents are initially locked until step 7 introduces selection. After that first agent selection, agent interactions remain available for the directory and Meso exercises.
- Normal building and agent selection is fully available after tutorial completion or confirmed skip.

## Policy Graph Behavior

- History samples are created at two-hour decision boundaries.
- Tabs filter the visible samples to the last 24 hours, 7 days, or 30 days.
- The consumption graph plots per-resident interval consumption.
- The stage graph plots the number of agents in each of seven alcohol stages.
- The two-day tutorial demonstration intentionally restores the pre-demo history as part of the exact snapshot. New samples continue from that restored time after playback resumes.

## UI Scale Behavior

- UI scale is stored per browser origin/path namespace. The local build uses keys such as `simarc-ui-scale-v5`; the `/dev/` preview uses `simarc-dev-ui-scale-v5`. A value saved in one does not affect the other.
- In Beta.3, the slider displayed `100%` while the implementation applied a hidden `0.75` multiplier, so `100%` was actually rendered at 75%.
- Beta.4 removes the hidden multiplier: `100%` now applies a scale of `1`.
- The Beta.3 default stored value of `1` migrates to a true `100%`, fixing builds that appeared too small without an explicit user preference.
- Other customized Beta.3 `ui-scale-v4` values are migrated by multiplying them by `0.75`, preserving their previous visual size while making the displayed percentage accurate.
- A browser namespace with no saved value now starts at a true `100%`.
