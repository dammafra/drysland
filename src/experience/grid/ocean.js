import WaterBlock from '@blocks/water-block'
import blocksConfig, { isSand, isWater, setWater } from '@config/blocks'
import gridConfig from '@config/grid'
import Random from '@utils/random'

// TODO improve
export default class Ocean {
  constructor(grid) {
    this.grid = grid

    this.grid.addPerimeter(() => Random.oneOf(blocksConfig.sand))
    this.grid.addPerimeter(() => Random.weightedOneOf(blocksConfig.water))

    this.placeDocks()
    this.addWaterPerimeter()
  }

  placeDocks() {
    const sands = this.grid.blocks.filter(isSand)

    sands.forEach(b => {
      const firstWater = b.neighbors?.findIndex(isWater)
      const lastWater = b.neighbors?.findLastIndex(isWater)

      if (!firstWater || !lastWater) return

      if (firstWater === lastWater) {
        b.name = Random.oneOf(blocksConfig.docks)
        b.rotation = -((Math.PI / 3) * firstWater)
        b.neighbors.forEach(n => {
          if (isSand(n) || isWater(n)) setWater(n)
        })
      }
    })

    sands.forEach(b => {
      const waterNeighbors = b.neighbors?.filter(isWater)
      if (waterNeighbors && waterNeighbors.length === 4) setWater(b)
    })
  }

  addWaterPerimeter() {
    for (let i = 0; i < gridConfig.ocean.size; i++) {
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
}
