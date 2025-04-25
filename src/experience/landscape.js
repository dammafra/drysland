import Random from '@utils/random'

// TODO improve
export default class Landscape {
  constructor(grid) {
    grid.deadEnds.forEach((b, i) => {
      if (i % 2) {
        b.name = 'riverEnd'
      }

      grid.addNeighbors(b, i % 2 ? 'buildingVillage' : 'stoneHill')

      b.neighbors.forEach(n =>
        grid.addNeighbors(
          n,
          i % 2 ? 'buildingHouse' : () => (Random.boolean(0.5) ? 'stoneMountain' : 'stoneHill'),
        ),
      )
    })

    grid.addPerimeter(() =>
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
    grid.addPerimeter(() => Random.oneOf('grass', 'grassForest'))
    grid.addPerimeter(() => Random.oneOf('sand', 'sandRocks'))
  }
}
