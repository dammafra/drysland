import gridConfig from '@config/grid'
import Grid from '@grid/grid'
import Menu from '@ui/menu'
import { UI } from '@ui/ui'
import Touch from '@utils/touch'
import { AxesHelper, GridHelper, Scene } from 'three'
import Camera from './camera'
import Environment from './environment'
import Pointer from './pointer'
import Renderer from './renderer'
import Resources from './resources'
import Sizes from './sizes'
import { SoundPlayer } from './sound-player'
import Time from './time'

export default class Experience {
  /** @type {Experience} */
  static instance

  static async init(canvasSelector, loading, debug) {
    return new Experience(document.querySelector(canvasSelector), loading, await debug)
  }

  constructor(canvas, loading, debug) {
    // Singleton
    if (Experience.instance) {
      return Experience.instance
    }

    Experience.instance = this

    // Options
    this.canvas = canvas
    this.loading = loading
    this.debug = debug

    // Setup
    this.time = new Time()
    this.sizes = new Sizes()
    this.resources = new Resources()
    this.scene = new Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()

    this.setDebug()

    this.pointer = new Pointer()
    this.environment = new Environment()

    // Events
    this.sizes.addEventListener('resize', this.resize)
    this.time.addEventListener('tick', this.update)
    this.resources.addEventListener('ready', this.ready)
    addEventListener('beforeunload', this.save)
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
  }

  ready = () => {
    this.loading.stop()
    this.environment.ready()

    this.menu = new Menu()
    this.soundPlayer = new SoundPlayer()

    UI.startButton.onClick(this.start.bind(this))
    UI.nextButton.onClick(this.nextLevel.bind(this))
    UI.backButton.onClick(this.setExplorationMode.bind(this))

    UI.hintText.set(
      Touch.support ? 'Touch any river tile to start' : 'Click any river tile to start',
    )
  }

  start() {
    this.menu.close()

    this.level = 0

    UI.soundsButton.show()
    UI.loopButton.show()
    UI.wavesButton.show()

    UI.soundsButton.onClick(this.toggleSounds.bind(this))
    UI.loopButton.onClick(this.toggleLoop.bind(this))
    UI.wavesButton.onClick(this.toggleWaves.bind(this))

    this.toggleLoop()
    this.toggleWaves()

    this.nextLevel()
  }

  nextLevel() {
    const state = this.load()
    this.level = state ? state.level : this.level + 1
    const blocks = state?.blocks

    this.grid?.dispose()
    this.grid = new Grid(this.level, blocks)

    UI.nextButton.hide()
    UI.levelText.set(`Level ${this.level}`)
    UI.levelText.show()
    UI.hintText.show()
  }

  setGameMode(block) {
    UI.backButton.show()
    UI.hintText.hide()

    this.camera.setGameControls(block)
    this.environment.directionalLight.castShadow = false
  }

  setExplorationMode() {
    UI.nextButton.show()
    UI.backButton.hide()
    this.camera.setExplorationControls()
    this.environment.directionalLight.castShadow = true
  }

  toggleSounds() {
    this.soundPlayer.setMuted(!this.soundPlayer.muted)
    UI.soundsButton.toggle()
  }

  toggleLoop() {
    this.soundPlayer.backgrounds.has('loop')
      ? this.soundPlayer.stopBackground('loop')
      : this.soundPlayer.playBackground('loop', 0.5)
    UI.loopButton.toggle()
  }

  toggleWaves() {
    this.soundPlayer.backgrounds.has('waves')
      ? this.soundPlayer.stopBackground('waves')
      : this.soundPlayer.playBackground('waves', 0.1)
    UI.wavesButton.toggle()
  }

  update = () => {
    this.camera.update()
    this.renderer.update()
    this.pointer.update()

    this.grid?.update()
  }

  dispose() {
    this.pointer.dispose()
    this.grid?.dispose()
  }

  save = () => {
    if (!this.level) return
    const blocks = this.grid?.serialize()
    const level = this.level
    localStorage.setItem('state', JSON.stringify({ level, blocks }))
  }

  load = () => {
    const state = localStorage.getItem('state')
    localStorage.removeItem('state')

    if (state) return JSON.parse(state)
  }

  setDebug() {
    if (!this.debug) return

    const folder = this.debug.root.addFolder({ title: '🌐 experience' })

    const helpersSize = gridConfig.maxRadius * 2 + 4
    this.axesHelper = new AxesHelper(helpersSize)
    this.axesHelper.visible = false
    this.axesHelper.position.x = -helpersSize * 0.5
    this.axesHelper.position.y = 1.01
    this.axesHelper.position.z = -helpersSize * 0.5

    this.gridHelper = new GridHelper(helpersSize, helpersSize * 2, 'gray', 'gray')
    this.gridHelper.visible = false
    this.gridHelper.position.y = 1

    this.scene.add(this.axesHelper, this.gridHelper)

    folder.addBinding(this.axesHelper, 'visible', { label: 'helpers' }).on('change', event => {
      this.axesHelper.visible = event.value
      this.gridHelper.visible = event.value
      this.scene.backgroundIntensity = event.value ? 0 : 1
      this.environment.shadowHelper.visible = event.value
    })
  }
}
