import gridConfig from '@config/grid'
import Auth from '@fire/auth'
import State from '@fire/state'
import Grid from '@grid/grid'
import Menu from '@ui/menu'
import { UI } from '@ui/ui'
import debounce from '@utils/debounce'
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
    this.level = 0
    this.setDebug()

    this.loading.stop()

    this.menu = new Menu()
    this.soundPlayer = new SoundPlayer()
    this.environment = new Environment()

    Auth.instance.subscribe(user => {
      UI.authToggle.set(!user)
      UI.authText.set(user ? 'Logout' : 'Login').show()
      user && State.instance.sync()
    })

    UI.authToggle.onClick(() => Auth.instance.user ? Auth.instance.signOut() : Auth.instance.signIn()) //prettier-ignore
    UI.startButton.onClick(this.start.bind(this))
    UI.nextButton.onClick(this.nextLevel.bind(this))
    UI.backButton.onClick(this.setExplorationMode.bind(this))
  }

  start() {
    this.menu.close()

    UI.soundsToggle.onToggle(this.toggleSounds.bind(this)).show()
    UI.loopToggle.onToggle(this.toggleLoop.bind(this)).show()
    UI.wavesToggle.onToggle(this.toggleWaves.bind(this)).show()
    UI.fullscreenToggle.show()

    this.toggleLoop()
    this.toggleWaves()

    this.nextLevel()
  }

  async nextLevel() {
    const state = await this.load()
    this.level = state ? state.level : this.level + 1
    const blocks = state?.blocks

    this.grid?.dispose()
    this.grid = new Grid(this.level, blocks)

    UI.levelText.set(`Level ${this.level}`).show()
  }

  setGameMode(block) {
    UI.backButton.show()

    this.camera.setGameControls(block)
    this.environment.directionalLight.castShadow = false
  }

  setExplorationMode() {
    UI.backButton.hide()
    this.camera.setExplorationControls()
    this.environment.directionalLight.castShadow = true
  }

  toggleSounds() {
    return this.soundPlayer.setMuted(!this.soundPlayer.muted)
  }

  toggleLoop() {
    return this.soundPlayer.backgrounds.has('loop')
      ? this.soundPlayer.stopBackground('loop')
      : this.soundPlayer.playBackground('loop', 0.5)
  }

  toggleWaves() {
    return this.soundPlayer.backgrounds.has('waves')
      ? this.soundPlayer.stopBackground('waves')
      : this.soundPlayer.playBackground('waves', 0.1)
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

  save() {
    if (!this.level) return

    const blocks = this.grid?.serialize()
    const level = this.level
    State.instance.save({ level, blocks })
  }

  async load() {
    if (this.loaded) return
    this.loaded = true

    return await State.instance.load()
  }

  setDebug() {
    if (!this.debug) return

    window.experience = Experience.instance

    const levelController = this.debug.root
      .addBinding(this, 'level', { min: 1, max: 100, step: 1 })
      .on(
        'change',
        debounce(() => {
          levelController.disabled = true
          setTimeout(() => (levelController.disabled = false), 2000)

          localStorage.removeItem('state')
          this.level--
          this.nextLevel()
        }, 500),
      )

    const shuffleController = this.debug.root.addButton({ title: 'shuffle' }).on('click', () => {
      shuffleController.disabled = true
      setTimeout(() => (shuffleController.disabled = false), 2000)

      localStorage.removeItem('state')
      this.grid?.dispose()
      this.grid = new Grid(this.level)
    })

    const folder = this.debug.root.addFolder({ title: '🌐 experience', expanded: false })

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
