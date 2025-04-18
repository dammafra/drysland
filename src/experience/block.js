import Experience from '@experience'
import { BackSide, MeshBasicMaterial } from 'three'
export default class Block {
  constructor(name) {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.scene = this.experience.scene
    this.pointer = this.experience.pointer

    this.type = 'base'
    this.name = name

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

  setMesh() {
    this.mesh = this.resources.items[this.name].scene.children.at(0).clone()
    this.mesh.receiveShadow = true
    this.mesh.castShadow = true
    this.scene.add(this.mesh)
  }

  setOutline() {
    this.outlineMesh = this.mesh.clone()
    this.outlineMesh.receiveShadow = false
    this.outlineMesh.castShadow = false
    this.outlineMesh.material = new MeshBasicMaterial({
      color: 0xffffff,
      side: BackSide,
    })
    this.outlineMesh.scale.multiplyScalar(1.05)
    this.outlineMesh.visible = false
    this.scene.add(this.outlineMesh)
  }

  setPosition(x, y) {
    this.mesh.position.x = x
    this.mesh.position.z = y
    this.outlineMesh.position.copy(this.mesh.position)
  }

  rotate() {
    // TODO animate
    this.mesh.rotation.y -= Math.PI / 3
    this.outlineMesh.rotation.copy(this.mesh.rotation)
  }

  update() {}

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
