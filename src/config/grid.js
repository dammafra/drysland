import Random from '@utils/random'
import { Uniform } from 'three'

const gridConfig = {
  selectionStrategy: 1, // DFS, see `applySelectionStrategy` below

  minRadius: 2,
  maxRadius: 8,

  minCoverage: 0.6,
  maxCoverage: 0.9,

  minExtraLinks: 0,
  maxExtraLinks: 0.2,

  difficultyScale: 100, // by level 100 you reach the maximum difficulty

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
    wind: { min: 1, max: 3, speed: 0.25 },
    ship: {
      maxVolume: 0.3,
      speed: 0.05,
      models: {
        ship: { scale: 0.2, rotationOffset: 0, elevationOffset: 0.05 },
        boat: { scale: 0.005, rotationOffset: -Math.PI * 0.5, elevationOffset: 0.1 },
      },
    },
    seagulls: {
      options: {
        quality: { min: 3, max: 6 },
        performance: { min: 1, max: 3 },
      },
      maxVolume: 1,
      speed: 0.08,
    },
  },

  ocean: {
    options: {
      quality: { size: 20, roughness: new Uniform(0.65) },
      performance: { size: 15, roughness: new Uniform(1.0) },
    },
    waves: {
      frequencyX: 0.03,
      frequencyY: 0.03,
      speed: 0.05,
      scale: 0.25,
    },
  },
}

export const generateLevel = n => {
  const lerp = (min, max, t) => min + (max - min) * t
  const t = n / gridConfig.difficultyScale

  const radius = Math.round(
    Math.min(gridConfig.maxRadius, lerp(gridConfig.minRadius, gridConfig.maxRadius, t)),
  )

  const coverage = Math.min(
    gridConfig.maxCoverage,
    lerp(gridConfig.minCoverage, gridConfig.maxCoverage, t),
  )

  const extraLinks = Math.min(
    gridConfig.maxExtraLinks,
    lerp(gridConfig.minExtraLinks, gridConfig.maxExtraLinks, t),
  )

  return { radius, coverage, extraLinks }
}

/**
 * Selection strategy:
 * 1. DFS style: pick last      --> frontier.at(-1)
 * 2. BFS style: pick first     --> frontier.at(0)
 * 3. Prim style: pick random   --> Random.oneOf(frontier)
 *
 * TODO:
 * - Balanced: use middle or weighted
 * - Mixed
 */
export const applySelectionStrategy = (frontier, strategy) => {
  // prettier-ignore
  switch (strategy) {
        case 1: return frontier.at(-1)
        case 2: return frontier.at(0)
        case 3: return Random.oneOf(frontier)
        default:
          debug.warn('The selected strategy doe not exixt, fallback to DFS')
          return applySelectionStrategy(frontier, 1)
      }
}

export default gridConfig
