export default class Debug {
  static get enabled() {
    return import.meta.env.DEV || window.location.hash === '#debug'
  }

  static async init() {
    if (!Debug.enabled) return

    const { default: GUI } = await import('./gui.js')
    this.gui = new GUI()
  }
}
