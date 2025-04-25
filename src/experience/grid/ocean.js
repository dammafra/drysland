import WaterBlock from '@blocks/water-block'
import gridConfig from '@config/grid'
import Random from '@utils/random'

// TODO improve
export default class Ocean {
  constructor(grid) {
    this.grid = grid
    this.size = 20

    this.grid.addPerimeter(() => (Random.boolean(0.1) ? 'waterRocks' : 'water'))

    for (let i = 0; i < this.size; i++) {
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
