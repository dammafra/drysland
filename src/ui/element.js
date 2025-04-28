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
  }

  hide() {
    gsap.to(this.element, {
      scale: 0,
      duration: 0.5,
      ease: 'back.in',
    })
  }

  disable() {
    this.element.style.pointerEvents = 'none'
  }

  enable() {
    this.element.style.pointerEvents = 'auto'
  }
}
