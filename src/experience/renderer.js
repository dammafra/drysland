import Experience from '@experience'
import { PCFSoftShadowMap, WebGLRenderer } from 'three'

export default class Renderer {
  constructor() {
    this.experience = Experience.instance
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.setInstance()
  }

  setInstance() {
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: this.sizes.pixelRatio < 2,
    })

    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = PCFSoftShadowMap

    this.resize()
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
  }
}
