import resources from '@config/resources'
import Block from './block'

export default class Grid {
  constructor(radius) {
    this.radius = radius
    this.blocks = []

    this.init()
  }

  init() {
    const keys = resources
      .filter(resource => resource.type === 'gltfModel')
      .filter(resource => !resource.name.includes('unit'))
      .filter(resource => !resource.name.includes('path'))
      .map(resource => resource.name)

    // Create hexagonal grid around center
    for (let q = -this.radius; q <= this.radius; q++) {
      const r1 = Math.max(-this.radius, -q - this.radius)
      const r2 = Math.min(this.radius, -q + this.radius)

      for (let r = r1; r <= r2; r++) {
        const block = new Block(keys[Math.floor(Math.random() * keys.length)])

        // Convert axial coordinates to cartesian
        block.position.x = q + r * 0.5
        block.position.z = r * 0.866 // sqrt(3)/2

        this.blocks.push(block)
      }
    }
  }

  dispose() {
    this.blocks.forEach(block => block.dispose())
  }

  update() {
    // this.blocks.forEach(block => block.update())
  }
}
