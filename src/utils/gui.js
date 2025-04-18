import Stats from 'three/examples/jsm/libs/stats.module.js'
import { Pane } from 'tweakpane'

export default class GUI {
  constructor() {
    this.root = new Pane({ title: 'DEBUG' })

    this.root.element.parentElement.style.width = '350px'
    this.root.element.parentElement.style.zIndex = 999

    this.preserveChanges = false
    this.root.addBinding(this, 'preserveChanges', { label: 'preserve changes' })
    addEventListener('beforeunload', this.saveState)

    // Stats
    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)
  }

  saveState = () => {
    if (!this.preserveChanges) return

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
