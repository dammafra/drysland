import Block from './block'

export default class Grid {
  static instance = null

  static shuffle() {
    Grid.instance?.dispose()
    const radius = Math.floor(Math.random() * 10) + 2
    Grid.instance = new Grid(radius)
  }

  constructor(radius) {
    this.radius = radius
    this.totalRadius = this.radius + 3

    this.setBlocks()
    this.setLinkableBlocks()
    this.setBlocksNeighbors()
    this.generateMaze(this.radius)
    this.addExtraLinks(0)
    this.addFarLinks(1)
    this.blocks.forEach(b => b.init())

    this.linkableBlocks = this.blocks.filter(b => !!b.links.length)

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

  generateMaze(minLength = this.radius) {
    const getKey = (q, r) => `${q},${r}`
    const visited = new Set()
    const blocks = this.linkableBlocks
    const blacklist = new Set()

    // Start from a random cell
    const start = blocks[Math.floor(Math.random() * blocks.length)]
    visited.add(getKey(start.q, start.r))

    let safety = 0

    while (visited.size < blocks.length) {
      if (++safety > 10000) break // safety limit

      const unvisited = blocks.filter(b => {
        const key = getKey(b.q, b.r)
        return !visited.has(key) && !blacklist.has(key)
      })

      if (!unvisited.length) break

      const walkStart = unvisited[Math.floor(Math.random() * unvisited.length)]
      const pathMap = new Map()
      const pathList = []

      let current = walkStart
      const seen = new Map()

      while (!visited.has(getKey(current.q, current.r))) {
        const k = getKey(current.q, current.r)

        // Loop erase
        if (seen.has(k)) {
          const loopIndex = pathList.findIndex(b => getKey(b.q, b.r) === k)
          pathList.splice(loopIndex + 1)
        } else {
          seen.set(k, true)
          pathList.push(current)
        }

        const neighbors = current.neighbors
          .map((n, i) => ({ block: n, dir: i }))
          .filter(({ block }) => block && blocks.includes(block))

        if (!neighbors.length) break

        const { block: next, dir } = neighbors[Math.floor(Math.random() * neighbors.length)]
        pathMap.set(getKey(current.q, current.r), { to: next, dir })
        current = next
      }

      if (pathList.length < minLength) {
        // Mark this start block as unusable
        blacklist.add(getKey(walkStart.q, walkStart.r))
        continue
      }

      // Commit the walk
      current = walkStart
      while (!visited.has(getKey(current.q, current.r))) {
        const { to, dir } = pathMap.get(getKey(current.q, current.r))
        current.links.push(dir)
        to.links.push((dir + 3) % 6)
        visited.add(getKey(current.q, current.r))
        current = to
      }

      visited.add(getKey(current.q, current.r))
    }
  }

  addExtraLinks(probability = 0.1, preserveAtLeast = 1) {
    const getKey = (q, r) => `${q},${r}`

    // Find initial dead ends
    const isDeadEnd = block => block.links.length === 1
    const initialDeadEnds = this.linkableBlocks.filter(isDeadEnd)
    const preserved = new Set(initialDeadEnds.slice(0, preserveAtLeast).map(b => getKey(b.q, b.r)))

    for (const block of this.linkableBlocks) {
      const key = getKey(block.q, block.r)
      if (!block.links || !block.neighbors || preserved.has(key)) continue

      block.neighbors.forEach((neighbor, i) => {
        if (!neighbor || !neighbor.links) return

        const opp = (i + 3) % 6
        const alreadyLinked = block.links.includes(i)
        const bothLinked = neighbor.links.length > 0 && block.links.length > 0
        const neighborKey = getKey(neighbor.q, neighbor.r)

        if (!alreadyLinked && bothLinked && !preserved.has(neighborKey)) {
          if (Math.random() < probability) {
            block.links.push(i)
            neighbor.links.push(opp)
          }
        }
      })
    }
  }

  addFarLinks(chance = 0.05, minDistance = 2) {
    const getKey = (q, r) => `${q},${r}`
    const blocks = this.linkableBlocks

    for (const block of blocks) {
      for (const [i, neighbor] of block.neighbors.entries()) {
        if (!neighbor || block.links.includes(i)) continue

        // Skip if they're already neighbors
        const isAlreadyLinked = neighbor.links.includes((i + 3) % 6)
        if (isAlreadyLinked) continue

        // Check distance
        const dx = block.q - neighbor.q
        const dy = block.r - neighbor.r
        const dz = -block.q - block.r - (-neighbor.q - neighbor.r)

        const distance = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz))
        if (distance < minDistance) continue

        // Both should be already in the maze
        if (block.links.length && neighbor.links.length && Math.random() < chance) {
          block.links.push(i)
          neighbor.links.push((i + 3) % 6)
        }
      }
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
