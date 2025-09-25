import Modal from '@ui/modal'
import RadioGroup from '@ui/radio-group'
import Text from '@ui/text'
import UI from '@ui/ui'
import { EventDispatcher } from 'three'

export default class Settings extends EventDispatcher {
  static #key = 'drysland-settings'

  get isGraphicsQuality() {
    return this.settings.graphics === 'quality'
  }

  constructor() {
    super()
  }

  async init() {
    await this.load()
    this.update()

    UI.settingsButton.onClick(() => {
      Modal.instance.open('#settings.modal', { onBeforeOpen: this.onBeforeSettingsModalOpen })
    })
  }

  update() {
    for (const key in this.settings) {
      this.save(key, this.settings[key])
      this.dispatchEvent({ type: 'change', [key]: this.settings[key] })
    }
  }

  needsRestart() {
    this.showRestartWarning = true
    this.restartWaringText.show()
  }

  onBeforeSettingsModalOpen = content => {
    this.restartWaringText = new Text(content.querySelector('#restart-warning'))
    this.showRestartWarning && this.restartWaringText.show()

    const graphicsRadios = content.querySelectorAll('input[name="graphics"]')
    this.graphicsRadioGroup = new RadioGroup(graphicsRadios)
      .setChecked(this.settings.graphics)
      .onChange(option => {
        this.settings.graphics = option
        this.update()
      })
  }

  // persist
  async ensureDefault() {
    if (!(await bridge.storage.get(Settings.#key))) {
      await bridge.storage.set(Settings.#key, { graphics: 'quality' })
    }
  }

  async load() {
    await this.ensureDefault()
    this.settings = await bridge.storage.get(Settings.#key)
  }

  async save(key, value) {
    this.ensureDefault()

    const settings = await bridge.storage.get(Settings.#key)
    settings[key] = value

    await bridge.storage.set(Settings.#key, settings)
  }
}
