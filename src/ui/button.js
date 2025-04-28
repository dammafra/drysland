import gsap from 'gsap'
import Element from './element'

export default class Button extends Element {
  constructor(id) {
    super(id)
  }

  onClick(callback) {
    this.element.onclick = async () => {
      this.disable()

      gsap
        .timeline({ onComplete: this.enable.bind(this) })
        .to(this.element, {
          rotation: 60,
          duration: 0.25,
          ease: 'back.inOut',
        })
        .to(this.element, {
          rotation: 0,
          duration: 0.25,
          ease: 'back.inOut',
        })

      callback()
    }
  }
}
