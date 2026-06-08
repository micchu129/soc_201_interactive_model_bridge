# NetLogo Implementation Status

Source reviewed: `SimARC 2.2_7.0.3.nlogox`.

## Implemented Conservatively

- Two-hour calculation boundaries with continuous real-time rendering between boundaries.
- Calendar day, week, clock, and weekend state.
- Individuals with gender, age, weight, social position, cash, health, stage, alcohol-use mode, BAC, weekly intake, home, destination, and current activity.
- Seven alcohol stages with conservative weekly progression and regression.
- Homes, bars, clubs/discos, bottle shops, hospitals, rehabilitation, and police buildings.
- Alcohol buying, venue-sensitive destination choice, price-sensitive spending, BAC increase and decay.
- Basic sickness/hospitalization and rehabilitation behavior.
- Policy application at safe two-hour calculation boundaries.
- Aggregate consumption, high-risk population, hospital load, treatment load, health, and BAC outputs.

## Simplified

- NetLogo territory arrays are represented as home and destination objects.
- Social-position and stage influence are retained, while neural-threshold arrays are not.
- Venue routines are probabilistic and readable rather than reproducing every hour-specific branch.
- Agents travel directly between validated destinations; detailed transit modes are omitted.
- Renderer supports approximately 100 visible agents rather than the NetLogo default of 1,000.

## Deferred

- Neural action arrays and detailed brain intake/comedown procedures.
- Non-alcohol drugs.
- Full social network belief propagation.
- Detailed accidents, assaults, brawls, police arrest branches, death, and rebirth.
- Bus and taxi simulation.
- Exact NetLogo patch, random-number, and numerical parity.

## Future TODO

1. Validate stage transition outputs against NetLogo BehaviorSpace runs.
2. Add social-network group state and belief updates.
3. Add carefully tested accidents, assaults, and police responses.
4. Replace direct travel with a full sidewalk graph and venue occupancy queue.
5. Add imported GLB streets/buildings and editable billboard artwork.
