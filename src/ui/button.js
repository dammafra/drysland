import gsap from 'gsap'
import Element from './element'

export default class Button extends Element {
  constructor(id) {
    super(id)
  }

  show() {
    gsap.set(this.element, { rotation: 0 })
    super.show()
  }

  onClick(callback) {
    this.element.onclick = async () => {
      await gsap.to(this.element, { rotation: 60, duration: 0.25, ease: 'back.inOut' })
      callback()
    }
  }

  toggle() {
    gsap.to(this.element, { rotation: 0, duration: 0.25, ease: 'back.inOut' })
    this.element.classList.toggle('!text-red-700')
  }
}
