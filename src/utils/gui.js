import * as TweakpaneEssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'

export default class GUI {
  static #key = 'debug'

  constructor() {
    this.root = new Pane({ title: 'DEBUG' })
    this.root.registerPlugin(TweakpaneEssentialsPlugin)

    this.root.element.parentElement.style.width = '350px'
    this.root.element.parentElement.style.zIndex = 999
    this.root.element.lastChild.style.maxHeight = 'calc(100vh - 40px)'
    this.root.element.lastChild.style.overflow = 'scroll'

    this.root.addButton({ title: 'back to previous GUI state' }).on('click', this.loadState)
    this.root.addButton({ title: 'reset GUI to defaults' }).on('click', this.resetState)

    this.stats = this.root.addBlade({
      view: 'fpsgraph',
      label: 'FPS',
      rows: 2,
    })

    addEventListener('beforeunload', this.saveState)
  }

  storeDefaults() {
    const defaults = this.root.exportState()
    this.defaults = JSON.stringify(defaults)
  }

  saveState = () => {
    const state = this.root.exportState()
    localStorage.setItem(GUI.#key, JSON.stringify(state))
  }

  loadState = () => {
    const state = localStorage.getItem(GUI.#key)
    if (state) {
      this.root.importState(JSON.parse(state))
      localStorage.removeItem(GUI.#key)
    }
  }

  resetState = () => {
    this.root.importState(JSON.parse(this.defaults))
  }
}
