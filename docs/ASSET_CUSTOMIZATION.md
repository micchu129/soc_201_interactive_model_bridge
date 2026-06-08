# Asset Customization

The application currently uses generated Three.js fallback geometry so it runs without external assets.

- Building models: `public/assets/buildings/`
- Street models: `public/assets/streets/`
- Roof logos: `public/assets/logos/`
- Agent billboards: `public/assets/agents/`
- UI and behavior icons: `public/assets/icons/`
- Asset path mappings: `src/config/assetManifest.js`
- All presentation colors: `src/config/colors.js`
- World defaults: `src/config/worldDefaults.js`
- Population defaults: `src/config/populationDefaults.js`
- Policy defaults: `src/config/policyDefaults.js`

To introduce GLB assets, load them in `CityScene.jsx` through Drei's `useGLTF`, then retain the existing generated geometry as the missing-asset fallback.
