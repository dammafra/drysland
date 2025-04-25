import Experience from '@experience'
import { CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'

export default class Wind {
  static simplex = new SimplexNoise()

  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.time = this.experience.time

    this.setTexture()
    this.setLines()
  }

  setTexture() {
    // Gradient texture for the lines
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 8
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, 64, 0)
    gradient.addColorStop(0.0, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,128)')
    gradient.addColorStop(1.0, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 8)

    this.texture = new CanvasTexture(canvas)
  }

  setLines() {
    this.lines = []

    for (let i = 0; i < 2; i++) {
      const line = new Mesh(
        new PlaneGeometry(1, 1, 20, 1),
        new MeshBasicMaterial({
          map: this.texture,
          side: DoubleSide,
          transparent: true,
          depthWrite: false,
        }),
      )
      line.pos = line.geometry.getAttribute('position')
      line.rnda = Math.random()
      line.rndb = Math.random()
      line.rndc = Math.random()
      line.rndd = Math.random()
      this.lines.push(line)
      this.scene.add(line)
    }
  }

  flowLine = line => {
    for (let i = 0; i < 42; i++) {
      const t = this.time.elapsed * 0.5 + (i % 21) / 60
      const x = 4 * Math.sin(5 * line.rnda * t + 6 * line.rndb)
      const y = 4 * Math.cos(5 * line.rndc * t + 6 * line.rndd)
      const z =
        this.elevation(x, y) + 0.5 + 0.04 * (i > 20 ? 1 : -1) * Math.cos(((i % 21) - 10) / 8)
      line.pos.setXYZ(i, x, z, -y)
    }
    line.pos.needsUpdate = true
  }

  elevation = (x, y) => {
    if (x * x > 24.9 || y * y > 24.9) return -1
    const major = 0.6 * Wind.simplex.noise(0.1 * x, 0.1 * y)
    const minor = 0.2 * Wind.simplex.noise(0.3 * x, 0.3 * y)
    return major + minor
  }

  update() {
    this.lines.forEach(this.flowLine)
  }

  dispose() {
    this.lines.forEach(line => {
      this.scene.remove(line)
      line.geometry.dispose()
      line.material.dispose()
    })
    this.lines = []
  }
}
