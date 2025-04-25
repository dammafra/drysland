import gridConfig from '@config/grid'
import Random from '@utils/random'
import WaterBlock from './water-block'

// TODO improve
export default class Ocean {
  constructor(grid) {
    const size = 20

    grid.addPerimeter(() => (Random.boolean(0.1) ? 'waterRocks' : 'water'))

    for (let i = 0; i < size; i++) {
      grid.perimeter.forEach(block => {
        block.neighbors = gridConfig.directions.map(dir => {
          const q = block.q + dir.q
          const r = block.r + dir.r
          const existingBlock = grid.getBlock(q, r)
          if (existingBlock) return existingBlock

          const waterBlock = new WaterBlock({ grid: grid, q, r })
          grid.blocksMap.set(waterBlock.key, waterBlock)
          return waterBlock
        })
      })
    }
  }
}
