import Random from '@utils/random'

export default class Landscape {
  constructor(grid) {
    this.grid = grid

    this.terraform()
  }

  terraform() {
    this.grid.deadEnds.forEach((b, i) => {
      if (i % 2) {
        b.name = 'riverEnd'
      }

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
}
