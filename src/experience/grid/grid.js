import Block from '@blocks/block'
import gridConfig from '@config/grid'
import Experience from '@experience'
import Random from '@utils/random'
import Landscape from './landscape'
import Ocean from './ocean'

const opposite = edge => (edge + 3) % 6
const key = (q, r) => `${q},${r}`

export default class Grid {
  static instance = null
  static radius = gridConfig.minRadius
  static nextButton = null

  #deadEnds = null
  #perimeter = { totalCount: 0, blocks: [] }

  get blocks() {
    return Array.from(this.blocksMap.values())
  }

  get deadEnds() {
    if (!this.#deadEnds) {
      this.#deadEnds = this.blocks.filter(b => b.links.length === 1)
    }

    return this.#deadEnds
  }

  get perimeter() {
    if (this.#perimeter.totalCount !== this.blocksMap.size) {
      this.#perimeter.totalCount = this.blocksMap.size
      this.#perimeter.blocks = this.blocks.filter(block =>
        gridConfig.directions.some(dir => !this.getBlock(block.q + dir.q, block.r + dir.r)),
      )
    }

    return this.#perimeter.blocks
  }

  static {
    Grid.nextButton = document.getElementById('next')
    Grid.nextButton.onclick = Grid.next
  }

  static next() {
    Grid.nextButton.classList.add('hidden')
    Grid.instance?.dispose()
    Grid.instance = new Grid()
  }

  constructor() {
    this.experience = Experience.instance
    this.camera = this.experience.camera
    this.soundPlayer = this.experience.soundPlayer
    this.pointer = this.experience.pointer

    this.radius = Grid.radius++
    this.blocksMap = new Map()

    this.generateGrid()
    this.generateLinks()
    this.addExtraLinks()

    this.blocks.forEach(b => b.setName())
    this.blocks.forEach(b => !b.name && this.blocksMap.delete(b.key))

    this.init()
  }

  async init() {
    this.landscape = new Landscape(this)
    this.ocean = new Ocean(this)

    this.camera.intro()
    this.soundPlayer.play('multiPop')

    await Promise.all(this.blocks.map(b => b.init()))
    this.landscape.init()
  }

  setBlock(q, r) {
    const block = new Block({ grid: this, q, r })
    this.blocksMap.set(block.key, block)
    return block
  }

  getBlock(q, r) {
    return this.blocksMap.get(key(q, r))
  }

  generateGrid() {
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius)
      const r2 = Math.min(this.radius, -q + this.radius)

      for (let r = r1; r <= r2; r++) this.setBlock(q, r)
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
    const targetVisits = Math.floor(this.blocksMap.size * gridConfig.coverageRatio)

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
          this.#deadEnds = null // a dead end could be lost, so recompute on next getter access
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
    block.neighbors = gridConfig.directions
      .map(dir => {
        const q = block.q + dir.q
        const r = block.r + dir.r
        return nameExpression ? this.getBlock(q, r) || this.setBlock(q, r) : this.getBlock(q, r)
      })
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
    const updateNeighborLinks = (block, visited = new Set()) => {
      if (visited.has(block)) return
      visited.add(block)

      block.links.forEach(edge => {
        const neighbor = block.neighbors?.at(edge)
        if (!neighbor?.links.length) return

        if (neighbor.links.includes(opposite(edge))) {
          neighbor.linked = true
          updateNeighborLinks(neighbor, visited)
        }
      })
    }

    this.blocks
      .filter(b => {
        b.linked = false
        return b.name === 'riverStart'
      })
      .forEach(startBlock => {
        updateNeighborLinks(startBlock)
        this.landscape?.updateLinks()
      })

    const linkedCount = this.blocks.filter(b => b.linked).length
    if (linkedCount > this.lastLinkedCount) this.soundPlayer.play('link')
    this.lastLinkedCount = linkedCount
  }

  async checkSolution() {
    // TODO improve
    if (this.blocks.every(b => b.linksKey === b.targetKey)) {
      this.soundPlayer.play('success')
      this.camera.intro()

      Grid.nextButton.classList.remove('hidden')
      this.blocks.forEach(b => {
        if (b.onLeave) {
          b.onLeave()
          this.pointer.remove(b)
        }
      })
    }
  }

  update() {
    this.blocks.forEach(block => block.update())
    this.landscape?.update()
  }

  dispose() {
    this.blocks.forEach(block => block.dispose())
    this.landscape?.dispose()

    delete this.landscape
    delete this.ocean
    delete Grid.instance
  }

  toString() {
    let res = ''
    for (let r = -this.radius; r <= this.radius; r++) {
      let row = ''

      // Add indentation based on the row
      const indent = Math.abs(r)
      row += '\t'.repeat(indent)

      for (let q = -this.radius; q <= this.radius; q++) {
        const block = this.getBlock(q, r)
        if (block) {
          row += block + '\t'
        }
      }

      res += `${row.trimEnd()}\n`
    }

    return res
  }
}
