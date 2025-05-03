import WaterBlock from '@blocks/water-block'
import BlocksConfig from '@config/blocks'
import GridConfig from '@config/grid'
import OceanConfig from '@config/ocean'
import Random from '@utils/random'

// TODO improve
export default class Ocean {
  constructor(grid) {
    this.grid = grid

    this.grid.addPerimeter(() => Random.oneOf(BlocksConfig.instance.sand))
    this.grid.addPerimeter(() => Random.weightedOneOf(BlocksConfig.instance.water))

    this.placeDocks()
    this.addWaterPerimeter()
  }

  placeDocks() {
    const sands = this.grid.blocks.filter(b => b.isSand)

    sands.forEach(b => {
      const firstWater = b.neighbors?.findIndex(n => n.isWater)
      const lastWater = b.neighbors?.findLastIndex(n => n.isWater)

      if (!firstWater || !lastWater) return

      if (firstWater === lastWater) {
        b.name = Random.oneOf(BlocksConfig.instance.docks)
        b.rotation = -((Math.PI / 3) * firstWater)
        b.neighbors.forEach(n => {
          if (n.isSand || n.isWater) n.setWater()
        })
      }
    })

    sands.forEach(b => {
      const waterNeighbors = b.neighbors?.filter(n => n.isWater)
      if (waterNeighbors && waterNeighbors.length === 4) b.setWater()
    })
  }

  addWaterPerimeter() {
    for (let i = 0; i < OceanConfig.instance.size; i++) {
      this.grid.perimeter.forEach(block => {
        block.neighbors = GridConfig.instance.directions.map(dir => {
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
}
