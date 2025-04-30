import Experience from '@experience'
import Random from '@utils/random'
import { CatmullRomCurve3, Vector3 } from 'three'

export default class Path {
  constructor(radius, speed) {
    this.experience = Experience.instance
    this.time = this.experience.time
    this.radius = radius
    this.speed = speed

    this.setPath()
  }

  setPath() {
    const pointCount = 16
    this.pathPoints = []

    let currentAngle = Random.float({ min: 0, max: Math.PI * 2 })
    const direction = Random.boolean() ? 1 : -1

    for (let i = 0; i < pointCount; i++) {
      const angleStep = (Math.PI * 2) / pointCount
      currentAngle += direction * angleStep * Random.float({ min: 0.8, max: 1.2 })

      const r = Random.float({
        min: this.radius ? this.radius + 7 : 1,
        max: this.radius ? this.radius + 10 : 20,
      })
      const x = Math.cos(currentAngle) * r
      const z = Math.sin(currentAngle) * r

      this.pathPoints.push(new Vector3(x, 0, z))
    }

    this.pathPoints.push(this.pathPoints[0].clone())

    this.curve = new CatmullRomCurve3(this.pathPoints, true)
    this.curve.arcLengthDivisions = 200
    this.pathProgress = 0
  }

  update() {
    this.pathProgress = (this.pathProgress + this.time.delta * this.speed) % 1

    const position = this.curve.getPointAt(this.pathProgress)

    const tangent = this.curve.getTangentAt(this.pathProgress)
    const angle = Math.atan2(tangent.x, tangent.z)

    return { position, angle }
  }

  dispose() {
    delete this.pathPoints
    delete this.curve
  }
}
