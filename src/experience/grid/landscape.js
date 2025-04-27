import Random from '@utils/random'
import Seagull from './seagull'
import Ship from './ship'
import Wind from './wind'

// TODO improve
export default class Landscape {
  constructor(grid) {
    this.grid = grid

    this.grid.deadEnds.forEach((b, i) => {
      b.name = i % 2 ? 'riverEnd' : 'riverStart'

      this.grid.addNeighbors(b, i % 2 ? 'buildingVillage' : 'stoneHill')

      b.neighbors.forEach(n =>
        this.grid.addNeighbors(
          n,
          i % 2
            ? 'buildingHouse'
            : () => Random.oneOf('stoneMountain', 'stoneHill', 'buildingCabin'),
        ),
      )
    })

    this.grid.addPerimeter(() =>
      Random.oneOf(
        'grass',
        'grassForest',
        'grassHill',
        'buildingMill',
        'buildingSheep',
        // 'buildingCastle',
        // 'buildingFarm',
      ),
    )
    this.grid.addPerimeter(() => Random.oneOf('grass', 'grassForest'))
    this.grid.addPerimeter(() => Random.oneOf('sand', 'sandRocks'))
  }

  init() {
    this.wind = new Wind()
    this.ship = new Ship(this.grid.radius)
    this.seagulls = Array.from({ length: Random.integer({ min: 1, max: 3 }) }, () => new Seagull())
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
