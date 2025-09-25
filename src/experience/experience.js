import WaterBlock from '@blocks/water-block'
import BlocksConfig from '@config/blocks'
import { default as GridConfig } from '@config/grid'
import LandscapeConfig from '@config/landscape'
import OceanConfig from '@config/ocean'
import Grid from '@grid/grid'
import Menu from '@ui/menu'
import Modal from '@ui/modal'
import UI from '@ui/ui'
import JSConfetti from 'js-confetti'
import { Scene } from 'three'
import Camera from './camera'
import Environment from './environment'
import Pointer from './pointer'
import Renderer from './renderer'
import Resources from './resources'
import Settings from './settings'
import Sizes from './sizes'
import SoundControls from './sound-controls'
import SoundPlayer from './sound-player'
import State from './state'
import Time from './time'

export default class Experience {
  /** @type {Experience} */
  static instance

  static async init(canvasSelector, loading) {
    return new Experience(document.querySelector(canvasSelector), loading)
  }

  constructor(canvas, loading) {
    if (Experience.instance) return Experience.instance
    Experience.instance = this

    // Options
    this.canvas = canvas
    this.canvas.addEventListener('mousedown', () => this.canvas.classList.add('grabbing'))
    this.canvas.addEventListener('mouseup', () => this.canvas.classList.remove('grabbing'))

    this.loading = loading
    this.settings = new Settings()
    this.confetti = new JSConfetti()

    BlocksConfig.init()
    GridConfig.init()
    LandscapeConfig.init()
    OceanConfig.init()

    // Setup
    this.time = new Time()
    this.sizes = new Sizes()
    this.resources = new Resources(loading)
    this.scene = new Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()

    this.pointer = new Pointer()

    // Events
    this.settings.addEventListener('change', this.applySettings)
    this.sizes.addEventListener('resize', this.resize)
    this.time.addEventListener('tick', this.update)
    this.resources.addEventListener('ready', this.ready)

    document.addEventListener('keypress', e => {
      if (!this.grid || e.code !== 'Space') return
      this.grid.riverBlocks.find(b => b.material.uniforms.uHovered.value)?.onClick()
    })

    document.addEventListener('keydown', e => {
      if (!this.grid || e.code !== 'Escape' || UI.menuButton.disabled) return
      this.openMenu()
    })
  }

  applySettings = () => {
    this.camera.applySettings()
    this.renderer.applySettings()
    this.environment.applySettings()
    delete WaterBlock.material
  }

  resize = () => {
    this.camera.resize()
    this.renderer.resize()
  }

  ready = () => {
    this.level = 0
    this.loading.stop()

    this.soundPlayer = new SoundPlayer()
    this.environment = new Environment()
    this.menu = new Menu()
    this.soundControls = new SoundControls()

    UI.startButton.onClick(this.start.bind(this))
    UI.creditsButton.onClick(() => Modal.instance.open('#credits.modal'))
    UI.menuButton.onClick(this.openMenu.bind(this))
    UI.nextButton.onClick(async () => {
      await PokiSDK.commercialBreak(() => this.soundControls.hide())
      this.nextLevel()
    })

    this.start()
  }

  async start() {
    this.menu.close()
    await this.nextLevel()

    UI.menuButton.show()
    UI.levelText.show()
  }

  async nextLevel() {
    PokiSDK.gameplayStart()

    this.soundControls.show()

    const state = await this.load()
    const level = state ? state.level : this.level + 1
    const blocks = state?.blocks

    this.level = level
    UI.levelText.set(`Level ${this.level}`)

    this.levelParams = GridConfig.instance.generateLevel(this.level - 1)
    this.grid?.dispose()
    this.grid = new Grid({ level, blocks, ...this.levelParams })
  }

  levelStart() {
    UI.nextButton.hide()
    this.setGameMode()
  }

  levelComplete() {
    PokiSDK.gameplayStop()

    this.soundPlayer.play('success')
    if (this.level) UI.nextButton.show({ wiggle: true })
    this.setExplorationMode()
    this.showConfetti()
  }

  openMenu() {
    PokiSDK.gameplayStop()

    this.grid?.dispose()
    delete this.grid

    this.level--
    this.loaded = false

    this.soundControls.hide()
    UI.menuButton.hide()
    UI.levelText.hide()
    UI.tutorialText.hide()
    UI.nextButton.hide()

    this.camera.autoRotate = false
    UI.startButton.setLabel('Resume')
    this.menu.open()
  }

  setGameMode(block) {
    this.camera.setGameControls(block)
    this.grid?.setShadows(false)
  }

  setExplorationMode() {
    this.camera.setExplorationControls(this.levelParams.radius)
    this.grid?.setShadows(true)
  }

  update = () => {
    this.camera.update()
    this.pointer.update()
    this.renderer.update()

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

  showConfetti() {
    this.confetti.addConfetti({
      confettiColors: [
        '#ff6f91',
        '#6fc3df',
        '#77dd77',
        '#fff75e',
        '#c08ef3',
        '#ffb347',
        '#9dfdcf',
        '#cba0ff',
        '#ffd1a4',
        '#8be8fd',
      ],
    })
  }
}
