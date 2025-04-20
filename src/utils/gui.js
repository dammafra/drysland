import Stats from 'three/examples/jsm/libs/stats.module.js'
import { Pane } from 'tweakpane'

export default class GUI {
  constructor() {
    this.root = new Pane({ title: 'DEBUG' })

    this.root.element.parentElement.style.width = '350px'
    this.root.element.parentElement.style.zIndex = 999

    // Stats
    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)

    addEventListener('beforeunload', this.saveState)
    this.root
      .addButton({ title: 'reset' })
      .on('click', () => this.root.importState(JSON.parse(this.defaults)))
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
