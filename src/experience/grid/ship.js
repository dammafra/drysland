import WaterBlock from '@blocks/water-block'
import Experience from '@experience'
import Random from '@utils/random'
import gsap from 'gsap'
import { CatmullRomCurve3, Vector3 } from 'three'

export default class Ship {
  constructor(radius) {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.time = this.experience.time
    this.scene = this.experience.scene

    this.setMesh()
    this.setPath(radius)
    this.init()
  }

  init() {
    gsap.to(this.mesh.material, { opacity: 1, duration: 2 })
  }

  setMesh() {
    this.mesh = this.resources.items.unitShipLarge.scene.children.at(0).clone()
    this.mesh.material.transparent = true
    this.mesh.material.opacity = 0
    this.scene.add(this.mesh)
  }

  setPath(radius) {
    const pointCount = 8
    this.pathPoints = []

    for (let i = 0; i < pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2 // Loops around a full circle (0 to 2π) divided into pointCount
      const r = Random.float({ min: radius + 6, max: radius + 8 })
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      this.pathPoints.push(new Vector3(x, 0, z))
    }

    this.pathPoints.push(this.pathPoints[0].clone())

    this.curve = new CatmullRomCurve3(this.pathPoints, true)
    this.curve.arcLengthDivisions = 200
    this.pathProgress = 0
  }

  update() {
    const speed = 0.005
    this.pathProgress = (this.pathProgress + this.time.delta * speed) % 1

    const position = this.curve.getPointAt(this.pathProgress)
    this.mesh.position.copy(position)
    this.mesh.position.y = WaterBlock.getElevation(position, this.time.elapsed) + 0.1

    const tangent = this.curve.getTangentAt(this.pathProgress)
    const angle = Math.atan2(tangent.x, tangent.z)
    this.mesh.rotation.y = angle + Math.PI * 0.5
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.scene.remove(this.mesh)
    delete this.mesh
    delete this.pathPoints
    delete this.curve
  }
}
