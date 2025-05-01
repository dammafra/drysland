const water = { water: 1, waterRocks: 0.05 }
const sand = ['sand', 'sandRocks']
const docks = ['buildingDock', 'buildingPort']
const grass = ['grass', 'grassForest']
const city = { buildingHouse: 1, buildingVillage: 0.5, buildingMarket: 0.2 }
const mountain = { stoneHill: 1, buildingCabin: 0.5, buildingMine: 0.2 }
const landscape = {
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

/**
 * Hexagon Edges:
 *
 *     1 /\ 2
 *   0  |  |  3
 *     5 \/ 4
 *
 */

const linksMap = {
  // one edge
  0: ['riverStart', 'riverEnd'],

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

const links = Object.keys(linksMap)

const blocksConfig = {
  water,
  sand,
  docks,
  grass,
  city,
  mountain,
  landscape,

  links,
  linksMap,
}

export const isRiverStart = block => block.name === 'riverStart'
export const isSand = block => block.name.includes('sand')
export const isDock = block => docks.includes(block.name)
export const isWater = block => block.name.includes('water')

export const setWater = block => (block.name = 'water')

export default blocksConfig
