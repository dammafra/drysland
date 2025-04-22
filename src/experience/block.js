import Experience from '@experience'
import Random from '@utils/random'
import gsap from 'gsap'
import { AnimationMixer, SRGBColorSpace, Vector3 } from 'three'
import BlockMaterial from './block-material'

/**
 * Hexagon Edges:
 *
 *    1 / \ 2
 *  0  |   |  3
 *    5 \ / 4
 *
 */

const linksMap = {
  0: ['riverStart'],

  '01': ['riverCornerSharp'],
  '02': ['riverCorner'],
  '03': ['bridge', 'buildingWatermill', 'riverStraight'],

  '012': ['riverIntersectionA'],
  '034': ['riverIntersectionC'],
  '024': ['riverIntersectionF'],

  '023': ['riverIntersectionB'],

  '0123': ['riverIntersectionH'],
  '0234': ['riverIntersectionD'],
  '0134': ['riverIntersectionE'],

  '01234': ['riverIntersectionG'],

  '012345': ['riverCrossing'],
}

const validLinks = ['', ...Object.keys(linksMap)]

const getName = key => Random.oneOf(linksMap[key] || ['water'])

export default class Block {
  static colormapDefault = null
  static colormapDesert = null

  #linked = false

  get linked() {
    return this.#linked
  }

  get linksKey() {
    return this.links.sort((a, b) => a - b).join('')
  }

  set linked(value) {
    this.#linked = value
    this.material.uniforms.uLinked.value = this.name === 'water' || this.#linked
    this.mesh.material.map = this.#linked ? Block.colormapDefault : Block.colormapDesert
  }

  constructor({ grid, name, q, r }) {
    this.experience = Experience.instance
    this.time = this.experience.time
    this.resources = this.experience.resources
    this.soundPlayer = this.experience.soundPlayer
    this.scene = this.experience.scene
    this.pointer = this.experience.pointer
    this.grid = grid

    this.name = name
    this.q = q
    this.r = r
    this.links = []
    this.neighbors = []
  }

  init() {
    this.normalizeLinks()

    if (!this.name) {
      this.name = getName(this.linksKey)
    }

    this.setColormaps()
    this.setMesh()
    this.setAnimation()

    this.rotate(Random.integer({ max: 5 }))

    this.linked = false

    if (
      this.name === 'bridge' ||
      this.name === 'buildingWatermill' ||
      this.name.includes('river')
    ) {
      this.pointer.add(this)
    }
  }

  normalizeLinks() {
    while (!validLinks.includes(this.linksKey)) {
      this.rotate(1, false)
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
    this.mesh.children.forEach(m => (m.material = this.mesh.material))

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
          y: 0,
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
        x: 0.001,
        y: 0.001,
        z: 0.001,
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
    this.soundPlayer.play('splash')
    this.rotationAnimation?.totalProgress(1)

    this.links = this.links.map(edge => (edge + times) % 6)

    if (!this.mesh) return

    if (animate) {
      this.rotationAnimation = gsap
        .timeline()
        .to(this.mesh.rotation, {
          y: this.mesh.rotation.y - (Math.PI / 3) * times,
          duration: 0.5,
          ease: 'back.inOut',
        })
        .to(this.mesh.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.25 }, '<')
        .to(this.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 })
    } else {
      this.mesh.rotation.y = this.mesh.rotation.y - (Math.PI / 3) * times
    }
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

  async dispose() {
    this.pointer.remove(this)

    await this.transitionOut()

    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.scene.remove(this.mesh)
  }
}
