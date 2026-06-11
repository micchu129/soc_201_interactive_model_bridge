# SimARC Model Bridge

SimARC Model Bridge is an interactive browser-based explanation of selected concepts from **SimARC 2.2**, developed for the SOC-201 supervised project. It translates parts of the original NetLogo model into a navigable 3D city, guided tutorial, network view, and policy-oriented dashboard.

The Bridge is designed to support exploration and discussion. It is **not** a numerically equivalent port of SimARC, a validated policy-prediction tool, or a replacement for the original NetLogo model.

Current release: **v0.3.0-beta.4**

- Production: <https://micchu129.github.io/soc_201_interactive_model_bridge/>
- Development preview: <https://micchu129.github.io/soc_201_interactive_model_bridge/dev/>

## What The Project Does

The application presents the model through three explanatory layers:

- **Micro:** inspect individual agents, their current activity, alcohol stage, BAC, health, cash, location, and simplified neurotransmitter state.
- **Meso:** explore social and location relationships through labeled Network, Social, Locations, and building Users hubs.
- **Macro:** apply illustrative policy changes and review aggregate outcomes, two-hour consumption history, and seven-stage population history.

The simulation combines continuous visual movement with model decisions at two-hour simulated-time boundaries. Policy changes are applied at the next boundary.

## Main Features

- Navigable Three.js city with roads, buildings, agents, continuous movement, and day/night lighting.
- Generated population with seven alcohol stages and approximately 100 visible agents by default.
- Selectable agent and building detail panels with billboard-circle occupancy towers.
- Agent Directory with find, follow, highlight, and detail actions.
- Micro, Meso, and Macro views with camera presets and relationship highlighting.
- Four policy controls: alcohol price, venue regulation, treatment access, and prevention.
- Rolling outcomes and history views for 24 hours, 7 days, and 30 days.
- Responsive desktop and mobile layouts with draggable panels and mobile bottom sheets.
- Persistent browser state, clock format, tutorial progress, and UI scale.
- A 24-step action-driven tutorial, including a two-day accelerated demonstration that restores an exact saved snapshot.

## Model Scope And Limitations

The Bridge conservatively implements selected ideas from `SimARC 2.2_7.0.3.nlogox`, including:

- Two-hour decision boundaries and continuous presentation between decisions.
- Homes, bars, clubs, bottle shops, hospitals, rehabilitation, and police buildings.
- Individual alcohol stage, use mode, BAC, health, spending, travel, hospitalization, and treatment behavior.
- Simplified social relationships and destination decisions.
- Aggregate consumption, high-risk population, hospital load, treatment load, health, and BAC outcomes.

Important omissions and simplifications include neural action arrays, non-alcohol drugs, full belief propagation, detailed transit, police intervention, accidents, assaults, death/rebirth, and exact NetLogo random-number or numerical parity.

Outputs are illustrative and should not be interpreted as validated causal or policy predictions. See [Creative Alterations](docs/CREATIVE_ALTERATIONS.md) and [NetLogo Implementation Status](docs/NETLOGO_IMPLEMENTATION_STATUS.md) for the detailed comparison.

## Run Locally

Requirements:

- Node.js 24
- npm

```bash
npm install
npm run dev
```

Vite will print the local URL. Local and `/dev/` preview builds intentionally use separate browser-storage namespaces, so saved simulation state and UI scale do not transfer between them.

## Quality Checks

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` creates the production bundle in `dist/`.

## Repository Structure

```text
src/components/    React interface and Three.js scene components
src/config/        World, population, policy, parameter, color, and asset defaults
src/simulation/    Simulation clock, engine, agent, venue, policy, and validation rules
src/utils/         Outcome calculation helpers
public/assets/     Optional replacement assets and customization notes
docs/              Model scope, tutorial, parameters, and implementation records
docs/wireframes/   Editable SVG structural wireframes
```

The current renderer uses generated Three.js fallback geometry and does not require external 3D assets.

## Documentation

- [Tutorial Implementation Reference](docs/TUTORIAL_IMPLEMENTATION_BETA4.md): exact 24-step sequence, displayed text, required actions, locks, and restoration behavior.
- [Creative Alterations](docs/CREATIVE_ALTERATIONS.md): explicit differences between the Bridge and original SimARC.
- [NetLogo Implementation Status](docs/NETLOGO_IMPLEMENTATION_STATUS.md): implemented, simplified, deferred, and planned behavior.
- [Parameter Reference](docs/PARAMETER_REFERENCE.md): exposed world, population, and policy parameters.
- [Asset Customization](docs/ASSET_CUSTOMIZATION.md): asset locations and extension guidance.
- [Wireframes](docs/wireframes/README.md): editable Beta.4 structural UI references.

## Deployment And Branches

- Pushes to `master` build and deploy the production GitHub Pages site.
- Pushes to `dev` build both the production root and the `/dev/` preview, then deploy the combined Pages artifact.
- Both workflows run lint and a production build before deployment.

## Technology

- React 19
- Vite 8
- Three.js
- React Three Fiber and Drei
- Framer Motion
- Tailwind CSS

## Project Status

This repository is an active beta prototype. The current priority is explanatory clarity and reliable interaction, followed by validation against NetLogo BehaviorSpace outputs and careful extension of deferred model behavior.
