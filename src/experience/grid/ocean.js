import WaterBlock from '@blocks/water-block'
import blocksConfig from '@config/blocks'
import gridConfig from '@config/grid'
import Random from '@utils/random'

// TODO improve
export default class Ocean {
  constructor(grid) {
    this.grid = grid
    this.size = 20

    this.grid.addPerimeter(() => Random.weightedOneOf({ water: 1, waterRocks: 0.05 }))

    this.grid.blocks
      .filter(b => blocksConfig.sand.includes(b.name))
      .forEach(b => {
        if (Random.boolean(0.98)) return
        b.name = Random.oneOf(blocksConfig.docks)
        this.rotateTowardsOcean(b)
      })

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

  rotateTowardsOcean = block => {
    const directions = block.neighbors
      .map((b, i) => (b.name.includes('water') ? i : undefined))
      .filter(b => b >= 0)

    let direction
    if (directions.length === 3) {
      direction = directions.join('') === '015' ? 0 : directions.at(1)
    } else {
      direction = Random.oneOf(directions)
    }

    block.rotation = -((Math.PI / 3) * direction)
  }
}
