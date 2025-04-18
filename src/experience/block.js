import Experience from '@experience'
import gsap from 'gsap'
import { BackSide, MeshBasicMaterial, Vector3 } from 'three'

export default class Block {
  constructor({ name, x, y }) {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.scene = this.experience.scene
    this.pointer = this.experience.pointer

    this.type = 'base'
    this.name = name
    this.x = x
    this.y = y

    this.setMesh()
    this.setOutline()
    this.pointer.add(this)

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
    this.outlineMesh = this.resources.items[this.name].scene.children.at(0).clone()
    this.outlineMesh.visible = false
    this.outlineMesh.position.x = this.x
    this.outlineMesh.position.z = this.y
    this.outlineMesh.scale.multiplyScalar(1.05)

    this.outlineMesh.material = new MeshBasicMaterial({
      color: 0xffffff,
      side: BackSide,
    })

    this.scene.add(this.outlineMesh)
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

  rotate() {
    ;[this.mesh, this.outlineMesh].forEach(mesh => {
      gsap.to(mesh.rotation, {
        y: mesh.rotation.y - Math.PI / 3,
        duration: 0.5,
        ease: 'back.inOut',
      })
    })
  }

  onClick() {
    this.rotate()
  }

  onHover() {
    this.outlineMesh.visible = true
  }

  onLeave() {
    this.outlineMesh.visible = false
  }

  dispose() {
    this.scene.remove(this.mesh, this.outlineMesh)
  }
}
