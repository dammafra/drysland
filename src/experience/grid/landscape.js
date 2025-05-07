import BlocksConfig from '@config/blocks'
import LandscapeConfig from '@config/landscape'
import Experience from '@experience'
import Random from '@utils/random'
import Seagull from './seagull'
import Ship from './ship'
import Wind from './wind'

// TODO improve
export default class Landscape {
  constructor(grid) {
    this.experience = Experience.instance
    this.camera = this.experience.camera
    this.soundPlayer = this.experience.soundPlayer
    this.grid = grid

    this.addDeadEndsPerimeters()
    this.grid.addPerimeter(
      () => Random.weightedOneOf(BlocksConfig.instance.landscape),
      LandscapeConfig.instance.size,
    )
    this.grid.addPerimeter(() => Random.oneOf(BlocksConfig.instance.grass))
  }

  /**
   * Alternate dead ends landscape generation:
   * - even indices (i) represent river starts (originating from mountains)
   * - odd indices represent river ends (leading into cities)
   *
   * Each dead-end gets a river tile, then connects to a primary mountain or city block accordingly,
   * and their neighbors get secondary blocks matching the context (mountain surroundings near starts, city surroundings near ends).
   *
   * TODO: configure dimension and weights; add tweaks
   */
  addDeadEndsPerimeters() {
    this.grid.deadEnds.forEach((b, i) => {
      b.name = Random.alternate(i, BlocksConfig.instance.rivers['0'])

      this.grid.addNeighbors(
        b,
        Random.alternate(i, [
          BlocksConfig.instance.city.primary,
          BlocksConfig.instance.mountain.primary,
        ]),
      )

      b.neighbors.forEach(n =>
        this.grid.addNeighbors(
          n,
          Random.alternate(i, [
            () => Random.weightedOneOf(BlocksConfig.instance.city.secondary),
            () => Random.weightedOneOf(BlocksConfig.instance.mountain.secondary),
          ]),
        ),
      )
    })
  }

  init() {
    this.ship = new Ship(this.grid.radius)
    this.winds = Array.from(
      {
        length: Random.integer({
          min: LandscapeConfig.instance.wind.min,
          max: LandscapeConfig.instance.wind.max,
        }),
      },
      () => new Wind(),
    )
    this.seagulls = Array.from(
      {
        length: Random.integer({
          min: LandscapeConfig.instance.seagulls.min,
          max: LandscapeConfig.instance.seagulls.min,
        }),
      },
      () => new Seagull(),
    )
  }

  updateLinks() {
    this.grid.blocks.forEach(b => {
      if (b.links && !b.links.length) {
        const closestRiver = this.getClosestRiver(b)
        b.linked = closestRiver.linked
      }
    })
  }

  getClosestRiver(block) {
    if (!this.riverBlocks) {
      this.riverBlocks = this.grid.blocks.filter(b => !b.isRiverStart && b.links.length)
    }

    if (!block) return null

    let closestBlock = null
    let closestDistance = Infinity

    this.riverBlocks.forEach(riverBlock => {
      const distance = Math.abs(block.q - riverBlock.q) + Math.abs(block.r - riverBlock.r)
      if (distance < closestDistance) {
        closestDistance = distance
        closestBlock = riverBlock
      }
    })

    return closestBlock
  }

  update() {
    this.ship?.update()
    this.winds?.forEach(w => w.update())
    this.seagulls?.forEach(s => s.update())

    if (this.seagulls) {
      const distance = Math.min(
        ...this.seagulls.map(s => s.mesh.position).map(p => this.camera.normalizedDistanceTo(p)),
      )
      const volume = Math.pow(1 - distance, 5)
      const clampedVolume = Math.max(
        0,
        Math.min(volume, LandscapeConfig.instance.seagulls.maxVolume),
      )
      this.soundPlayer.updateBackgoundVolume('seagulls', clampedVolume)
    }
  }

  dispose() {
    this.ship?.dispose()
    delete this.ship

    this.winds?.forEach(w => w.dispose())
    delete this.winds

    this.seagulls?.forEach(s => s.dispose())
    delete this.seagulls
  }
}
