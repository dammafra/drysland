import { Scene, SRGBColorSpace } from 'three'
import { Pane } from 'tweakpane'
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
    // Textures
    const colormap = this.resources.items.colormap
    colormap.colorSpace = SRGBColorSpace
    colormap.flipY = false

    const colormapDesert = this.resources.items.colormapDesert
    colormapDesert.colorSpace = SRGBColorSpace
    colormapDesert.flipY = false

    const colormapSnow = this.resources.items.colormapSnow
    colormapSnow.colorSpace = SRGBColorSpace
    colormapSnow.flipY = false

    // Models
    const bridge = this.resources.items.bridge.scene.children.at(0)
    bridge.material.map = colormap
    bridge.receiveShadow = true
    bridge.castShadow = true
    this.scene.add(bridge)

    const buildingArchery = this.resources.items.buildingArchery.scene.children.at(0)
    buildingArchery.material.map = colormap
    buildingArchery.receiveShadow = true
    buildingArchery.castShadow = true
    buildingArchery.position.x = 1

    this.scene.add(buildingArchery)

    const water = this.resources.items.water.scene.children.at(0)
    water.material.map = colormap
    water.position.z = 0.8
    water.position.x = 0.5
    this.scene.add(water)

    const water2 = water.clone()
    water2.material.map = colormap
    water2.position.z = 0.8
    water2.position.x = -0.5
    this.scene.add(water2)

    const grass = this.resources.items.grass.scene.children.at(0)
    grass.material.map = colormap
    grass.position.x = -1
    this.scene.add(grass)

    const grass2 = grass.clone()
    grass2.material.map = colormap
    grass2.position.x = -1
    grass2.position.y = 0.2
    this.scene.add(grass2)

    // GUI
    const pane = new Pane()
    pane.addBinding(bridge.rotation, 'y', {
      label: 'rotation',
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 3,
    })
    pane.addBinding(buildingArchery.rotation, 'y', {
      label: 'rotation',
      min: 0,
      max: Math.PI * 2,
      step: Math.PI / 3,
    })
  }

  update = () => {
    this.camera.update()
    this.renderer.update()
  }
}
