import * as TweakpaneEssentialsPlugin from '@tweakpane/plugin-essentials'
import { Pane } from 'tweakpane'

export default class GUI {
  constructor() {
    this.root = new Pane({ title: 'DEBUG' })
    this.root.registerPlugin(TweakpaneEssentialsPlugin)

    this.root.element.parentElement.style.width = '350px'
    this.root.element.parentElement.style.zIndex = 999

    this.root
      .addButton({ title: 'reset' })
      .on('click', () => this.root.importState(JSON.parse(this.defaults)))

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
    localStorage.setItem('debug', JSON.stringify(state))
  }

  loadState = () => {
    const state = localStorage.getItem('debug')
    if (state) {
      this.root.importState(JSON.parse(state))
      localStorage.removeItem('debug')
    }
  }
}
