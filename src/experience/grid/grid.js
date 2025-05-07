import Block from '@blocks/block'
import GridConfig from '@config/grid'
import Experience from '@experience'
import UI from '@ui/ui'
import Random from '@utils/random'
import { Vector3 } from 'three'
import Landscape from './landscape'
import Ocean from './ocean'
import Tutorial from './tutorial'

const opposite = edge => (edge + 3) % 6
const key = (q, r) => `${q},${r}`

export default class Grid {
  static center = new Vector3(0, 0, 0)

  #riverBlocks = null
  #deadEnds = null
  #perimeter = { totalCount: 0, blocks: [] }

  get blocks() {
    return Array.from(this.blocksMap.values())
  }

  get riverBlocks() {
    if (!this.#riverBlocks) {
      this.#riverBlocks = this.blocks.filter(b => b.links.length)
    }

    return this.#riverBlocks
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
        GridConfig.instance.directions.some(
          dir => !this.getBlock(block.q + dir.q, block.r + dir.r),
        ),
      )
    }

    return this.#perimeter.blocks
  }

  constructor({ level, blocks, radius, coverage, extraLinks, minDeadEnds, linksOnly }) {
    this.experience = Experience.instance
    this.camera = this.experience.camera
    this.soundPlayer = this.experience.soundPlayer
    this.pointer = this.experience.pointer
    this.blocksMap = new Map()

    this.level = level
    this.radius = radius
    this.coverage = coverage
    this.extraLinks = extraLinks
    this.minDeadEnds = minDeadEnds
    this.linksOnly = linksOnly

    if (blocks) {
      blocks.forEach(b => this.blocksMap.set(b.key, new Block({ grid: this, ...b })))
      this.blocks.forEach(b => this.addNeighbors(b))
    } else {
      this.generateGrid()
      this.generateLinks()
      this.addExtraLinks()

      this.blocks.forEach(b => b.setName())
      this.blocks.forEach(b => !b.name && this.blocksMap.delete(b.key))
    }

    this.init()

    this.experience.levelStart()
    if (this.level === 1) {
      this.tutorial = new Tutorial(this)
    }

    this.updateLinks()
    this.checkSolution()
  }

  async init() {
    if (!this.linksOnly) {
      this.landscape = new Landscape(this)
      this.ocean = new Ocean(this)
    }

    UI.menuButton.disable()
    this.soundPlayer.play('multiPop')
    await Promise.all(this.blocks.map(b => b.init()))

    this.landscape?.init()
    this.experience.save()
    UI.menuButton.enable()
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
    const targetVisits = Math.floor(this.blocksMap.size * this.coverage)

    const start = Random.oneOf(this.blocks)
    visited.add(start.key)
    frontier.push(start)

    while (frontier.length && visited.size < targetVisits) {
      const logs = []

      const current = GridConfig.instance.applySelectionStrategy(frontier)
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
    }
  }

  addExtraLinks() {
    const preserved = new Set(this.deadEnds.slice(0, this.minDeadEnds).map(b => b.key))

    for (const block of this.blocks) {
      if (preserved.has(block.key)) continue

      block.neighbors?.forEach((neighbor, dir) => {
        if (!neighbor || block.links.includes(dir)) return
        if (neighbor.links.includes(opposite(dir))) return

        const bothLinked = block.links.length > 0 && neighbor.links.length > 0
        const neighborPreserved = preserved.has(neighbor.key)

        if (bothLinked && !neighborPreserved && Random.boolean(this.extraLinks)) {
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
    block.neighbors = GridConfig.instance.directions
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
        b.invalid = false
        return b.isRiverStart
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
    if (!this.riverBlocks.every(b => b.linked)) return

    // TODO improve
    if (this.riverBlocks.every(b => b.linksKey === b.targetKey)) {
      this.riverBlocks.forEach(b => {
        b.onLeave()
        this.pointer.remove(b)
      })

      this.tutorial?.third()
      this.experience.levelComplete()
    } else {
      this.riverBlocks.forEach(b => {
        if (b.isRiverStart) return

        const invalid = b.links.some(edge => {
          const neighbor = b.neighbors?.at(edge)
          if (!neighbor) return true // no neighbor where there should be one
          return !neighbor.links.includes(opposite(edge)) // neighbor does not link back
        })

        b.invalid = invalid
      })
    }
  }

  update() {
    this.blocks.forEach(block => block.update())
    this.landscape?.update()
  }

  setShadows(value) {
    this.riverBlocks.forEach(b => (b.mesh.receiveShadow = value))
  }

  dispose() {
    this.blocks.forEach(block => block.dispose())
    this.landscape?.dispose()
    this.tutorial?.dispose()

    delete this.landscape
    delete this.ocean
  }

  serialize() {
    return this.riverBlocks.map(b => ({
      key: b.key,
      name: b.name,
      q: b.q,
      r: b.r,
      links: b.links,
      target: b.target,
      rotation: b.rotation,
    }))
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
