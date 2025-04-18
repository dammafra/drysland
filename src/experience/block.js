import Experience from '@experience'
import gsap from 'gsap'
import { AnimationMixer, Vector3 } from 'three'

import BlockMaterial from './block-material'

export default class Block {
  constructor({ name, x, y }) {
    this.experience = Experience.instance
    this.time = this.experience.time
    this.resources = this.experience.resources
    this.scene = this.experience.scene
    this.pointer = this.experience.pointer

    this.type = 'base'
    this.name = name
    this.x = x
    this.y = y

    this.setMesh()
    this.setAnimation()

    if (this.name == 'bridge' || this.name === 'buildingWatermill' || this.name.includes('river')) {
      this.pointer.add(this)
    }

    // Textures
    // const colormap = this.resources.items.colormap
    // colormap.colorSpace = SRGBColorSpace
    // colormap.flipY = false

    // const colormapDesert = this.resources.items.colormapDesert
    // colormapDesert.colorSpace = SRGBColorSpace
    // colormapDesert.flipY = false

    // const colormapSnow = this.resources.items.colormapSnow
    // colormapSnow.colorSpace = SRGBColorSpace
    // colormapSnow.flipY = false
  }

  async setMesh() {
    this.mesh = this.resources.items[this.name].scene.children.at(0).clone()
    this.material = new BlockMaterial()

    this.mesh.material = this.mesh.material.clone()
    this.mesh.material.onBeforeCompile = this.material.inject

    this.mesh.position.x = this.x
    this.mesh.position.z = this.y

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
    if (this.rotating) return

    this.rotating = true

    await gsap
      .timeline()
      .to(this.mesh.rotation, {
        y: this.mesh.rotation.y - Math.PI / 3,
        duration: 0.5,
        ease: 'back.inOut',
      })
      .to(this.mesh.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 0.25 }, '<')
      .to(this.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.25 })

    this.rotating = false
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
    this.animationMixer?.update(this.time.delta * 0.2)
  }

  onClick() {
    this.rotate()
  }

  onHover() {
    this.mesh.castShadow = false
    this.mesh.receiveShadow = false
    this.material.uniforms.uHovering.value = true
  }

  onLeave() {
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.material.uniforms.uHovering.value = false
  }

  dispose() {
    this.pointer.remove(this)

    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.scene.remove(this.mesh)
  }
}
