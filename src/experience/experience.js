import Debug from '@utils/debug'
import { AxesHelper, BackSide, GridHelper, MeshBasicMaterial, Scene, SRGBColorSpace } from 'three'
import BlockMaterial from './block-material'
import Camera from './camera'
import Environment from './environment'
import Renderer from './renderer'
import Resources from './resources'
import Sizes from './sizes'
import Time from './time'

export default class Experience {
  /** @type {Experience} */
  static instance

  static init(canvasSelector) {
    return new Experience(document.querySelector(canvasSelector))
  }

  constructor(canvas) {
    // Singleton
    if (Experience.instance) {
      return Experience.instance
    }

    Experience.instance = this

    // Options
    this.canvas = canvas

    // Setup
    this.time = new Time()
    this.sizes = new Sizes()
    this.resources = new Resources()
    this.scene = new Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.environment = new Environment()

    // Events
    this.sizes.addEventListener('resize', this.resize)
    this.time.addEventListener('tick', this.update)
    this.resources.addEventListener('ready', this.ready)
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
  }

  ready = () => {
    const axesHelper = new AxesHelper(10)
    axesHelper.position.y = 0.001
    const gridHelper = new GridHelper(25, 50)
    this.scene.add(axesHelper, gridHelper)

    // Textures
    const colormap = this.resources.items.colormap
    colormap.colorSpace = SRGBColorSpace
    colormap.flipY = false

    // const colormapDesert = this.resources.items.colormapDesert
    // colormapDesert.colorSpace = SRGBColorSpace
    // colormapDesert.flipY = false

    // const colormapSnow = this.resources.items.colormapSnow
    // colormapSnow.colorSpace = SRGBColorSpace
    // colormapSnow.flipY = false

    // Blocks
    this.bridge = this.resources.items.bridge.scene.children.at(0)
    this.bridge.material.onBeforeCompile = BlockMaterial.init().inject
    this.bridge.receiveShadow = true
    this.bridge.castShadow = true
    this.scene.add(this.bridge)

    this.water = this.resources.items.water.scene.children.at(0)
    this.water.material.onBeforeCompile = BlockMaterial.init().inject
    this.water.position.x = 1

    this.water2 = this.water.clone()
    this.water2.position.x = -1

    this.water3 = this.water.clone()
    this.water3.position.x = 0.5
    this.water3.position.z = 0.865

    this.water4 = this.water.clone()
    this.water4.position.x = -0.5
    this.water4.position.z = 0.865

    this.water5 = this.water.clone()
    this.water5.position.x = 0.5
    this.water5.position.z = -0.865

    this.water6 = this.water.clone()
    this.water6.position.x = -0.5
    this.water6.position.z = -0.865

    this.scene.add(this.water, this.water2, this.water3, this.water4, this.water5, this.water6)

    // Outline
    this.outlineMesh = this.bridge.clone()
    this.outlineMesh.receiveShadow = false
    this.outlineMesh.castShadow = false
    this.outlineMesh.material = new MeshBasicMaterial({
      color: 0xffffff,
      side: BackSide,
    })
    this.outlineMesh.scale.multiplyScalar(1.05)
    this.outlineMesh.visible = false
    this.scene.add(this.outlineMesh)

    // GUI
    if (Debug.enabled) {
      Debug.gui.root.addBinding(this.outlineMesh, 'visible', { label: 'bridge outline' })

      Debug.gui.root.addBinding(this.bridge.rotation, 'y', {
        label: 'bridge rotation',
        min: 0,
        max: Math.PI * 2,
        step: Math.PI / 3,
      })
    }
  }

  update = () => {
    this.camera.update()
    this.renderer.update()
    BlockMaterial.instance?.update()
  }
}
