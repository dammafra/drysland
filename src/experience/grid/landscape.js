import blocksConfig, { isRiverStart } from '@config/blocks'
import gridConfig from '@config/grid'
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

    this.grid.deadEnds.forEach((b, i) => {
      b.name = Random.alternate(i, blocksConfig.linksMap['0'])

      this.grid.addNeighbors(b, Random.alternate(i, ['buildingVillage', 'stoneMountain']))

      b.neighbors.forEach(n =>
        this.grid.addNeighbors(
          n,
          Random.alternate(i, [
            () => Random.weightedOneOf(blocksConfig.city),
            () => Random.weightedOneOf(blocksConfig.mountain),
          ]),
        ),
      )
    })

    this.grid.addPerimeter(() => Random.weightedOneOf(blocksConfig.landscape))
    this.grid.addPerimeter(() => Random.oneOf(blocksConfig.grass))
  }

  init() {
    this.ship = new Ship(this.grid.radius)
    this.winds = Array.from({ length: Random.integer({ min: 1, max: 3 }) }, () => new Wind())
    this.seagulls = Array.from({ length: Random.integer({ min: 3, max: 6 }) }, () => new Seagull())
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
      this.riverBlocks = this.grid.blocks.filter(b => !isRiverStart(b) && b.links.length)
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

    if (this.ship) {
      const distance = this.camera.normalizedDistanceTo(this.ship.mesh.position)
      const volume = Math.pow(1 - distance, 10)
      const clampedVolume = Math.max(0, Math.min(volume, gridConfig.landscape.ship.maxVolume))
      this.soundPlayer.updateBackgoundVolume('sailing', clampedVolume)
    }

    if (this.seagulls) {
      const distance = Math.min(
        ...this.seagulls.map(s => s.mesh.position).map(p => this.camera.normalizedDistanceTo(p)),
      )
      const volume = Math.pow(1 - distance, 5)
      const clampedVolume = Math.max(0, Math.min(volume, gridConfig.landscape.seagull.maxVolume))
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
