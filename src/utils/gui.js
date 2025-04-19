import Stats from 'three/examples/jsm/libs/stats.module.js'
import { Pane } from 'tweakpane'

export default class GUI {
  constructor() {
    this.root = new Pane({ title: 'DEBUG' })

    this.root.element.parentElement.style.width = '350px'
    this.root.element.parentElement.style.zIndex = 999

    addEventListener('beforeunload', this.saveState)
    addEventListener('keydown', event => event.key === 'R' && this.loadState())
    addEventListener('keydown', event => event.key === 'C' && this.clearState())
    this.root.addButton({ title: 'load previuos state [R]' }).on('click', this.loadState)
    this.root.addButton({ title: 'clear previuos state [C]' }).on('click', this.clearState)

    // Stats
    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)
  }

  saveState = () => {
    const state = this.root.exportState()
    localStorage.setItem('debug', JSON.stringify(state))
  }

  loadState = () => {
    const state = localStorage.getItem('debug')
    if (state) {
      this.root.importState(JSON.parse(state))
    }
  }

  clearState = () => {
    localStorage.removeItem('debug')
  }
}
