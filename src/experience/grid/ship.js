import WaterBlock from '@blocks/water-block'
import gridConfig from '@config/grid'
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
    this.path = new Path(radius)

    this.name = Random.oneOf(Object.keys(gridConfig.landscape.ship.models))
    this.scale = gridConfig.landscape.ship.models[this.name].scale
    this.rotationOffset = gridConfig.landscape.ship.models[this.name].rotationOffset
    this.elevationOffset = gridConfig.landscape.ship.models[this.name].elevationOffset

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
    const speed = gridConfig.landscape.ship.speed * 0.1
    const { position, angle } = this.path.update(speed)

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
