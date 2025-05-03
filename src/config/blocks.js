export default class BlocksConfig {
  /** @type {BlocksConfig} */
  static instance

  static init() {
    return new BlocksConfig()
  }

  constructor() {
    if (BlocksConfig.instance) return BlocksConfig.instance
    BlocksConfig.instance = this

    /**
     * Hexagon Edges:
     *
     *     1 /\ 2
     *   0  |  |  3
     *     5 \/ 4
     *
     */
    this.rivers = {
      // one edge
      0: ['riverEnd', 'riverStart'],

      // two edges
      '01': ['riverCornerSharp'],
      '02': ['riverCorner'],
      '03': ['riverBridge', 'riverWatermill', 'riverStraight'],

      // three edges
      '012': ['riverIntersectionA'],
      '034': ['riverIntersectionC'],
      '024': ['riverIntersectionF'],
      '023': ['riverIntersectionB'],

      // four edges
      '0123': ['riverIntersectionH'],
      '0234': ['riverIntersectionD'],
      '0134': ['riverIntersectionE'],

      // five edges
      '01234': ['riverIntersectionG'],

      // six edges
      '012345': ['riverCrossing'],
    }

    this.links = Object.keys(this.rivers)

    this.city = {
      primary: 'buildingVillage',
      secondary: { buildingHouse: 1, buildingVillage: 0.5, buildingMarket: 0.2 },
    }

    this.mountain = {
      primary: 'stoneMountain',
      secondary: { stoneHill: 1, buildingCabin: 0.5, buildingMine: 0.2 },
    }

    this.landscape = {
      grass: 1,
      grassForest: 0.8,
      grassHill: 0.3,
      buildingMill: 0.4,
      buildingSheep: 0.3,
      buildingCastle: 0.2,
      buildingWall: 0.2,
      buildingWizardTower: 0.2,
      buildingArchery: 0.2,
      buildingSmelter: 0.2,
    }

    this.grass = ['grass', 'grassForest']
    this.sand = ['sand', 'sandRocks']
    this.docks = ['buildingDock', 'buildingPort']
    this.water = { water: 1, waterRocks: 0.05 }
  }
}
