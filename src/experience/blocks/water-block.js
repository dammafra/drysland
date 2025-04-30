import Experience from '@experience'
import Grid from '@grid/grid'
import { dispose } from '@utils/dispose'
import gsap from 'gsap'
import { InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js'
import BlockMaterial from './block-material'

export default class WaterBlock {
  static simplex = new SimplexNoise()
  static maxCount = 5000
  static material = null

  static mesh = null
  static count = 0

  static toDisposeMesh = null
  static toDisposeCount = 0

  #key = null

  get key() {
    if (!this.#key) {
      this.#key = `${this.q},${this.r}`
    }

    return this.#key
  }

  constructor({ grid, q, r }) {
    this.experience = Experience.instance
    this.time = this.experience.time
    this.resources = this.experience.resources
    this.scene = this.experience.scene

    this.grid = grid
    this.name = 'water'
    this.q = q
    this.r = r

    this.links = []
  }

  init() {
    this.setMesh()
    return this.transitionIn()
  }

  async setMesh() {
    if (!WaterBlock.material) {
      WaterBlock.material = new BlockMaterial()
      WaterBlock.material.uniforms.uLinked.value = true
      WaterBlock.material.uniforms.uTutorial.value = false
      WaterBlock.material.uniforms.uRadius.value = this.grid.radius
    }

    if (!WaterBlock.mesh) {
      const modelMesh = this.resources.items[this.name].scene.children.at(0).clone()
      const modelGeometry = modelMesh.geometry.clone()
      const modelMaterial = modelMesh.material.clone()
      modelMaterial.transparent = true
      modelMaterial.onBeforeCompile = WaterBlock.material.inject

      WaterBlock.mesh = new InstancedMesh(modelGeometry, modelMaterial, 5000)
      // WaterBlock.mesh.castShadow = true
      // WaterBlock.mesh.receiveShadow = true
      this.scene.add(WaterBlock.mesh)
    }

    // Convert axial coordinates to cartesian
    const x = this.q + this.r * 0.5
    const y = -2
    const z = this.r * 0.866 // sqrt(3)/2

    this.meshMatrix = new Matrix4().compose(
      new Vector3(x, y, z), //position
      new Quaternion(), //rotation
      new Vector3(0.0001, 0.0001, 0.0001), //scale
    )

    this.meshIndex = WaterBlock.count++
    WaterBlock.mesh.setMatrixAt(this.meshIndex, this.meshMatrix)
    WaterBlock.mesh.count = this.meshIndex
  }

  transitionIn() {
    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()
    this.meshMatrix.decompose(position, quaternion, scale)

    const delay = position.distanceTo(Grid.center) * 0.05

    return gsap
      .timeline({
        delay,
        onUpdate: () => {
          this.meshMatrix.compose(position, quaternion, scale)
          WaterBlock.mesh.setMatrixAt(this.meshIndex, this.meshMatrix)
          WaterBlock.mesh.instanceMatrix.needsUpdate = true
        },
      })
      .to(scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: 'back.inOut',
      })
      .to(
        position,
        {
          y: 0,
          duration: 0.5,
          ease: 'back.inOut',
        },
        '<',
      )
  }

  static getElevation(position, elapsed) {
    const frequency = 0.03
    const speed = 0.05
    const scale = position.distanceTo(Grid.center) * 0.025

    const x = position.x * frequency
    const z = position.z * frequency
    const t = elapsed * speed

    const elevation = WaterBlock.simplex.noise(x + t, z + t * 0.5) * scale
    const clamped = Math.min(elevation, 0)
    return clamped
  }

  idle() {
    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()
    this.meshMatrix.decompose(position, quaternion, scale)

    position.y = WaterBlock.getElevation(position, this.time.elapsed)

    this.meshMatrix.compose(position, quaternion, scale)
    WaterBlock.mesh.setMatrixAt(this.meshIndex, this.meshMatrix)
    WaterBlock.mesh.instanceMatrix.needsUpdate = true
  }

  transitionOut() {
    const position = new Vector3()
    const quaternion = new Quaternion()
    const scale = new Vector3()
    this.meshMatrix.decompose(position, quaternion, scale)

    const delay = position.distanceTo(Grid.center) * 0.05

    return gsap
      .timeline({
        delay,
        onUpdate: () => {
          this.meshMatrix.compose(position, quaternion, scale)
          if (WaterBlock.toDisposeMesh) {
            WaterBlock.toDisposeMesh?.setMatrixAt(this.meshIndex, this.meshMatrix)
            WaterBlock.toDisposeMesh.instanceMatrix.needsUpdate = true
          }
        },
      })
      .to(scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: 'back.inOut',
      })
      .to(
        position,
        {
          y: -2,
          duration: 0.5,
          ease: 'back.inOut',
        },
        '<',
      )
  }

  update() {
    WaterBlock.material?.update()
    if (WaterBlock.mesh) this.idle()
  }

  async dispose() {
    if (!WaterBlock.toDisposeMesh) {
      WaterBlock.toDisposeMesh = WaterBlock.mesh
      WaterBlock.toDisposeCount = WaterBlock.count

      WaterBlock.mesh = null
      WaterBlock.count = 0
    }

    await this.transitionOut()
    WaterBlock.toDisposeCount--

    if (!WaterBlock.toDisposeCount) {
      dispose(WaterBlock.toDisposeMesh)
      this.scene.remove(WaterBlock.toDisposeMesh)
      WaterBlock.toDisposeMesh = null
    }
  }

  toString() {
    return `[${this.key}]`
  }
}
