import blocksConfig from '@config/blocks'
import Experience from '@experience'
import gsap from 'gsap'
import { AnimationMixer, SRGBColorSpace, Vector3 } from 'three'
import BlockMaterial from './block-material'

export default class Block {
  static colormapDefault = null
  static colormapDesert = null

  #linked = false

  get linked() {
    return this.#linked
  }

  set linked(value) {
    this.#linked = value
    this.material.uniforms.uLinked.value = blocksConfig.isForcedLinked(this.name) || this.#linked
    this.mesh.material.map = this.#linked ? Block.colormapDefault : Block.colormapDesert
  }

  constructor({ grid, name, q, r }) {
    this.experience = Experience.instance
    this.time = this.experience.time
    this.resources = this.experience.resources
    this.scene = this.experience.scene
    this.pointer = this.experience.pointer
    this.grid = grid

    this.name = name
    this.q = q
    this.r = r

    this.setColormaps()
    this.setMesh()
    this.setAnimation()

    this.linked = false
    this.links = blocksConfig.getLinks(this.name)

    if (blocksConfig.isInteractive(this.name)) {
      this.pointer.add(this)
    }
  }

  setColormaps() {
    if (!Block.colormapDefault) {
      Block.colormapDefault = this.resources.items.colormap
      Block.colormapDefault.flipY = false
      Block.colormapDefault.colorSpace = SRGBColorSpace
    }

    if (!Block.colormapDesert) {
      Block.colormapDesert = this.resources.items.colormapDesert
      Block.colormapDesert.flipY = false
      Block.colormapDesert.colorSpace = SRGBColorSpace
    }
  }

  async setMesh() {
    this.mesh = this.resources.items[this.name].scene.children.at(0).clone()
    this.material = new BlockMaterial()

    this.mesh.material = this.mesh.material.clone()
    this.mesh.material.onBeforeCompile = this.material.inject

    // Convert axial coordinates to cartesian
    this.mesh.position.x = this.q + this.r * 0.5
    this.mesh.position.z = this.r * 0.866 // sqrt(3)/2

    this.mesh.receiveShadow = true
    this.mesh.castShadow = true

    this.scene.add(this.mesh)

    this.transitionIn()
  }

  transitionIn() {
    const center = new Vector3(0, 0, 0)
    const delay = this.mesh.position.distanceTo(center) * 0.05

    this.mesh.position.y = -2
    this.mesh.scale.setScalar(0.001)

    gsap.to(this.mesh.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.5,
      delay,
      ease: 'back.inOut',
    })

    gsap.to(this.mesh.position, {
      y: 0,
      duration: 0.5,
      delay,
      ease: 'back.inOut',
    })
  }

  async rotate() {
    this.rotationAnimation?.totalProgress(1)

    this.links = this.links.map(edge => (edge + 1) % 6)

    this.rotationAnimation = gsap
      .timeline()
      .to(this.mesh.rotation, {
        y: this.mesh.rotation.y - Math.PI / 3,
        duration: 0.5,
        ease: 'back.inOut',
      })
      .to(this.mesh.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.25 }, '<')
      .to(this.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 })
  }

  setAnimation() {
    const animation = this.resources.items[this.name].animations?.at(0)
    if (!animation) return

    this.animationMixer = new AnimationMixer(this.mesh)
    const action = this.animationMixer.clipAction(animation)

    action.play()
  }

  update() {
    this.material.update()

    if (this.#linked) {
      this.animationMixer?.update(this.time.delta * 0.2)
    }
  }

  onClick() {
    this.rotate()
    this.grid.checkLinks()
  }

  onHover() {
    this.mesh.castShadow = false
    this.mesh.receiveShadow = false
    this.material.uniforms.uHovered.value = true
  }

  onLeave() {
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.material.uniforms.uHovered.value = false
  }

  dispose() {
    this.pointer.remove(this)

    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.scene.remove(this.mesh)
  }
}
