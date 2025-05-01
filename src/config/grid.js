import { Uniform } from 'three'

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

function setDebug(debug) {
  const landscapeFolder = debug.root.addFolder({ title: '🏔️ landscape', index: 7, expanded: false })
  landscapeFolder.addBinding(gridConfig.landscape.wind, 'speed', {
    label: 'wind speed',
    min: 0,
    max: 1,
    step: 0.01,
  })
  landscapeFolder.addBinding(gridConfig.landscape.ship, 'speed', {
    label: 'ship speed',
    min: 0,
    max: 1,
    step: 0.01,
  })
  landscapeFolder.addBinding(gridConfig.landscape.ship, 'maxVolume', {
    label: 'ship volume',
    min: 0,
    max: 1,
    step: 0.01,
  })

  landscapeFolder.addBinding(gridConfig.landscape.seagull, 'speed', {
    label: 'seagulls speed',
    min: 0,
    max: 1,
    step: 0.01,
  })
  landscapeFolder.addBinding(gridConfig.landscape.seagull, 'maxVolume', {
    label: 'seagulls volume',
    min: 0,
    max: 1,
    step: 0.01,
  })

  const oceanFolder = debug.root.addFolder({ title: '🌊 ocean', index: 8, expanded: false })
  oceanFolder.addBinding(gridConfig.ocean.roughness, 'value', {
    label: 'roughness',
    min: 0,
    max: 1,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'frequencyX', {
    label: 'waves frequencyX',
    min: 0,
    max: 1,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'frequencyY', {
    label: 'waves frequencyY',
    min: 0,
    max: 1,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'speed', {
    label: 'waves speed',
    min: 0,
    max: 5,
    step: 0.01,
  })
  oceanFolder.addBinding(gridConfig.ocean.waves, 'scale', {
    label: 'waves scale',
    min: 0,
    max: 1,
    step: 0.01,
  })
}

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

  landscape: {
    wind: { speed: 0.25 },
    ship: {
      maxVolume: 0.3,
      speed: 0.05,
      models: {
        ship: { scale: 0.2, rotationOffset: 0, elevationOffset: 0.05 },
        boat: { scale: 0.005, rotationOffset: -Math.PI * 0.5, elevationOffset: 0.1 },
      },
    },
    seagull: {
      maxVolume: 1,
      speed: 0.08,
    },
  },

  ocean: {
    size: 20,
    roughness: new Uniform(0.65),
    waves: {
      frequencyX: 0.03,
      frequencyY: 0.03,
      speed: 0.05,
      scale: 0.25,
    },
  },

  setDebug,
}

const levels = generateLevels()
gridConfig.levels = levels

export default gridConfig
