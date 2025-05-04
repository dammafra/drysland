import gsap from 'gsap'
import Button from './button'
import Element from './element'

export default class Modal extends Element {
  static instance = new Modal()

  constructor() {
    if (Modal.instance) return Modal.instance
    super('.modal-content')

    this.closeButton = new Button('#modal-close')
    this.closeButton.onClick(this.close.bind(this))
  }

  open(selector, options = { disableClose: false, onBeforeOpen: undefined }) {
    const content = typeof selector === 'string' ? document.querySelector(selector) : selector
    if (!content) return

    this.content = content.cloneNode(true)
    this.content.classList.remove('hidden')
    this.element.append(this.content)

    options.onBeforeOpen && options.onBeforeOpen(this.content)

    gsap.set(this.element, { rotate: -60 })
    gsap.timeline().to(this.element, {
      scale: 1,
      rotate: 0,
      duration: 0.5,
      ease: 'back.out',
      onComplete: () => {
        if (options.disableClose) return
        this.closeButton.show()
      },
    })

    document.addEventListener('keydown', this.onKeydown)
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

    document.removeEventListener('keydown', this.onKeydown)
    return this
  }

  onKeydown = e => {
    e.code === 'Escape' && this.close()
  }
}
