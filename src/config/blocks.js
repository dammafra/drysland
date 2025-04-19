const blocksConfig = {
  getLinks: name => {
    /**
     * Hexagon Edges:
     *
     *  5   / \   0
     *  4  |   |  1
     *  3   \ /   2
     *
     */

    const links = {
      bridge: [1, 4],
      buildingWatermill: [1, 4],
      riverCorner: [0, 4],
      riverCornerSharp: [4, 5],
      riverCrossing: [0, 1, 2, 3, 4, 5],
      riverEnd: [4],
      riverIntersectionA: [0, 4, 5],
      riverIntersectionB: [0, 1, 4],
      riverIntersectionC: [1, 2, 4],
      riverIntersectionD: [0, 1, 2, 4],
      riverIntersectionE: [1, 2, 4, 5],
      riverIntersectionF: [0, 2, 4],
      riverIntersectionG: [0, 1, 2, 4, 5],
      riverIntersectionH: [0, 1, 4, 5],
      riverStart: [4],
      riverStraight: [1, 4],
    }
    return links[name] || []
  },
  isForcedLinked: name => ['riverStart'].includes(name),
  isInteractive: name =>
    name === 'bridge' || name === 'buildingWatermill' || name.includes('river'),
}

export default blocksConfig
