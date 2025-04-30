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
      b.name = i % 2 ? 'riverEnd' : 'riverStart'

      this.grid.addNeighbors(b, i % 2 ? 'buildingVillage' : 'stoneMountain')

      b.neighbors.forEach(n =>
        this.grid.addNeighbors(
          n,
          i % 2
            ? Random.weightedOneOf({ buildingHouse: 1, buildingVillage: 0.5, buildingMarket: 0.2 })
            : () => Random.weightedOneOf({ stoneHill: 1, buildingCabin: 0.5, buildingMine: 0.2 }),
        ),
      )
    })

    this.grid.addPerimeter(() =>
      Random.weightedOneOf({
        grass: 1,
        grassForest: 0.8,
        grassHill: 0.3,
        buildingMill: 0.4,
        buildingSheep: 0.3,
        buildingCastle: 0.2,
        buildingWall: 0.2,
        buildingWizardTower: 0.2,
        buildingArchery: 0.2,
        buildingSmelter: 0.2,
      }),
    )
    this.grid.addPerimeter(() => Random.oneOf('grass', 'grassForest'))
  }

  init() {
    this.wind = new Wind()
    this.ship = new Ship(this.grid.radius)
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
      this.riverBlocks = this.grid.blocks.filter(b => b.name !== 'riverStart' && b.links.length)
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
    this.wind?.update()
    this.ship?.update()
    this.seagulls?.forEach(s => s.update())

    if (this.ship) {
      const distance = this.camera.normalizedDistanceTo(this.ship.mesh.position)
      const volume = Math.pow(1 - distance, 10)
      const clampedVolume = Math.max(0, Math.min(volume, 0.3))
      this.soundPlayer.updateBackgoundVolume('sailing', clampedVolume)
    }

    if (this.seagulls) {
      const distance = Math.min(
        ...this.seagulls.map(s => s.mesh.position).map(p => this.camera.normalizedDistanceTo(p)),
      )
      const volume = Math.pow(1 - distance, 5)
      const clampedVolume = Math.max(0, Math.min(volume, 1))
      this.soundPlayer.updateBackgoundVolume('seagulls', clampedVolume)
    }
  }

  dispose() {
    this.wind?.dispose()
    delete this.wind

    this.ship?.dispose()
    delete this.ship

    this.seagulls?.forEach(s => s.dispose())
    delete this.seagulls
  }
}
