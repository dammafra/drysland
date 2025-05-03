import LandscapeConfig from '@config/landscape'
import Experience from '@experience'
import { dispose } from '@utils/dispose'
import gsap from 'gsap'
import { CanvasTexture, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise'

export default class Wind {
  static texture

  static simplex = new SimplexNoise()

  constructor() {
    this.experience = Experience.instance
    this.scene = this.experience.scene
    this.time = this.experience.time

    this.setTexture()
    this.setLine()
    this.init()
  }

  init() {
    gsap.to(this.line.material, { opacity: 1, duration: 2 })
  }

  setTexture() {
    if (Wind.texture) return

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

    Wind.texture = new CanvasTexture(canvas)
  }

  setLine() {
    this.line = new Mesh(
      new PlaneGeometry(1, 1, 20, 1),
      new MeshBasicMaterial({
        map: Wind.texture,
        side: DoubleSide,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    )

    this.line.pos = this.line.geometry.getAttribute('position')
    this.line.rnda = Math.random()
    this.line.rndb = Math.random()
    this.line.rndc = Math.random()
    this.line.rndd = Math.random()

    this.scene.add(this.line)
  }

  getElevation(x, y) {
    if (x * x > 24.9 || y * y > 24.9) return -1
    const major = 0.6 * Wind.simplex.noise(0.1 * x, 0.1 * y)
    const minor = 0.2 * Wind.simplex.noise(0.3 * x, 0.3 * y)
    return major + minor
  }

  update() {
    const speed = LandscapeConfig.instance.wind.speed

    for (let i = 0; i < 42; i++) {
      const t = this.time.elapsed * speed + (i % 21) / 60
      const x = 4 * Math.sin(5 * this.line.rnda * t + 6 * this.line.rndb)
      const y = 4 * Math.cos(5 * this.line.rndc * t + 6 * this.line.rndd)
      const z = this.getElevation(x, y) + 0.5 + 0.04 * (i > 20 ? 1 : -1) * Math.cos(((i % 21) - 10) / 8) // prettier-ignore
      this.line.pos.setXYZ(i, x, z, -y)
    }

    this.line.pos.needsUpdate = true
  }

  dispose() {
    dispose(this.line)
    this.scene.remove(this.line)
    delete this.line
  }
}
