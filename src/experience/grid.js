import resources from '@config/resources'
import Block from './block'

export default class Grid {
  constructor(radius) {
    this.radius = 2
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
        this.blocks.push(
          new Block({
            name: keys[Math.floor(Math.random() * keys.length)],

            // Convert axial coordinates to cartesian
            x: q + r * 0.5,
            y: r * 0.866, // sqrt(3)/2
          }),
        )
      }
    }
  }

  dispose() {
    this.blocks.forEach(block => block.dispose())
  }
}
