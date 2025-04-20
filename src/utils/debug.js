export default class Debug {
  static get enabled() {
    return import.meta.env.DEV || window.location.hash === '#debug'
  }

  static async init(experience) {
    if (!Debug.enabled) return

    const { default: GUI } = await import('./gui.js')
    this.gui = new GUI()

    // Global access
    window.experience = experience

    experience.setDebug()
    for (const prop of Object.keys(experience)) {
      experience[prop].setDebug && experience[prop].setDebug()
    }

    this.gui.storeDefaults()
    this.gui.loadState()
  }
}
