const rivers = [
  'riverBridge',
  'riverCorner',
  'riverCornerSharp',
  'riverCrossing',
  'riverIntersectionA',
  'riverIntersectionB',
  'riverIntersectionC',
  'riverIntersectionD',
  'riverIntersectionE',
  'riverIntersectionF',
  'riverIntersectionG',
  'riverIntersectionH',
  'riverStart',
  'riverStraight',
  'riverWatermill',
]

const others = ['water', 'grassForest']

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
  0: ['riverStart'],

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
  rivers,
  others,
  links,
  linksMap,
}

export default blocksConfig
