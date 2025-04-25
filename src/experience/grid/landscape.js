import Random from '@utils/random'

// TODO improve
export default class Landscape {
  constructor(grid) {
    this.grid = grid
    this.riverBlocks = this.grid.blocks.filter(b => b.name !== 'riverStart' && b.links.length)

    this.grid.deadEnds.forEach((b, i) => {
      b.name = i % 2 ? 'riverEnd' : 'riverStart'

      this.grid.addNeighbors(b, i % 2 ? 'buildingVillage' : 'stoneHill')

      b.neighbors.forEach(n =>
        this.grid.addNeighbors(
          n,
          i % 2 ? 'buildingHouse' : () => (Random.boolean(0.5) ? 'stoneMountain' : 'stoneHill'),
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
}
