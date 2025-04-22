import gridConfig from '@config/grid'
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
import { SoundPlayer } from './sound-player'
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
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
  }

  ready = () => {
    this.loading.ready()

    this.soundPlayer = new SoundPlayer()
    Grid.shuffle()
  }

  update = () => {
    this.camera.update()
    this.renderer.update()
    this.pointer.update()

    Grid.instance?.update()
  }

  setDebug() {
    const folder = Debug.gui.root.addFolder({ title: '🌐 experience' })

    const helpersSize = (gridConfig.maxRadius + gridConfig.padding) * 2 + 4
    this.axesHelper = new AxesHelper(helpersSize)
    this.axesHelper.visible = false
    this.axesHelper.position.x = -helpersSize * 0.5
    this.axesHelper.position.y = 0.01
    this.axesHelper.position.z = -helpersSize * 0.5

    this.gridHelper = new GridHelper(helpersSize, helpersSize * 2, 'gray', 'gray')
    this.gridHelper.visible = false

    this.scene.add(this.axesHelper, this.gridHelper)

    folder.addBinding(this.axesHelper, 'visible', { label: 'helpers' }).on('change', event => {
      this.axesHelper.visible = event.value
      this.gridHelper.visible = event.value
      this.renderer.instance.setClearColor(event.value ? 0x333333 : 'black', event.value ? 1 : 0)
      this.environment.shadowHelper.visible = event.value
    })
  }
}
