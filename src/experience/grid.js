import gridConfig from '@config/grid'
import Experience from '@experience'
import Random from '@utils/random'
import Block from './block'

const opposite = edge => (edge + 3) % 6

export default class Grid {
  static instance = null

  static {
    document.getElementById('shuffle').onclick = Grid.shuffle
  }

  static shuffle() {
    Grid.instance?.dispose()
    Grid.instance = new Grid(
      Random.integer({ min: gridConfig.minRadius, max: gridConfig.maxRadius }),
    )
  }

  constructor(radius) {
    this.experience = Experience.instance
    this.camera = this.experience.camera

    this.radius = radius

    this.setBlocks()
    this.setNeighbors()

    this.generateMaze()

    this.blocks.forEach(b => b.setName())
    // TODO: grid tweaks...
    this.blocks.forEach(b => b.init())

    this.checkLinks()

    this.camera.intro()
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

  /**
   * Growing Tree algorithm
   * https://weblog.jamisbuck.org/2011/1/27/maze-generation-growing-tree-algorithm
   */
  generateMaze() {
    const visited = new Set()
    const frontier = []
    const targetVisits = Math.floor(this.blocks.length * gridConfig.coverageRatio)

    // Selection strategy:
    // 1. DFS style: pick last           --> frontier.at(-1)
    // 2. BFS style: pick first          --> frontier.at(0)
    // 3. Prim style: pick random        --> Random.oneOf(frontier)
    // - Balanced: use middle or weighted
    // - Mixed
    const select = (frontier, strategy) => {
      // prettier-ignore
      switch (strategy) {
        case 1: return frontier.at(-1)
        case 2: return frontier.at(0)
        case 3: return Random.oneOf(frontier)
        default:
          debug.warn('The selected strategy doe not exixt, fallback to DFS')
          return frontier.at(-1)
      }
    }

    const start = Random.oneOf(this.blocks)
    visited.add(start.key)
    frontier.push(start)

    debug.groupCollapsed('Grid.generateMaze')
    debug.log(this.toString())
    debug.log('start from', start.key)

    while (frontier.length && visited.size < targetVisits) {
      const logs = []

      const current = select(frontier, 1)
      logs.push('current: ' + current)

      const neighbors = current.neighbors
        .map((n, dir) => ({ block: n, dir }))
        .filter(({ block }) => block && !visited.has(block.key))

      if (!neighbors.length) {
        // Dead end reached, backtrack
        frontier.splice(frontier.indexOf(current), 1)
        logs.push('dead end, backtrack')
      } else {
        const { block: next, dir } = Random.oneOf(neighbors)
        logs.push('next: ' + next)

        // Link both blocks
        current.links.push(dir)
        next.links.push(opposite(dir))

        visited.add(next.key)
        frontier.push(next)
      }

      debug.log(logs.join(' ->\t'))
    }

    debug.groupEnd()
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

  toString() {
    let res = ''
    for (let r = -this.radius; r <= this.radius; r++) {
      let row = ''

      // Add indentation based on the row
      const indent = Math.abs(r)
      row += '\t'.repeat(indent)

      for (let q = -this.radius; q <= this.radius; q++) {
        const block = this.blocks.find(b => b.q === q && b.r === r)
        if (block) {
          row += block + '\t'
        }
      }

      res += `${row.trimEnd()}\n`
    }

    return res
  }
}
