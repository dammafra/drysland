import Experience from '@experience'
import Random from '@utils/random'

export default class GridConfig {
  /** @type {GridConfig} */
  static instance

  static init() {
    return new GridConfig()
  }

  constructor() {
    if (GridConfig.instance) return GridConfig.instance
    GridConfig.instance = this

    this.experience = Experience.instance
    this.settings = this.experience.settings

    this.selectionStrategy = 1 // DFS, see `applySelectionStrategy` below
    this.minRadius = 1
    this.maxRadius = 8
    this.minCoverage = 0.6
    this.maxCoverage = 0.9
    this.minExtraLinks = 0
    this.maxExtraLinks = 0.2
    this.difficultyScale = 100 // by level 100 you reach the maximum difficulty
    this.minDeadEnds = 2
    this.directions = [
      { q: -1, r: 0 }, //edge 0: E
      { q: 0, r: -1 }, //edge 1: NE
      { q: 1, r: -1 }, //edge 2: NW
      { q: 1, r: 0 }, //edge 3: W
      { q: 0, r: 1 }, //edge 4: SW
      { q: -1, r: 1 }, //edge 5: SE
    ]
  }

  generateLevel(n) {
    const lerp = (min, max, t) => min + (max - min) * t
    const t = n / this.difficultyScale

    const radius = Math.round(Math.min(this.maxRadius, lerp(this.minRadius, this.maxRadius, t)))
    const coverage = Math.min(this.maxCoverage, lerp(this.minCoverage, this.maxCoverage, t))
    const extraLinks = Math.min(this.maxExtraLinks, lerp(this.minExtraLinks, this.maxExtraLinks, t))

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
  applySelectionStrategy(frontier) {
    // prettier-ignore
    switch (this.selectionStrategy) {
        case 1: return frontier.at(-1)
        case 2: return frontier.at(0)
        case 3: return Random.oneOf(frontier)
        default:
          this.selectionStrategy = 1
          return this.applySelectionStrategy(frontier)
      }
  }
}
