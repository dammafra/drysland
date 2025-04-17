import Debug from '@utils/debug'
import { Scene } from 'three'
import Camera from './camera'
import Environment from './environment'
import Grid from './grid'
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
    this.grid = new Grid(10, 10)

    Debug.gui.root.addButton({ title: '🎲 shuffle' }).on('click', () => {
      this.grid.dispose()
      this.grid = new Grid(10, 10)
    })
  }

  update = () => {
    this.camera.update()
    this.renderer.update()

    this.grid?.update()
  }
}
