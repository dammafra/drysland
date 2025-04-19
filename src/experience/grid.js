import resources from '@config/resources'
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

    this.checkLinks()
  }

  setBlocks() {
    const names = resources
      .filter(r => !r.skip)
      .filter(resource => resource.type === 'gltfModel')
      .filter(resource => !resource.name.includes('unit'))
      .map(resource => resource.name)

    const randomName = () => names[Math.floor(Math.random() * names.length)]

    this.blocks = []

    // Create hexagonal grid around center
    for (let q = -this.totalRadius; q <= this.totalRadius; q++) {
      const r1 = Math.max(-this.totalRadius, -q - this.totalRadius)
      const r2 = Math.min(this.totalRadius, -q + this.totalRadius)

      for (let r = r1; r <= r2; r++) {
        // Check if this position is within the inner radius
        const isInnerGrid =
          Math.abs(q) <= this.radius && Math.abs(r) <= this.radius && Math.abs(q + r) <= this.radius

        const name = isInnerGrid ? randomName() : 'water'

        this.blocks.push(new Block({ grid: this, name, q, r }))
      }
    }
  }

  setLinkableBlocks() {
    this.linkableBlocks = this.blocks.filter(b => !!b.links.length)
  }

  setBlocksNeighbors() {
    const directions = [
      { q: 1, r: -1 }, //edge 0
      { q: 1, r: 0 }, //edge 1
      { q: 0, r: 1 }, //edge 2
      { q: -1, r: 1 }, //edge 3
      { q: -1, r: 0 }, //edge 4
      { q: 0, r: -1 }, //edge 5
    ]

    this.linkableBlocks.forEach(block => {
      const neighbors = directions
        .map(dir => this.blocks.find(b => b.q === block.q + dir.q && b.r === block.r + dir.r))
        .filter(Boolean)

      block.neighbors = neighbors
    })
  }

  checkLinks() {
    this.linkableBlocks.forEach(block => (block.linked = false))

    const riverStarts = this.linkableBlocks.filter(block => block.name === 'riverStart')

    const checkNeighborLinks = (block, visited = new Set()) => {
      if (visited.has(block)) return
      visited.add(block)

      block.links.forEach(edge => {
        const neighbor = block.neighbors.at(edge)
        if (!neighbor) return

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
