import gsap from 'gsap'

export default class Element {
  get disabled() {
    return this.element.style.pointerEvents === 'none'
  }

  constructor(selectorOrElement) {
    this.element =
      typeof selectorOrElement === 'string'
        ? document.querySelector(selectorOrElement)
        : selectorOrElement

    gsap.set(this.element, { scale: 0 })
    this.element.classList.remove('hidden')
    this.element.setAttribute('tabindex', '-1')
  }

  show(options = { wiggle: false }) {
    this.animation?.kill()

    this.animation = gsap.to(this.element, {
      scale: 1,
      duration: 0.5,
      ease: 'back.out',
      onComplete: () => options.wiggle && this.element.classList.add('animate-wiggle'),
    })

    return this
  }

  hide() {
    this.animation?.kill()

    this.animation = gsap.to(this.element, {
      scale: 0,
      duration: 0.5,
      ease: 'back.in',
      onStart: () => this.element.classList.remove('animate-wiggle'),
    })

    return this
  }

  disable(applyClass) {
    applyClass && this.element.classList.add('disabled')
    this.element.style.pointerEvents = 'none'
    return this
  }

  enable() {
    this.element.classList.remove('disabled')
    this.element.style.pointerEvents = 'auto'
    return this
  }
}
