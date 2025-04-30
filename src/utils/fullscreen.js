export default class Fullscreen {
  static get isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  }

  // prettier-ignore
  static get isSupported() {
    return document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen
  }

  static get element() {
    return document.fullscreenElement || document.webkitFullscreenElement
  }

  static init(toggleSelector) {
    if (!toggleSelector) {
      console.warn('[Fullscreen] missing toggle selector, skipping...')
      return
    }

    Fullscreen.toggle = document.querySelector(toggleSelector)

    if (Fullscreen.isStandalone) {
      document.body.classList.add('fullscreen', 'standalone')
      Fullscreen.toggle.remove()
      return
    }

    if (!Fullscreen.isSupported) {
      Fullscreen.toggle.remove()
      return
    }

    Fullscreen.toggle.addEventListener('click', () => {
      if (Fullscreen.element) {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      } else {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen()
        }
      }

      document.body.classList.toggle('fullscreen')
    })

    document.addEventListener('fullscreenchange', () =>
      document.body.classList.toggle('fullscreen', Fullscreen.element),
    )
  }
}
