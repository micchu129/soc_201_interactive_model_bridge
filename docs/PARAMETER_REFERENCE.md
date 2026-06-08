# Parameter Reference

Parameter metadata is maintained in `src/config/parameters.js`. Categories are intentionally not shown to end users.

## Conservative Exposed Parameters

- World: bars, clubs, shops, hospitals, rehabilitation centers, police stations, residential density.
- Population: population size, gender share, social-network density, and a stable seven-stage default distribution.
- Policy: alcohol price, venue regulation, treatment access, and prevention.

Every exposed parameter is clamped by `src/simulation/validation.js`. Required venue counts cannot be set to zero.
