# SimARC Bridge Creative Alterations

The Bridge is an explanatory interface built from SimARC 2.2 concepts. It is not a numerically equivalent port of the NetLogo 7.0.3 model. Creative decisions were made to improve readability, interaction, and browser performance.

## Removed or Deferred From Original SimARC

- Neural action arrays and detailed brain intake/comedown procedures.
- Non-alcohol drug agents and effects.
- Network group beliefs, accepted use types, and belief propagation.
- Buses, taxis, transport choice, police patrol/intervention, arrests, jail, assaults, brawls, accidents, hazardous acts, deaths, and rebirth.
- Detailed patch properties including crowd, reputation, prevention, happy hours, blacklists, stops, and exact venue schedules.
- Exact NetLogo random-number behavior, patch movement, and BehaviorSpace parity.

## Simplified Model Behavior

- The default visible population is approximately 100 rather than 1,000.
- Social networks use stable friend identifiers instead of autonomous network-group state.
- Agents make readable probabilistic destination decisions at two-hour boundaries.
- Travel uses a road graph with continuous presentation between decisions.
- Alcohol purchase, BAC, health, hospitalization, treatment, and stage transitions retain core intent but use conservative simplified rules.
- Policy controls are reduced to alcohol price, venue regulation, treatment access, and prevention.

## Features Added by the Bridge

- A navigable 3D city with continuous movement and day/night lighting.
- Micro, Meso, and Macro explanatory layers.
- Selectable building and agent panels, billboard-circle occupancy towers, labeled network hubs, and relationship highlighting.
- Guided action-driven tutorial, camera presets, responsive mobile bottom sheets, saved browser state, and UI scaling.
- Two-hour consumption and stage-distribution history with selectable timescales.
- Policy-oriented outcome cards and explanatory presentation not present in the original interface.

## Presentation Versus Model Behavior

Occupancy towers, network edge colors, panel connectors, tutorial rewind, camera movement, lighting, and most UI animations are presentation devices. They do not add validated causal behavior to the model. The tutorial rewind deliberately restores a snapshot after an approximate visual reverse playback.

## Occupancy Display History

An earlier untracked build used circular occupancy indicators and was later removed. Version `v0.3.0-beta.2` restored the concept as 3D spheres. Version `v0.3.0-beta.3` restores the preferred Beta.1-style billboard circles while retaining four-person tower layers in Micro and Meso. These circles are persistent agent visuals, so entry and exit remain visible. Macro uses small billboard circles in rooftop corners to reduce visual density.
