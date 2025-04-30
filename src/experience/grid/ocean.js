import WaterBlock from '@blocks/water-block'
import blocksConfig from '@config/blocks'
import gridConfig from '@config/grid'
import Random from '@utils/random'

// TODO improve
export default class Ocean {
  constructor(grid) {
    this.grid = grid
    this.size = 20

    this.grid.addPerimeter(() => Random.oneOf('sand', 'sandRocks'))
    this.grid.addPerimeter(() => Random.weightedOneOf({ water: 1, waterRocks: 0.05 }))

    this.placeDocks()

    for (let i = 0; i < this.size; i++) {
      this.addWaterPerimeter()
    }
  }

  placeDocks() {
    const sands = this.grid.blocks.filter(b => blocksConfig.sand.includes(b.name))

    sands.forEach(b => {
      const firstWater = b.neighbors?.findIndex(n => n.name.includes('water'))
      const lastWater = b.neighbors?.findLastIndex(n => n.name.includes('water'))

      if (!firstWater || !lastWater) return

      if (firstWater === lastWater) {
        b.name = Random.oneOf(blocksConfig.docks)
        b.rotation = -((Math.PI / 3) * firstWater)
        b.neighbors.forEach(n => {
          if (n.name.includes('sand') || n.name.includes('sand')) n.name = 'water'
        })
      }
    })

    sands.forEach(b => {
      const waterNeighbors = b.neighbors?.filter(n => n.name.includes('water'))
      if (waterNeighbors && waterNeighbors.length === 4) b.name = 'water'
    })
  }

  addWaterPerimeter() {
    this.grid.perimeter.forEach(block => {
      block.neighbors = gridConfig.directions.map(dir => {
        const q = block.q + dir.q
        const r = block.r + dir.r
        const existingBlock = this.grid.getBlock(q, r)
        if (existingBlock) return existingBlock

        const waterBlock = new WaterBlock({ grid: this.grid, q, r })
        this.grid.blocksMap.set(waterBlock.key, waterBlock)
        return waterBlock
      })
    })
  }
}
