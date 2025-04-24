import Random from '@utils/random'

export default class Ocean {
  constructor(grid) {
    this.grid = grid
    this.grid.addPerimeter(() => (Random.boolean(0.1) ? 'waterRocks' : 'water'))
  }
}
