import WaterBlock from '@blocks/water-block'
import Experience from '@experience'
import { dispose } from '@utils/dispose'
import Random from '@utils/random'
import gsap from 'gsap'
import Path from './path'

export default class Ship {
  constructor(radius) {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.scene = this.experience.scene
    this.path = new Path(radius, 0.005)

    this.name = Random.oneOf('ship', 'boat')
    this.scale = this.name === 'ship' ? 0.2 : 0.005
    this.rotationOffset = this.name === 'ship' ? 0 : -Math.PI * 0.5
    this.elevationOffset = this.name === 'ship' ? 0.05 : 0.1

    this.setMesh()
    this.init()
  }

  init() {
    this.mesh.traverse(child => {
      if (child.isMesh) {
        gsap.to(child.material, { opacity: 1, duration: 2 })
      }
    })
  }

  setMesh() {
    this.mesh = this.resources.items[this.name].scene.children.at(0).clone()
    this.mesh.traverse(child => {
      if (child.isMesh) {
        child.material.transparent = true
        child.material.opacity = 0
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    this.mesh.scale.setScalar(this.scale)
    this.scene.add(this.mesh)
  }

  update() {
    const { position, angle } = this.path.update()

    this.mesh.position.copy(position)
    this.mesh.position.y =
      WaterBlock.getElevation(position, this.time.elapsed) + this.elevationOffset
    this.mesh.rotation.y = angle + this.rotationOffset
  }

  dispose() {
    dispose(this.mesh)
    this.scene.remove(this.mesh)
    delete this.mesh
    delete this.pathPoints
    delete this.curve
  }
}
