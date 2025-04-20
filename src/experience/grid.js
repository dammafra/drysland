import Block from './block'

export default class Grid {
  static instance = null

  static shuffle() {
    Grid.instance?.dispose()
    const radius = Math.floor(Math.random() * 5) + 1
    Grid.instance = new Grid(radius)
  }

  constructor(radius) {
    this.radius = radius
    this.totalRadius = this.radius + 3

    this.setBlocks()
    this.setLinkableBlocks()
    this.setBlocksNeighbors()
    this.generateMaze()
    this.blocks.forEach(b => b.init())

    this.checkLinks()
  }

  setBlocks() {
    this.blocks = []

    // Create hexagonal grid around center
    for (let q = -this.totalRadius; q <= this.totalRadius; q++) {
      const r1 = Math.max(-this.totalRadius, -q - this.totalRadius)
      const r2 = Math.min(this.totalRadius, -q + this.totalRadius)

      for (let r = r1; r <= r2; r++) {
        // Check if this position is within the inner radius
        const isInnerGrid =
          Math.abs(q) <= this.radius && Math.abs(r) <= this.radius && Math.abs(q + r) <= this.radius

        const name = isInnerGrid ? null : 'water'

        this.blocks.push(new Block({ grid: this, name, q, r }))
      }
    }
  }

  setLinkableBlocks() {
    this.linkableBlocks = this.blocks.filter(b => !b.name)
  }

  setBlocksNeighbors() {
    const directions = [
      { q: -1, r: 0 }, //edge 0: E
      { q: 0, r: -1 }, //edge 1: NE
      { q: 1, r: -1 }, //edge 2: NW
      { q: 1, r: 0 }, //edge 3: W
      { q: 0, r: 1 }, //edge 4: SW
      { q: -1, r: 1 }, //edge 5: SE
    ]

    this.linkableBlocks.forEach(block => {
      const neighbors = directions.map(dir =>
        this.blocks.find(b => b.q === block.q + dir.q && b.r === block.r + dir.r),
      )

      block.neighbors = neighbors
    })
  }

  generateMaze(seedCount = 3, coverage = 0.8) {
    const visited = new Set()
    const frontier = []
    const totalCells = this.linkableBlocks.length
    const targetCells = Math.floor(totalCells * coverage)

    const getKey = (q, r) => `${q},${r}`

    // 1. Pick N random seeds
    for (let i = 0; i < seedCount; i++) {
      const seed = this.linkableBlocks[Math.floor(Math.random() * this.linkableBlocks.length)]
      const key = getKey(seed.q, seed.r)
      if (visited.has(key)) continue

      visited.add(key)
      // Add unvisited neighbors to frontier
      seed.neighbors.forEach((neighbor, direction) => {
        if (neighbor && !visited.has(getKey(neighbor.q, neighbor.r))) {
          frontier.push({ from: seed, to: neighbor, direction })
        }
      })
    }

    let visitedCount = visited.size

    while (frontier.length && visitedCount < targetCells) {
      const index = Math.floor(Math.random() * frontier.length)
      const { from, to, direction } = frontier.splice(index, 1)[0]

      const toKey = getKey(to.q, to.r)
      if (visited.has(toKey)) continue

      // Link them
      if (!from.links.includes(direction)) {
        from.links.push(direction)
      }

      if (!to.links.includes((direction + 3) % 6)) {
        to.links.push((direction + 3) % 6) // opposite direction on hex
      }

      visited.add(toKey)
      visitedCount++

      // Add unvisited neighbors of 'to' to frontier
      to.neighbors.forEach((neighbor, direction) => {
        if (neighbor && !visited.has(getKey(neighbor.q, neighbor.r))) {
          frontier.push({ from: to, to: neighbor, direction })
        }
      })
    }
  }

  checkLinks() {
    this.linkableBlocks.forEach(block => (block.linked = false))

    const riverStarts = this.linkableBlocks.filter(block => block.name === 'riverStart')

    const checkNeighborLinks = (block, visited = new Set()) => {
      if (visited.has(block)) return
      visited.add(block)

      block.links.forEach(edge => {
        const neighbor = block.neighbors.at(edge)
        if (!neighbor?.links.length) return

        const oppositeEdge = (edge + 3) % 6
        if (neighbor.links.includes(oppositeEdge)) {
          neighbor.linked = true
          checkNeighborLinks(neighbor, visited)
        }
      })
    }

    riverStarts.forEach(startBlock => {
      startBlock.linked = true
      checkNeighborLinks(startBlock)
    })
  }

  update() {
    this.blocks.forEach(block => block.update())
  }

  dispose() {
    this.blocks.forEach(block => block.dispose())
    this.blocks = []
  }
}
