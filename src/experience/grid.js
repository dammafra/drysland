import gridConfig from '@config/grid'
import Experience from '@experience'
import Random from '@utils/random'
import Block from './block'
import Landscape from './landscape'
import Ocean from './ocean'

const opposite = edge => (edge + 3) % 6

const DIRECTIONS = [
  { q: -1, r: 0 }, //edge 0: E
  { q: 0, r: -1 }, //edge 1: NE
  { q: 1, r: -1 }, //edge 2: NW
  { q: 1, r: 0 }, //edge 3: W
  { q: 0, r: 1 }, //edge 4: SW
  { q: -1, r: 1 }, //edge 5: SE
]

export default class Grid {
  static instance = null
  static radius = gridConfig.minRadius

  get deadEnds() {
    return this.blocks.filter(b => b.links.length === 1)
  }

  get perimeter() {
    return this.blocks.filter(block =>
      DIRECTIONS.some(
        dir => !this.blocks.find(b => b.q === block.q + dir.q && b.r === block.r + dir.r),
      ),
    )
  }

  static {
    document.getElementById('shuffle').onclick = Grid.shuffle
  }

  static shuffle() {
    Grid.instance?.dispose()
    Grid.instance = new Grid()
  }

  constructor() {
    this.experience = Experience.instance
    this.camera = this.experience.camera

    this.radius = Grid.radius++

    this.setBlocks()

    this.generateLinks()
    this.addExtraLinks()

    this.blocks.forEach(b => b.setName())
    this.blocks = this.blocks.filter(b => !!b.name)

    new Landscape(this)
    new Ocean(this)

    this.blocks.forEach(b => b.init())
    this.updateLinks()
    this.camera.intro()
  }

  getBlock(q, r, create = false) {
    let block = this.blocks.find(b => b.q === q && b.r === r)

    if (create && !block) {
      block = new Block({ grid: this, q, r })
      this.blocks.push(block)
    }

    return block
  }

  setBlocks() {
    this.blocks = []

    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius)
      const r2 = Math.min(this.radius, -q + this.radius)

      for (let r = r1; r <= r2; r++) this.getBlock(q, r, true)
    }

    this.blocks.forEach(b => this.addNeighbors(b))
  }

  /**
   * Growing Tree algorithm
   * https://weblog.jamisbuck.org/2011/1/27/maze-generation-growing-tree-algorithm
   */
  generateLinks() {
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

    debug.groupCollapsed('Grid.generateLinks')
    debug.log(this.toString())
    debug.log('start from', start.key)

    while (frontier.length && visited.size < targetVisits) {
      const logs = []

      const current = select(frontier, 1)
      logs.push('current: ' + current)

      const neighbors = current.neighbors
        ?.map((n, dir) => ({ block: n, dir }))
        .filter(({ block }) => block && !visited.has(block.key))

      if (!neighbors?.length) {
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

  addExtraLinks() {
    const preserved = new Set(this.deadEnds.slice(0, gridConfig.minDeadEnds).map(b => b.key))

    for (const block of this.blocks) {
      if (preserved.has(block.key)) continue

      block.neighbors?.forEach((neighbor, dir) => {
        if (!neighbor || block.links.includes(dir)) return
        if (neighbor.links.includes(opposite(dir))) return

        const bothLinked = block.links.length > 0 && neighbor.links.length > 0
        const neighborPreserved = preserved.has(neighbor.key)

        if (bothLinked && !neighborPreserved && Random.boolean(gridConfig.extraLinksChance)) {
          block.links.push(dir)
          neighbor.links.push(opposite(dir))
        }
      })
    }
  }

  addPerimeter(nameExpression, dimension = 1) {
    for (let i = 0; i < dimension; i++) {
      this.perimeter.forEach(b => this.addNeighbors(b, nameExpression))
    }
  }

  addNeighbors(block, nameExpression) {
    // prettier-ignore
    block.neighbors = DIRECTIONS
      .map(dir =>this.getBlock(block.q + dir.q, block.r + dir.r, !!nameExpression))
      .map(n => this.renameBlock(n, nameExpression))
  }

  renameBlock(block, nameExpression) {
    if (!block) return

    if (!block.name) {
      block.name =
        typeof nameExpression === 'string'
          ? nameExpression
          : typeof nameExpression === 'function'
            ? nameExpression()
            : undefined
    }

    return block
  }

  updateLinks() {
    this.blocks.forEach(block => (block.linked = false))

    const riverStarts = this.blocks.filter(block => block.name === 'riverStart')

    const checkNeighborLinks = (block, visited = new Set()) => {
      if (visited.has(block)) return
      visited.add(block)

      block.links.forEach(edge => {
        const neighbor = block.neighbors?.at(edge)
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

  async checkSolution() {
    // TODO improve
    if (this.blocks.every(b => b.linksKey === b.targetKey)) {
      await this.camera.intro()
      alert('Level Completed 🎉')
      Grid.shuffle()
    }
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
