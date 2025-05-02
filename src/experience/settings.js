import WaterBlock from '@blocks/water-block'
import gridConfig from '@config/grid'
import Experience from '@experience'
import Modal from '@ui/modal'
import UI from '@ui/ui'

export default class Settings {
  static #key = 'settings'

  constructor() {
    this.experience = Experience.instance
    this.renderer = this.experience.renderer
    this.environment = this.experience.environment
    this.debug = this.experience.debug

    this.load()
    this.apply()

    UI.settingsButton.onClick(() =>
      Modal.instance.open('.settings', {
        onBeforeOpen: content => {
          const graphicsOptions = content.querySelectorAll('input[name="graphics"]')
          graphicsOptions.forEach(radio => {
            radio.value === this.settings.graphics && radio.setAttribute('checked', '')
            radio.setAttribute('tabIndex', '-1')
            radio.addEventListener('change', e => this.setGraphics(e.target.value))
          })
        },
      }),
    )

    this.setDebug()
  }

  apply() {
    this.setGraphics(this.settings.graphics)
  }

  setGraphics(option) {
    gridConfig.ocean = {
      ...gridConfig.ocean,
      ...gridConfig.ocean.options[option],
      transparent: option === 'quality',
    }

    gridConfig.landscape = { ...gridConfig.landscape, ...gridConfig.landscape.options[option] }
    gridConfig.landscape.wind = {
      ...gridConfig.landscape.wind,
      ...gridConfig.landscape.wind.options[option],
    }
    gridConfig.landscape.seagulls = {
      ...gridConfig.landscape.seagulls,
      ...gridConfig.landscape.seagulls.options[option],
    }

    this.renderer.instance.shadowMap.enabled = option === 'quality'
    option === 'quality' ? this.environment.setLensflare() : this.environment.disposeLensFlare()
    delete WaterBlock.material

    this.settings.graphics = option
    this.save('graphics', option)
  }

  // persist
  ensureDefault() {
    if (!localStorage.getItem(Settings.#key)) {
      localStorage.setItem(Settings.#key, JSON.stringify({ graphics: 'quality' }))
    }
  }

  load() {
    this.ensureDefault()
    const settings = JSON.parse(localStorage.getItem(Settings.#key))
    this.settings = settings
  }

  save(key, value) {
    this.ensureDefault()

    const settings = JSON.parse(localStorage.getItem(Settings.#key))
    settings[key] = value

    localStorage.setItem(Settings.#key, JSON.stringify(settings))
  }

  setDebug() {
    if (!this.debug) return

    this.debug.root.addBinding(this.settings, 'graphics', {
      label: 'graphics settings',
      readonly: true,
    })
  }
}
