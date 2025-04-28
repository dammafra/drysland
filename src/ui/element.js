import gsap from 'gsap'

export default class Element {
  constructor(id) {
    this.element = document.getElementById(id)

    gsap.set(this.element, { scale: 0 })
    this.element.classList.remove('hidden')
  }

  show() {
    gsap.to(this.element, {
      scale: 1,
      duration: 0.5,
      ease: 'back.out',
    })

    return this
  }

  hide() {
    gsap.to(this.element, {
      scale: 0,
      duration: 0.5,
      ease: 'back.in',
    })

    return this
  }

  disable() {
    this.element.style.pointerEvents = 'none'
    return this
  }

  enable() {
    this.element.style.pointerEvents = 'auto'
    return this
  }
}
