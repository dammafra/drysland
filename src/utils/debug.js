export default class Debug {
  static get enabled() {
    return import.meta.env.DEV || window.location.hash === '#debug'
  }

  static {
    const debugConsole = { ...window.console }

    for (let key in debugConsole) {
      if (typeof debugConsole[key] !== 'function') continue

      const func = debugConsole[key]
      debugConsole[key] = function () {
        Debug.enabled && func.apply(debugConsole, arguments)
      }
    }

    debugConsole.ping = () => debugConsole.log('pong')
    window.debug = debugConsole
  }

  static async init() {
    if (!Debug.enabled) return

    const { default: GUI } = await import('./gui.js')
    const gui = new GUI()
    gui.storeDefaults()

    return gui
  }
}
