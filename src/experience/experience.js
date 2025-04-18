import Debug from '@utils/debug'
import { AxesHelper, GridHelper, Scene } from 'three'
import Camera from './camera'
import Environment from './environment'
import Grid from './grid'
import Loading from './loading'
import Pointer from './pointer'
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
    this.loading = new Loading()

    this.scene = new Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.environment = new Environment()
    this.pointer = new Pointer()

    // Events
    this.sizes.addEventListener('resize', this.resize)
    this.time.addEventListener('tick', this.update)
    this.resources.addEventListener('ready', this.ready)

    addEventListener('debug', this.setDebug)
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
  }

  ready = () => {
    this.loading.ready()

    const radius = Math.floor(Math.random() * 5) + 1
    this.grid = new Grid(radius)
  }

  update = () => {
    this.camera.update()
    this.renderer.update()
    this.pointer.update()
  }

  setDebug = () => {
    this.setHelpers()

    // Global access
    window.experience = this
  }

  setHelpers() {
    this.axesHelper = new AxesHelper(10)
    this.axesHelper.visible = false
    this.axesHelper.position.y = 0.001

    this.gridHelper = new GridHelper(25, 50)
    this.gridHelper.visible = false

    this.scene.add(this.axesHelper, this.gridHelper)

    Debug.gui.root.addBinding(this.axesHelper, 'visible', { label: 'axes helper' })
    Debug.gui.root.addBinding(this.gridHelper, 'visible', { label: 'grid helper' })
  }
}
