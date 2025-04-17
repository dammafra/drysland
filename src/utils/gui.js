import Experience from '@experience'
import { AxesHelper, GridHelper } from 'three'
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

    this.experience = Experience.instance
    this.scene = this.experience.scene

    this.axesHelper = new AxesHelper(10)
    this.axesHelper.position.y = 0.001

    this.gridHelper = new GridHelper(25, 50)

    this.scene.add(this.axesHelper, this.gridHelper)

    this.root.addBinding(this.axesHelper, 'visible', { label: 'axes helper' })
    this.root.addBinding(this.gridHelper, 'visible', { label: 'grid helper' })

    // Global access
    window.Experience = Experience

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
