import gsap from 'gsap'
import Experience from './experience'
export default class Loading {
  constructor() {
    this.experience = Experience.instance
    this.time = this.experience.time

    this.element = document.querySelector('.loading')
    this.spinner = this.element.querySelector('.spinner')

    gsap.to(this.spinner, {
      rotation: 360,
      duration: 2,
      ease: 'power2.inOut',
      repeat: -1,
    })
  }

  ready() {
    this.element.classList.add('end')
    setTimeout(this.dispose, 500)
  }

  dispose = () => {
    this.element.remove()
    this.element = null
  }
}
