import resources from '@config/resources'
import Block from './block'

export default class Grid {
  constructor(width, height) {
    this.width = width
    this.height = height

    this.blocks = []

    this.init()
  }

  init() {
    const keys = resources
      .filter(resource => resource.type === 'gltfModel')
      .map(resource => resource.name)

    for (let row = -this.height / 2; row < this.height / 2; row++) {
      for (let col = -this.width / 2; col < this.width / 2; col++) {
        const block = new Block(keys[Math.floor(Math.random() * keys.length)])
        block.position.x = row % 2 ? col + 0.5 : col
        block.position.z = row * 0.865

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
