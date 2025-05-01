import gsap from 'gsap'
import Button from './button'
import Element from './element'

export default class Modal extends Element {
  static instance = new Modal()
  #closeable = true

  constructor() {
    if (Modal.instance) return Modal.instance
    super('#modal')

    this.closeButton = new Button('#modal-close')
    this.closeButton.onClick(this.close.bind(this))
  }

  open(selector) {
    const content = typeof selector === 'string' ? document.querySelector(selector) : selector
    if (!content) return

    this.content = content.cloneNode(true)
    this.content.classList.remove('hidden')
    this.element.append(this.content)

    this.beforeOpenCallback && this.beforeOpenCallback(this.content)

    gsap.set(this.element, { rotate: -60 })
    gsap.timeline().to(this.element, {
      scale: 1,
      rotate: 0,
      duration: 0.5,
      ease: 'back.out',
      onComplete: () => {
        this.#closeable && this.closeButton.show()
        delete this.beforeOpenCallback
        this.#closeable = true
      },
    })

    return this
  }

  close() {
    gsap.timeline().to(this.element, {
      scale: 0,
      rotate: -60,
      duration: 0.25,
      ease: 'back.in',
      onStart: () => this.closeButton.hide(),
      onComplete: () => this.content.remove(),
    })

    return this
  }

  disableClose() {
    this.#closeable = false
    return this
  }

  beforeOpen(callback) {
    this.beforeOpenCallback = callback
    return this
  }
}
