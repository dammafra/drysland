import gridConfig from '@config/grid'
import Random from '@utils/random'
import Block from './block'

const opposite = edge => (edge + 3) % 6

export default class Grid {
  static instance = null

  static shuffle() {
    Grid.instance?.dispose()
    Grid.instance = new Grid(
      Random.integer({ min: gridConfig.minRadius, max: gridConfig.maxRadius }),
    )
  }

  constructor(radius) {
    this.radius = radius

    this.setBlocks()
    this.setNeighbors()

    this.generateMaze()
    this.addExtraLinks()

    this.blocks.forEach(b => b.init())
    this.checkLinks()
  }

  setBlocks() {
    this.blocks = []

    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius)
      const r2 = Math.min(this.radius, -q + this.radius)

      for (let r = r1; r <= r2; r++) {
        this.blocks.push(new Block({ grid: this, q, r }))
      }
    }
  }

  setNeighbors() {
    const directions = [
      { q: -1, r: 0 }, //edge 0: E
      { q: 0, r: -1 }, //edge 1: NE
      { q: 1, r: -1 }, //edge 2: NW
      { q: 1, r: 0 }, //edge 3: W
      { q: 0, r: 1 }, //edge 4: SW
      { q: -1, r: 1 }, //edge 5: SE
    ]

    this.blocks.forEach(block => {
      const neighbors = directions.map(dir =>
        this.blocks.find(b => b.q === block.q + dir.q && b.r === block.r + dir.r),
      )

      block.neighbors = neighbors
    })
  }

  generateMaze() {
    const minLength = this.radius + gridConfig.minPathLength

    const visited = new Set()
    const blacklist = new Set()

    // Start from a random cell
    const start = Random.oneOf(this.blocks)
    visited.add(start.key)

    let attempts = 0
    const maxAttempts = 10000

    while (visited.size < this.blocks.length) {
      if (++attempts > maxAttempts) break // safety limit

      const unvisited = this.blocks.filter(b => !visited.has(b.key) && !blacklist.has(b.key))

      if (!unvisited.length) break

      const walkStart = Random.oneOf(unvisited)
      const pathMap = new Map()
      const pathList = []

      let current = walkStart
      const seen = new Map()

      while (!visited.has(current.key)) {
        // Loop erase
        if (seen.has(current.key)) {
          const loopIndex = pathList.findIndex(b => b.key === current.key)
          pathList.splice(loopIndex + 1)
        } else {
          seen.set(current.key, true)
          pathList.push(current)
        }

        const neighbors = current.neighbors
          .map((n, i) => ({ block: n, dir: i }))
          .filter(({ block }) => !!block)

        if (!neighbors.length) break

        const { block: next, dir } = Random.oneOf(neighbors)
        pathMap.set(current.key, { to: next, dir })
        current = next
      }

      if (pathList.length < minLength) {
        // Mark this start block as unusable
        blacklist.add(walkStart.key)
        continue
      }

      // Commit the walk
      current = walkStart
      while (!visited.has(current.key)) {
        const { to, dir } = pathMap.get(current.key)
        current.links.push(dir)
        to.links.push(opposite(dir))
        visited.add(current.key)
        current = to
      }

      visited.add(current.key)
    }
  }

  addExtraLinks() {
    if (!gridConfig.extraLinkChance) return

    // Find initial dead ends
    const initialDeadEnds = this.blocks.filter(b => b.links.length === 1)
    const preserveAtLeast = Math.floor(initialDeadEnds.length * gridConfig.preserveDeadEndsRatio)
    const preserved = new Set(initialDeadEnds.slice(0, preserveAtLeast).map(b => b.key))

    for (const block of this.blocks) {
      if (!block.links || !block.neighbors || preserved.has(block.key)) continue

      block.neighbors.forEach((neighbor, dir) => {
        if (!Random.boolean(gridConfig.extraLinkChance)) return
        if (!neighbor || !neighbor.links) return

        const alreadyLinked = block.links.includes(dir)
        const bothLinked = neighbor.links.length > 0 && block.links.length > 0

        if (!alreadyLinked && bothLinked && !preserved.has(neighbor.key)) {
          block.links.push(dir)
          neighbor.links.push(opposite(dir))
        }
      })
    }
  }

  checkLinks() {
    this.blocks.forEach(block => (block.linked = false))

    const riverStarts = this.blocks.filter(block => block.name === 'riverStart')

    const checkNeighborLinks = (block, visited = new Set()) => {
      if (visited.has(block)) return
      visited.add(block)

      block.links.forEach(edge => {
        const neighbor = block.neighbors.at(edge)
        if (!neighbor?.links.length) return

        if (neighbor.links.includes(opposite(edge))) {
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
