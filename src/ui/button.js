import gsap from 'gsap'
import Element from './element'
import Text from './text'

export default class Button extends Element {
  constructor(selector) {
    super(selector)
  }

  wiggle() {
    this.element.classList.add('animate-wiggle')
    return this
  }

  hide() {
    this.element.classList.remove('animate-wiggle')
    return super.hide()
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
      this.element.blur()
    }

    return this
  }

  setLabel(content) {
    if (!this.label) {
      this.label = new Text(this.element.querySelector('label'))
    }

    this.label.set(content).show()
    return this
  }
}
