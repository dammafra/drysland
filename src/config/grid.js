const gridConfig = {
  minRadius: 2,
  maxRadius: 8,
  radiusStep: 1,

  minCoverage: 0.6,
  maxCoverage: 0.8,
  coverageStep: 0.1,

  minExtraLinks: 0,
  maxExtraLinks: 0.1,
  maxExtraLinksStep: 0.05,

  minDeadEnds: 2,
  directions: [
    { q: -1, r: 0 }, //edge 0: E
    { q: 0, r: -1 }, //edge 1: NE
    { q: 1, r: -1 }, //edge 2: NW
    { q: 1, r: 0 }, //edge 3: W
    { q: 0, r: 1 }, //edge 4: SW
    { q: -1, r: 1 }, //edge 5: SE
  ],
}

function generateLevels() {
  const levels = []

  for (
    let radius = gridConfig.minRadius;
    radius <= gridConfig.maxRadius;
    radius += gridConfig.radiusStep
  ) {
    for (
      let extraLinks = gridConfig.minExtraLinks;
      extraLinks <= gridConfig.maxExtraLinks;
      extraLinks += gridConfig.maxExtraLinksStep
    ) {
      for (
        let coverage = gridConfig.minCoverage;
        coverage <= gridConfig.maxCoverage;
        coverage += gridConfig.coverageStep
      ) {
        levels.push({ radius, coverage, extraLinks })
      }
    }
  }

  return levels
}

const levels = generateLevels()
gridConfig.levels = levels

export default gridConfig
