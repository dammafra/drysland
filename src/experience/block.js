import Experience from '@experience'
import gsap from 'gsap'
import { AnimationMixer, BackSide, Mesh, MeshBasicMaterial, Vector3 } from 'three'

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
    this.setOutline()
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
    this.mesh.position.x = this.x
    this.mesh.position.z = this.y

    this.mesh.receiveShadow = true
    this.mesh.castShadow = true

    this.scene.add(this.mesh)

    this.transitionIn()
  }

  // TODO: use shader?
  setOutline() {
    const geometry = this.mesh.geometry
    const material = new MeshBasicMaterial({ color: 'white', side: BackSide })

    this.outline = new Mesh(geometry, material)
    this.outline.visible = false
    this.outline.position.x = this.x
    this.outline.position.z = this.y
    this.outline.scale.multiplyScalar(1.05)

    this.scene.add(this.outline)
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

    await Promise.all(
      [this.mesh, this.outline].map(mesh => {
        const tl = gsap.timeline()

        tl.to(mesh.rotation, {
          y: mesh.rotation.y - Math.PI / 3,
          duration: 0.5,
          ease: 'back.inOut',
        })

        const initialScale = mesh.scale.x
        const shrinkScale = initialScale - 0.2
        tl.to(mesh.scale, { x: shrinkScale, y: shrinkScale, z: shrinkScale, duration: 0.25 }, '<')
        tl.to(mesh.scale, { x: initialScale, y: initialScale, z: initialScale, duration: 0.25 })

        return tl
      }),
    )

    this.rotating = false
  }

  setAnimation() {
    const animation = this.resources.items[this.name].animations?.at(0)
    if (!animation) return
    this.animationMixer = new AnimationMixer(this.mesh)
    this.animationMixerOutline = new AnimationMixer(this.outline)
    const action = this.animationMixer.clipAction(animation)
    const actionOutline = this.animationMixerOutline.clipAction(animation)

    action.play()
    actionOutline.play()
  }

  update() {
    this.animationMixer?.update(this.time.delta * 0.2)
    this.animationMixerOutline?.update(this.time.delta * 0.2)
  }

  onClick() {
    this.rotate()
  }

  onHover() {
    this.outline.visible = true
  }

  onLeave() {
    this.outline.visible = false
  }

  dispose() {
    this.scene.remove(this.mesh, this.outline)
  }
}
