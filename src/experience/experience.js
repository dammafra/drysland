import gridConfig from '@config/grid'
import Auth from '@fire/auth'
import State from '@fire/state'
import Grid from '@grid/grid'
import Menu from '@ui/menu'
import Modal from '@ui/modal'
import { UI } from '@ui/ui'
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
    this.canvas.addEventListener('mousedown', () => this.canvas.classList.add('grabbing'))
    this.canvas.addEventListener('mouseup', () => this.canvas.classList.remove('grabbing'))

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

    document.addEventListener('keypress', e => {
      if (!this.grid || e.code !== 'Space') return
      this.grid.riverBlocks.find(b => b.material.uniforms.uHovered.value)?.onClick()
    })
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
      UI.authToggle.setLabel(user ? 'Logout' : 'Login').toggle(!user)
      user && State.instance.sync()
    })
    UI.authToggle.onClick(() => Auth.instance.user ? Auth.instance.signOut() : Auth.instance.signIn()) //prettier-ignore
    UI.startButton.onClick(this.start.bind(this))
    UI.creditsButton.onClick(() => Modal.instance.open('.credits'))
    UI.nextButton.onClick(this.nextLevel.bind(this))
    UI.backButton.onClick(this.setExplorationMode.bind(this))
  }

  start() {
    this.menu.close()

    UI.soundsToggle.onToggle(this.toggleSounds.bind(this)).show()
    UI.loopToggle.onToggle(this.toggleLoop.bind(this)).show()
    UI.wavesToggle.onToggle(this.toggleAmbience.bind(this)).show()
    UI.menuButton.onClick(this.openMenu.bind(this))
    UI.fullscreenToggle.show()

    this.toggleLoop()
    this.toggleAmbience()

    this.nextLevel()
  }

  async nextLevel() {
    const state = await this.load()
    const level = state ? state.level : this.level + 1
    const blocks = state?.blocks

    this.grid?.dispose()
    this.grid = new Grid({ level, blocks })

    this.level = level
    UI.levelText.set(`Level ${this.level}`).show()
  }

  openMenu() {
    this.grid?.dispose()
    this.level--
    this.loaded = false

    UI.soundsToggle.hide()
    UI.loopToggle.hide()
    UI.wavesToggle.hide()
    UI.menuButton.hide()
    UI.fullscreenToggle.hide()
    UI.levelText.hide()
    UI.tutorialText.hide()
    UI.backButton.hide()
    UI.nextButton.hide()

    this.toggleLoop()
    this.toggleAmbience()

    this.camera.autoRotate = false
    UI.startButton.setLabel('Resume')
    this.menu.open()
  }

  setGameMode(block) {
    UI.backButton.wiggle().show()

    this.camera.setGameControls(block)
    this.grid?.setShadows(false)
  }

  setExplorationMode() {
    UI.backButton.hide()
    this.camera.setExplorationControls()
    this.grid?.setShadows(true)
  }

  toggleSounds() {
    return this.soundPlayer.setMuted(!this.soundPlayer.muted)
  }

  toggleLoop() {
    return this.soundPlayer.backgrounds.has('loop')
      ? this.soundPlayer.stopBackground('loop')
      : this.soundPlayer.playBackground('loop', 0.5)
  }

  toggleAmbience() {
    this.soundPlayer.backgrounds.has('seagulls')
      ? this.soundPlayer.stopBackground('seagulls')
      : this.soundPlayer.playBackground('seagulls', 0)

    this.soundPlayer.backgrounds.has('sailing')
      ? this.soundPlayer.stopBackground('sailing')
      : this.soundPlayer.playBackground('sailing', 0)

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

    const timestamp = Date.now()
    const blocks = this.grid?.serialize()
    const level = this.level

    State.instance.save({ timestamp, level, blocks })
  }

  async load() {
    if (this.loaded) return
    this.loaded = true

    return await State.instance.load()
  }

  setDebug() {
    if (!this.debug) return

    window.experience = Experience.instance

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

    this.debug.root
      .addBinding(this.axesHelper, 'visible', { label: 'helpers', index: 3 })
      .on('change', event => {
        this.axesHelper.visible = event.value
        this.gridHelper.visible = event.value
        this.scene.backgroundIntensity = event.value ? 0 : 1
        this.environment.shadowHelper.visible = event.value
        this.camera.controls.maxDistance = event.value ? 50 : 25
      })

    const folder = this.debug.root.addFolder({
      title: '⬢ grid',
      index: 4,
      expanded: false,
    })

    this.generateParams = {
      radius: 1,
      coverage: 0.5,
      extraLinks: 0,
    }
    folder.addBinding(this.generateParams, 'radius', { min: 1, max: 10, step: 1 })
    folder.addBinding(this.generateParams, 'coverage', { min: 0.1, max: 1, step: 0.1 })
    folder.addBinding(this.generateParams, 'extraLinks', { min: 0, max: 1, step: 0.05 })

    const generateController = folder.addButton({ title: 'generate' }).on('click', () => {
      generateController.disabled = true
      setTimeout(() => (generateController.disabled = false), 2000)

      delete this.level
      UI.levelText.set(`DEBUG`).show()

      this.grid?.dispose()
      this.grid = new Grid(this.generateParams)
    })

    gridConfig.setDebug(this.debug)
  }
}
