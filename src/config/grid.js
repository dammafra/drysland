const gridConfig = {
  minRadius: 2,
  maxRadius: 8,
  coverageRatio: 0.6,
  extraLinksChance: 0.05,
  minDeadEnds: 2,
  directions: [
    { q: -1, r: 0 }, //edge 0: E
    { q: 0, r: -1 }, //edge 1: NE
    { q: 1, r: -1 }, //edge 2: NW
    { q: 1, r: 0 }, //edge 3: W
    { q: 0, r: 1 }, //edge 4: SW
    { q: -1, r: 1 }, //edge 5: SE
  ],
}

export default gridConfig
