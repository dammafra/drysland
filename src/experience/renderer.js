import Experience from '@experience'
import Debug from '@utils/debug'
import { PCFSoftShadowMap, WebGLRenderer } from 'three'

export default class Renderer {
  constructor() {
    this.experience = Experience.instance
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.setInstance()

    addEventListener('debug', this.setDebug)
  }

  setInstance() {
    this.instance = new WebGLRenderer({
      alpha: true,
      canvas: this.canvas,
      antialias: this.sizes.pixelRatio < 2,
    })

    this.instance.shadowMap.enabled = true
    this.instance.shadowMap.type = PCFSoftShadowMap
    this.instance.setClearColor('black', 0)

    this.resize()
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
  }

  setDebug = () => {
    this.disableClearColor = false

    Debug.gui.root
      .addBinding(this, 'disableClearColor', { label: 'disable clear color' })
      .on('change', () =>
        this.instance.setClearColor(
          this.disableClearColor ? 0x333333 : 'black',
          this.disableClearColor ? 1 : 0,
        ),
      )
  }
}
