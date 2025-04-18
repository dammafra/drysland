import resources from '@config/resources'
import Block from './block'

export default class Grid {
  constructor(radius) {
    this.radius = radius
    this.totalRadius = this.radius + 3
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
    for (let q = -this.totalRadius; q <= this.totalRadius; q++) {
      const r1 = Math.max(-this.totalRadius, -q - this.totalRadius)
      const r2 = Math.min(this.totalRadius, -q + this.totalRadius)

      for (let r = r1; r <= r2; r++) {
        // Check if this position is within the inner radius
        const isInnerGrid =
          Math.abs(q) <= this.radius && Math.abs(r) <= this.radius && Math.abs(q + r) <= this.radius

        this.blocks.push(
          new Block({
            name: isInnerGrid ? keys[Math.floor(Math.random() * keys.length)] : 'water',
            // Convert axial coordinates to cartesian
            x: q + r * 0.5,
            y: r * 0.866, // sqrt(3)/2
          }),
        )
      }
    }
  }

  update() {
    this.blocks.forEach(block => block.update())
  }

  dispose() {
    this.blocks.forEach(block => block.dispose())
  }
}
