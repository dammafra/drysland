import resources from '@config/resources'
import Block from './block'

export default class Grid {
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
      .filter(resource => resource.type === 'gltfModel')
      .filter(resource => !resource.name.includes('unit'))
      .filter(resource => !resource.name.includes('path'))
      .filter(resource => resource.name.includes('river'))
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
    this.linkableBlocks = this.blocks.filter(b => b.name !== 'water' && b.name !== 'riverStart')
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
    this.linkableBlocks.forEach(block => {
      block.linked = block.links.reduce((linked, edge) => {
        const neighbor = block.neighbors.at(edge)
        if (!neighbor || !neighbor.linked) return linked

        return linked || neighbor.links.includes((edge + 3) % 6)
      }, false)
    })
  }

  resetLinks() {
    this.linkableBlocks.forEach(block => {
      block.linked = false
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
