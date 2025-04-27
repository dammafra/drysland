import blocksConfig from '@config/blocks'
import Experience from '@experience'
import { dispose } from '@utils/dispose'
import Random from '@utils/random'
import gsap from 'gsap'
import { AnimationMixer, SRGBColorSpace, Vector3 } from 'three'
import BlockMaterial from './block-material'

export default class Block {
  static colormapDefault = null
  static colormapDesert = null

  #key = null
  #linked = false

  get key() {
    if (!this.#key) {
      this.#key = `${this.q},${this.r}`
    }

    return this.#key
  }

  get linksKey() {
    return this.links.sort((a, b) => a - b).join('')
  }

  get targetKey() {
    return this.target.sort((a, b) => a - b).join('')
  }

  get linked() {
    return this.#linked
  }

  // TODO improve
  set linked(value) {
    this.#linked = blocksConfig.water.includes(this.name) || this.name === 'riverStart' || value
    this.material.uniforms.uLinked.value = this.#linked
    this.material.uniforms.uTutorial.value = false
    this.mesh.material.map = this.#linked ? Block.colormapDefault : Block.colormapDesert
  }

  set invalid(value) {
    this.material.uniforms.uInvalid.value = value
  }

  constructor({ grid, name, q, r, links, target, rotation }) {
    this.experience = Experience.instance
    this.camera = this.experience.camera
    this.time = this.experience.time
    this.resources = this.experience.resources
    this.soundPlayer = this.experience.soundPlayer
    this.scene = this.experience.scene
    this.pointer = this.experience.pointer

    this.grid = grid
    this.name = name
    this.q = q
    this.r = r

    this.links = links || []
    this.target = target || []
    this.rotation = rotation
  }

  init() {
    this.setColormaps()
    this.setMesh()
    this.setAnimation()

    if (this.rotation) {
      this.mesh.rotation.y = this.rotation
    } else {
      this.rotate(Random.integer({ max: 5 }), false)
    }

    this.linked = false

    if (this.links.length) {
      this.pointer.add(this)
    }

    return this.transitionIn()
  }

  normalizeLinks() {
    this.target = this.links

    if (!this.linksKey) return
    while (!blocksConfig.links.includes(this.linksKey)) this.rotate(1, false)
  }

  setName() {
    if (this.name) return

    this.normalizeLinks()

    const riverBlocks = blocksConfig.linksMap[this.linksKey]
    if (!riverBlocks) return

    this.name = Random.oneOf(riverBlocks)
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
    this.material = new BlockMaterial()
    this.material.uniforms.uRadius.value = this.grid.radius

    this.mesh = this.resources.items[this.name].scene.children.at(0).clone()
    this.mesh.material = this.mesh.material.clone()
    this.mesh.material.onBeforeCompile = this.material.inject
    this.mesh.children.forEach(m => (m.material = this.mesh.material))

    // Convert axial coordinates to cartesian
    this.mesh.position.x = this.q + this.r * 0.5
    this.mesh.position.y = -2
    this.mesh.position.z = this.r * 0.866 // sqrt(3)/2

    this.mesh.scale.setScalar(0)

    this.mesh.receiveShadow = true
    this.mesh.castShadow = true

    this.scene.add(this.mesh)
  }

  setAnimation() {
    const animation = this.resources.items[this.name].animations?.at(0)
    if (!animation) return

    this.animationMixer = new AnimationMixer(this.mesh)
    const action = this.animationMixer.clipAction(animation)

    action.play()
  }

  transitionIn() {
    const center = new Vector3(0, 0, 0)
    const delay = this.mesh.position.distanceTo(center) * 0.05

    return gsap
      .timeline({ delay })
      .to(this.mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: 'back.inOut',
      })
      .to(
        this.mesh.position,
        {
          y: blocksConfig.sand.includes(this.name) ? -0.1 : 0,
          duration: 0.5,
          ease: 'back.inOut',
        },
        '<',
      )
  }

  transitionOut() {
    const center = new Vector3(0, 0, 0)
    const delay = this.mesh.position.distanceTo(center) * 0.05

    return gsap
      .timeline({ delay })
      .to(this.mesh.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.5,
        ease: 'back.inOut',
      })
      .to(
        this.mesh.position,
        {
          y: -2,
          duration: 0.5,
          ease: 'back.inOut',
        },
        '<',
      )
  }

  async rotate(times = 1, animate = true) {
    this.rotationAnimation?.totalProgress(1)

    this.links = this.links.map(edge => (edge + times) % 6)

    if (!this.mesh) return
    this.rotation = this.mesh.rotation.y - (Math.PI / 3) * times

    if (animate) {
      this.rotationAnimation = gsap
        .timeline()
        .to(this.mesh.rotation, {
          y: this.rotation,
          duration: 0.25,
          ease: 'back.inOut',
        })
        .to(this.mesh.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.25 }, '<')
        .to(this.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 })
    } else {
      this.mesh.rotation.y = this.mesh.rotation.y - (Math.PI / 3) * times
    }
  }

  onHover() {
    this.material.uniforms.uHovered.value = true
  }

  onLeave() {
    this.material.uniforms.uHovered.value = false
  }

  onClick() {
    this.rotate()
    this.soundPlayer.play('swing')
    this.experience.setGameMode(this)

    this.experience.save()
    this.grid.updateLinks()
    this.grid.checkSolution()
  }

  update() {
    this.material.update()

    // TODO improve
    if (!this.links.length || this.#linked) {
      this.animationMixer?.update(this.time.delta * 0.2)
    }
  }

  async dispose() {
    this.pointer.remove(this)

    await this.transitionOut()

    dispose(this.mesh)
    this.scene.remove(this.mesh)
  }

  toString() {
    return `[${this.key}]`
  }
}
