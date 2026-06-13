# SimARC Bridge Agent Instructions

## Project

SimARC Bridge is a Vite, React, Three.js, and Tailwind CSS interactive
explanation of selected SimARC concepts. It combines a navigable city,
simulation controls, guided tutorial, network view, and policy dashboard.

The Bridge is an exploratory communication interface. Do not describe its
illustrative outputs as validated predictions or a numerically equivalent
SimARC port.

## Environment And Commands

- Use Node.js 22.
- In Codex Cloud, select Node.js 22 in the environment's language runtime
  settings. The setup-script shell does not expose `nvm`.
- Leave all other Codex Cloud preinstalled-package selections at their defaults;
  this project only requires Node.js and npm.
- Use this Codex Cloud setup script:

  ```sh
  set -euo pipefail
  cd /workspace/soc_201_interactive_model_bridge
  node --version
  npm --version
  node -e "const major=Number(process.versions.node.split('.')[0]); if (major < 22 || major >= 25) process.exit(1)"
  npm install --include=optional --no-audit --no-fund
  npm run lint
  npm run build
  ```

- Use this Codex Cloud maintenance script:

  ```sh
  set -euo pipefail
  cd /workspace/soc_201_interactive_model_bridge
  npm install --include=optional --no-audit --no-fund
  ```

- For local clean-install checks, use `npm ci --include=optional` when the
  platform-generated lockfile permits it.
- Start local development with `npm run dev`.
- Run `npm run lint` and `npm run build` before finalizing code changes.
- `npm run build` writes generated output to `dist/`; do not commit it.

## Working Rules

- Prefer small, high-confidence changes that follow existing component and
  state-management patterns.
- Preserve the continuous simulation experience and existing visual language
  unless the task explicitly requests a redesign.
- Keep tutorial actions, requirements, migration aliases, and progression
  explicit and inspectable.
- Maintain responsive behavior across Compact, Default, Large, laptop, desktop,
  and existing mobile layouts when changing shared controls or panels.
- Keep model mechanisms distinct from presentation-only behavior and document
  intentional simplifications accurately.
- Update relevant version labels, changelog entries, tutorial references,
  roadmap status, and wireframe documentation when release-facing behavior
  changes.
- Do not modify unrelated untracked or user-authored files.

## Branches And Deployment

- Develop and verify beta work on `dev`.
- Promote to `main` only when explicitly requested.
- Pushes to either branch trigger the combined GitHub Pages workflow:
  `main` supplies the production root and `dev` supplies `/dev/`.
- Do not create or move release tags unless explicitly requested.

## Validation And Reporting

- Verify changed interactions manually when a browser is available.
- Report changed behavior, commands run, validation results, and any validation
  that could not be performed.
