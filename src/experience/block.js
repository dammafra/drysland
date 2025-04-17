import Experience from '@experience'
import { BackSide, MeshBasicMaterial } from 'three'

export default class Block {
  get position() {
    return this.mesh.position
  }

  constructor(id) {
    this.experience = Experience.instance
    this.resources = this.experience.resources
    this.scene = this.experience.scene

    this.id = id
    this.type = 'base'

    this.setMesh()
    this.setOutline()

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
    this.mesh = this.resources.items[this.id].scene.children.at(0).clone()
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

  update() {
    //step Math.PI / 3
    this.mesh.rotation.y = this.experience.time.elapsed * 0.05
  }

  dispose() {
    this.scene.remove(this.mesh, this.outlineMesh)
  }
}
