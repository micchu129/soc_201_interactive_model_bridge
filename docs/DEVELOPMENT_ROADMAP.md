# SimARC Model Bridge Development Roadmap

Updated: 12 June 2026

## Project Direction

The SimARC Model Bridge is an exploratory, policy-facing translation of selected
SimARC concepts. It is not currently a faithful browser port, validated policy
engine, or numerically equivalent replacement for the NetLogo model.

Development is divided into two major milestones:

- `v0.3.0`: a coherent and polished exploratory model bridge.
- `v0.4.0`: a reproducible experiment and policy-comparison workflow.

Each beta should remain focused on one primary feature area. Runtime behavior
changes should not be mixed with broad interface refactors unless required.

## Current State

### Released

- `v0.3.0-beta.4`
  - Promoted the substantially improved Model Bridge to production.
  - Fixed tutorial restoration, graph-history restoration, building-selection
    locks, and UI-scale inconsistencies.
  - Added complete tutorial documentation and updated structural wireframes.

- `v0.3.0-beta.5`
  - Added perspective-aware billboard agent sprites.
  - Walking-agent torsos compress as the camera approaches a bird's-eye view.
  - Heads, occupancy towers, Macro dots, and selection indicators remain
    billboarded and readable.

### Current Development Work

- `v0.3.0-beta.6` responsive UI foundations are released.
- `v0.3.0-beta.7` tutorial and explanation refinement is released.
- `v0.3.0-beta.8` Agent Directory redesign is in progress.
- Beta.7 expanded the guided sequence to 32 steps and aligned its wording with
  the executable Beta.6 interface.

## Roadmap Toward v0.3.0

### v0.3.0-beta.6: Responsive UI Foundations

**Status:** Released.

**Goal:** Make the existing interface consistently usable across common laptop
and desktop displays without redesigning individual tools.

Planned work:

- Replace global percentage-based scaling with stable shared sizing tokens.
- Replace the UI-scale percentage slider with:
  - Compact;
  - Default;
  - Large.
- Migrate existing saved UI-scale preferences to the nearest new size.
- Establish consistent typography, control heights, padding, gaps, and radii.
- Correct oversized, undersized, and collision-prone controls.
- Improve layouts for the time controls, speed controls, camera presets,
  directory launch button, mode navigation, panels, and Macro console.
- Preserve the current mobile behavior; this beta is not a full mobile
  redesign.

Acceptance criteria:

- Core controls remain readable and reachable at supported desktop and laptop
  resolutions.
- Layout quality no longer depends on the developer's browser-saved UI scale.
- Compact, Default, and Large remain coherent rather than scaling every element
  indiscriminately.
- Simulation and tutorial behavior remain unchanged.

### v0.3.0-beta.7: Tutorial and Explanation Refinement

**Status:** Released.

**Priority change:** Tutorial refinement has been moved ahead of the Agent
Directory and Policy Lab redesigns.

**Goal:** Ensure the guided sequence accurately explains the implemented model,
its controls, and its limitations before polishing the specialist tools.

Planned work:

- Review and implement the complete 32-step sequence for clarity, pacing, and
  verified progression.
- Confirm every required action, lock, auto-advance, and manual continuation.
- Refine the two-day accelerated demonstration and restoration explanation.
- Improve transitions between Micro, Meso, and Macro.
- Clearly distinguish:
  - functional model mechanisms;
  - visual explanation devices;
  - simplified or illustrative outputs.
- Add or improve concise assumption and limitation explanations.
- Ensure tutorial text matches the current interface after Beta.6 resizing.
- Review tutorial behavior on laptop, desktop, and existing mobile layouts.
- Update the tutorial implementation reference and wireframes.

Acceptance criteria:

- A first-time user can complete the tutorial without becoming stuck.
- Tutorial text does not overstate model fidelity or policy validity.
- Users understand the purpose of Micro, Meso, Macro, agent details, network
  views, policies, outcomes, and history charts.
- Tutorial locks do not block unrelated behavior after completion or skipping.

### v0.3.0-beta.8: Agent Directory Redesign

**Status:** In progress.

**Goal:** Turn the current action-heavy list into a readable population browser
for inspecting and locating agents.

Planned work:

- Make agent details the primary action.
- Improve row readability and information hierarchy.
- Add useful sorting and filtering where justified.
- Group secondary actions such as Find, Follow, and Highlight.
- Ensure the directory fits supported resolutions without excessive crowding.
- Maintain compatibility with Micro/Meso selection and tutorial behavior.

Acceptance criteria:

- Users can efficiently browse, search, inspect, and locate agents.
- The interface remains usable with the supported population-size range.
- Directory actions have clear and distinct meanings.

### v0.3.0-beta.9: Policy Lab Refinement

**Status:** Planned but not implemented.

**Goal:** Make the current illustrative policy interface and model outputs more
coherent, legible, and appropriately qualified.

Planned work:

- Improve policy-control labels and explanations.
- Clarify that policies apply at the next two-hour decision boundary.
- Improve outcome-card hierarchy and chart readability.
- Review 24-hour, 7-day, and 30-day graph behavior.
- Add clearer assumptions, limitations, and interpretation guidance.
- Confirm history graphs remain correct after restart, restoration, and policy
  application.
- Preserve the current four policy controls unless a separately scoped model
  change is approved.

Acceptance criteria:

- Users can explain what each policy control changes in the simplified model.
- Charts and outcome values remain functional after all reset/restoration paths.
- The interface does not imply validated causal predictions.

### v0.3.0 Stable: Exploratory Model Bridge

**Status:** Planned.

Stable-release requirements:

- Responsive desktop/laptop interface is coherent.
- Tutorial is reliable and accurately describes the model.
- Agent Directory and Policy Lab are usable and internally consistent.
- Known high-impact interaction and graphing defects are resolved.
- Documentation, wireframes, version labels, and changelog match executable
  behavior.
- The application is explicitly framed as an exploratory model-to-tool
  translation.

Not required for `v0.3.0`:

- Seeded reproducibility.
- Experiment plans.
- Import/export workflows.
- Full SimARC mechanism fidelity.
- Full mobile optimization.

## Roadmap Toward v0.4.0

### Seeded Generation and Reproducible Simulation

**Status:** Planned but not implemented.

Planned work:

- Introduce an explicit user-visible seed.
- Replace simulation-critical `Math.random()` calls with a seeded generator.
- Ensure identical configurations and seeds reproduce the same population and
  trajectory.
- Define which presentation animations may remain non-deterministic.
- Add reproducibility verification.

### Configuration, Policy, and Run Import/Export

**Status:** Planned but not implemented.

Planned work:

- Download and upload world-generation settings.
- Download and upload population-generation settings.
- Download and upload policy configurations.
- Export relevant run metadata, seed, assumptions, and outputs.
- Validate imported files and handle incompatible versions safely.

### Experiment Plans

**Status:** Planned but not implemented.

Planned work:

- Define experiment plans containing configurations, policies, seeds, and run
  requirements.
- Support repeated or comparable runs.
- Preserve sufficient metadata to reproduce an experiment.
- Distinguish exploratory single runs from structured experiments.

### Experiment-Oriented Policy Lab

**Status:** Planned but not implemented.

Planned work:

- Add explicit baseline-versus-scenario comparison.
- Compare policies without silently replacing the active reference state.
- Present repeated-run variation and uncertainty where feasible.
- Avoid unsupported cost, equity, or causal claims unless the underlying model
  and evidence are added.

### Mobile Optimization

**Status:** Deferred and lower priority.

The current responsive/mobile behavior should remain functional, but a
purpose-built mobile redesign follows the core desktop exploratory and
experiment workflows.

### v0.4.0 Stable: Reproducible Experiment Workflow

**Status:** Planned.

Stable-release requirements:

- Seeded reproducibility works and is documented.
- Configurations and policies can be safely imported and exported.
- Experiment plans can be created and reproduced.
- Policy comparison distinguishes baseline, scenario, and uncertainty.
- The interface clearly separates exploratory presentation from experimental
  evidence.

## Model-Fidelity Roadmap

These items improve fidelity to SimARC but are not automatically required for
either `v0.3.0` or `v0.4.0`. Each requires separate design, implementation, and
validation work.

### Validation

**Status:** Planned.

- Validate stage-transition behavior against NetLogo BehaviorSpace runs.
- Compare aggregate trajectories using controlled configurations.
- Document where numerical or conceptual parity is intentionally impossible.

### Social Mechanisms

**Status:** Deferred.

- Add dynamic network-group state.
- Add belief and norm updates.
- Allow social relationships to affect agent decisions rather than only
  visualization.

### Harm and Justice Mechanisms

**Status:** Deferred.

- Add carefully tested accidents, assaults, brawls, and hazardous acts.
- Add police patrol, intervention, arrest, and justice processes.
- Add death and rebirth only if justified by the project scope.

### Spatial and Asset Fidelity

**Status:** Deferred.

- Extend road travel with detailed sidewalks and venue occupancy queues.
- Consider bus, taxi, and transport-choice behavior.
- Add imported GLB streets/buildings and editable billboard artwork where they
  improve explanation without harming performance.

### Neural and Alcohol Mechanisms

**Status:** Removed from current scope unless explicitly restored.

- Detailed Neural Balance action arrays.
- Full intake, intoxication, tolerance, withdrawal, and comedown procedures.
- Non-alcohol drug agents and effects.

These mechanisms should not be presented as implemented unless executable code
and validation are added.

## Repository Maintenance Roadmap

### Completed

- Promoted Beta.4 development state to production.
- Added coherent Beta.2, Beta.3, Beta.4, and Beta.5 tags.
- Migrated the production branch from `master` to `main`.
- Added a formal release changelog.
- Updated the repository README to describe the actual project.

### Deferred Maintenance

- Remove the unused legacy scroll-story prototype component tree.
- Review generated files and obsolete assets.
- Continue maintaining accurate wireframes and implementation documentation.
- Review dependency and Node-version warnings during a dedicated maintenance
  session.

Maintenance work should avoid changing runtime behavior unless explicitly
scoped and tested.

## Development Principles

- Keep each session focused on one primary feature.
- Verify executable behavior before describing a feature as implemented.
- Clearly separate model mechanisms from presentation devices.
- Do not describe outputs as validated policy predictions.
- Preserve current functionality while refining the interface.
- Update the changelog, version label, documentation, and wireframes with each
  beta where relevant.
- Deploy betas to the development preview before considering production
  promotion.
- Validate risky model changes independently from broad UI work.

## Condensed Release Order

| Release or track | Focus | Status |
|---|---|---|
| `v0.3.0-beta.5` | Perspective-aware agent sprites | Implemented |
| `v0.3.0-beta.6` | Responsive UI foundations | Released |
| `v0.3.0-beta.7` | Tutorial and explanation refinement | Released |
| `v0.3.0-beta.8` | Agent Directory redesign | In progress |
| `v0.3.0-beta.9` | Policy Lab refinement | Planned |
| `v0.3.0` | Stable exploratory Model Bridge | Planned |
| `v0.4.x` | Seeds, import/export, experiment plans, comparison | Planned |
| Fidelity track | Validation and selected SimARC mechanisms | Deferred/separate |
| Mobile optimization | Purpose-built mobile refinement | Deferred |
