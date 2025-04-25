import Random from '@utils/random'
import Wind from './wind'

// TODO improve
export default class Landscape {
  constructor(grid) {
    this.grid = grid
    this.wind = new Wind()
    this.riverBlocks = this.grid.blocks.filter(b => b.name !== 'riverStart' && b.links.length)

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

  updateLinks() {
    this.grid.blocks.forEach(b => {
      if (b.links && !b.links.length) {
        const closestRiver = this.getClosestRiver(b)
        b.linked = closestRiver.linked
      }
    })
  }

  getClosestRiver(block) {
    if (!block) return null

    let closestBlock = null
    let closestDistance = Infinity

    this.riverBlocks.forEach(riverBlock => {
      if (riverBlock.name === 'riverStart') return

      const distance = Math.abs(block.q - riverBlock.q) + Math.abs(block.r - riverBlock.r)
      if (distance < closestDistance) {
        closestDistance = distance
        closestBlock = riverBlock
      }
    })

    return closestBlock
  }

  update() {
    this.wind.update()
  }

  dispose() {
    this.wind.dispose()
    delete this.wind
  }
}
