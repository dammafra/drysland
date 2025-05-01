import setConfigDebug from '@config/debug'
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
import Settings from './settings'
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
      UI.authToggle
        .setLabel(user ? 'Logout' : 'Login')
        .toggle(!user)
        .enable()
      UI.startButton.enable()
      user && State.instance.sync()
    })
    UI.authToggle.onClick(() => Auth.instance.user ? Auth.instance.signOut() : Auth.instance.signIn()).disable(true) //prettier-ignore
    UI.startButton.onClick(this.start.bind(this)).disable(true)
    UI.creditsButton.onClick(() => Modal.instance.open('.credits'))
    UI.menuButton.onClick(this.openMenu.bind(this))
    UI.nextButton.onClick(this.nextLevel.bind(this))
    UI.backButton.onClick(this.setExplorationMode.bind(this))
  }

  start() {
    this.menu.close()

    this.settings = new Settings()
    UI.fullscreenToggle.show()

    this.nextLevel()
  }

  async nextLevel() {
    const state = await this.load()
    const level = state ? state.level : this.level + 1
    const blocks = state?.blocks

    this.level = level
    UI.levelText.set(`Level ${this.level}`).show()

    this.levelParams = gridConfig.levels.at(this.level - 1) || gridConfig.levels.at(-1)
    this.grid?.dispose()
    this.grid = new Grid({ level, blocks, ...this.levelParams })
  }

  levelStart() {
    UI.nextButton.hide()
    this.setExplorationMode()
  }

  levelComplete() {
    this.soundPlayer.play('success')
    if (this.level) UI.nextButton.wiggle().show()
    this.setExplorationMode()
  }

  openMenu() {
    this.grid?.dispose()
    this.level--
    this.loaded = false

    this.settings.hide()
    UI.menuButton.hide()
    UI.fullscreenToggle.hide()
    UI.levelText.hide()
    UI.tutorialText.hide()
    UI.backButton.hide()
    UI.nextButton.hide()

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
    this.camera.setExplorationControls(this.levelParams.radius)
    this.grid?.setShadows(true)
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
    const axesHelper = new AxesHelper(helpersSize)
    axesHelper.visible = false
    axesHelper.position.x = -helpersSize * 0.5
    axesHelper.position.y = 1.01
    axesHelper.position.z = -helpersSize * 0.5

    const gridHelper = new GridHelper(helpersSize, helpersSize * 2, 'gray', 'gray')
    gridHelper.visible = false
    gridHelper.position.y = 1

    this.scene.add(axesHelper, gridHelper)

    this.debug.root
      .addBinding(axesHelper, 'visible', { label: 'helpers', index: 3 })
      .on('change', event => {
        axesHelper.visible = event.value
        gridHelper.visible = event.value

        this.scene.backgroundIntensity = event.value ? 0 : 1
        this.environment.shadowHelper.visible = event.value
        this.camera.controls.maxDistance = event.value ? 50 : 25
      })

    debug.groupCollapsed('gridConfig.levels')
    debug.log(gridConfig.levels)
    debug.groupEnd()

    const folder = this.debug.root.addFolder({
      title: '⬢ grid',
      index: 4,
      expanded: false,
    })

    const generateParams = {
      radius: 1,
      coverage: 0.5,
      extraLinks: 0,
      minDeadEnds: 2,
    }
    folder.addBinding(generateParams, 'radius', { min: 1, max: 10, step: 1 })
    folder.addBinding(generateParams, 'coverage', { min: 0.1, max: 1, step: 0.1 })
    folder.addBinding(generateParams, 'extraLinks', { min: 0, max: 0.5, step: 0.05 })
    folder.addBinding(generateParams, 'minDeadEnds', { min: 2, max: 10, step: 1 })

    const onGenerateChange = () => {
      disableGridPanes()
      updateSelectLevelPane()

      delete this.level
      this.levelParams = generateParams
      UI.levelText.set(`DEBUG`).show()

      this.grid?.dispose()
      this.grid = new Grid(generateParams)
    }

    const onSelectLevelChange = e => {
      disableGridPanes()

      this.level = e.value
      this.nextLevel()
    }

    const updateSelectLevelPane = (level = '-') => {
      selectLevelPane.off('change', onSelectLevelChange)
      selectLevelPane.controller.value.setRawValue(level)
      selectLevelPane.on('change', onSelectLevelChange)
    }

    const disableGridPanes = () => {
      selectLevelPane.disabled = true
      generatePane.disabled = true
      setTimeout(() => {
        selectLevelPane.disabled = false
        generatePane.disabled = false
      }, 2000)
    }

    const generatePane = folder.addButton({ title: 'generate' }).on('click', onGenerateChange)
    const selectLevelPane = folder
      .addBlade({
        view: 'list',
        label: 'select level',
        options: [{ text: '-', value: '-' }].concat(
          gridConfig.levels.map((_, i) => ({ text: `${i + 1}`, value: i })),
        ),
        value: '-',
      })
      .on('change', onSelectLevelChange)

    this.generateParams = generateParams
    this.updateSelectLevelPane = updateSelectLevelPane

    setConfigDebug(this.debug)
  }
}
